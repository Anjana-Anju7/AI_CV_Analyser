import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { analysisLimiter } from '../middleware/rateLimiter.middleware';
import { extractText, sanitiseText, validateMime } from '../services/resumeParser.service';
import { uploadResume } from '../lib/cloudinary';
import { analysisQueue } from '../workers/analysis.worker';
import { generateAnalysisPDF } from '../services/export.service';
import { openai } from '../lib/openai';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import type { AnalysisResult } from '../types';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// POST /api/analyses — upload resume + queue analysis
router.post(
  '/',
  authenticate,
  analysisLimiter,
  upload.single('resume'),
  async (req: Request, res: Response, next) => {
    const authReq = req as AuthRequest;
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { jobDescription } = req.body;
      if (!jobDescription || jobDescription.trim().length < 50) {
        return res
          .status(400)
          .json({ error: 'Job description must be at least 50 characters' });
      }

      validateMime(req.file.mimetype);

      const rawText = await extractText(req.file.buffer, req.file.mimetype);
      const cleanText = sanitiseText(rawText);
      const resumeUrl = await uploadResume(
        req.file.buffer,
        req.file.originalname,
        authReq.user.id
      );

      const analysis = await prisma.analysis.create({
        data: {
          userId: authReq.user.id,
          resumeUrl,
          resumeText: cleanText,
          jobDescription: jobDescription.slice(0, 8_000),
          status: 'QUEUED',
        },
      });

      await analysisQueue.add(
        { analysisId: analysis.id, resumeText: cleanText, jobDescription },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      );

      res.status(202).json({ id: analysis.id, status: 'QUEUED' });
    } catch (err: any) {
      if (err.message === 'INVALID_FILE_TYPE')
        return res.status(415).json({ error: 'Only PDF and DOCX files are accepted' });
      if (err.message === 'EMPTY_PDF' || err.message === 'EMPTY_DOCX')
        return res
          .status(422)
          .json({ error: 'Could not extract text from this file. Is it a scanned image?' });
      next(err);
    }
  }
);

// GET /api/analyses — paginated history
router.get('/', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: { userId: authReq.user.id, status: 'COMPLETE' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          status: true,
          overallScore: true,
          jobDescription: true,
          createdAt: true,
          resumeUrl: true,
        },
      }),
      prisma.analysis.count({ where: { userId: authReq.user.id, status: 'COMPLETE' } }),
    ]);

    res.json({ analyses, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id — single analysis
router.get('/:id', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const analysis = await prisma.analysis.findUnique({ where: { id: req.params.id } });
    if (!analysis || analysis.userId !== authReq.user.id)
      return res.status(404).json({ error: 'Not found' });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id/status — SSE stream
router.get('/:id/status', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const analysis = await prisma.analysis.findUnique({ where: { id: req.params.id } });

  if (!analysis || analysis.userId !== authReq.user.id) {
    res.status(404).end();
    return;
  }

  if (analysis.status === 'COMPLETE' || analysis.status === 'FAILED') {
    res.json({ status: analysis.status, result: analysis.result });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const subscriber = redis.duplicate();
  subscriber.on('error', (err) => {
    console.error('[SSE] Redis subscriber error:', err.message);
    try { res.end(); } catch {}
  });

  await subscriber.subscribe(`analysis:${req.params.id}`);

  subscriber.on('message', (_channel, message) => {
    try { res.write(`data: ${message}\n\n`); } catch {}
    const { status } = JSON.parse(message);
    if (status === 'COMPLETE' || status === 'FAILED') {
      subscriber.quit().catch(() => {});
      res.end();
    }
  });

  req.on('close', () => {
    subscriber.quit().catch(() => {});
  });
});

// POST /api/analyses/:id/rewrite — on-demand bullet rewrite
router.post('/:id/rewrite', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const { bullet, jobDescription } = req.body;
    if (!bullet) return res.status(400).json({ error: 'Bullet point text required' });

    const analysis = await prisma.analysis.findUnique({ where: { id: req.params.id } });
    if (!analysis || analysis.userId !== authReq.user.id)
      return res.status(404).json({ error: 'Not found' });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are an expert CV writer. Rewrite the given bullet point to better match the job description.
Use the STAR format where appropriate (Situation, Task, Action, Result).
Add specific metrics if they are plausible given the context.
Return JSON: { "suggested": "...", "reason": "..." }`,
        },
        {
          role: 'user',
          content: `BULLET: ${bullet}\n\nJOB DESCRIPTION:\n${jobDescription || analysis.jobDescription}`,
        },
      ],
    });

    const { suggested, reason } = JSON.parse(response.choices[0].message.content!);
    res.json({ original: bullet, suggested, reason });
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id/export — download PDF
router.get('/:id/export', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const analysis = await prisma.analysis.findUnique({ where: { id: req.params.id } });
    if (!analysis || analysis.userId !== authReq.user.id) return res.status(404).end();
    if (analysis.status !== 'COMPLETE')
      return res.status(409).json({ error: 'Analysis not yet complete' });

    const result = analysis.result as unknown as AnalysisResult;
    const pdf = await generateAnalysisPDF(result, analysis.jobDescription.slice(0, 60));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analysis-${req.params.id}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

// POST /api/analyses/:id/share — enable public link
router.post('/:id/share', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const token = crypto.randomBytes(12).toString('hex');
    await prisma.analysis.update({
      where: { id: req.params.id, userId: authReq.user.id },
      data: { shareToken: token, shareEnabled: true },
    });
    res.json({ shareUrl: `${process.env.CLIENT_URL}/shared/${token}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/shared/:token — public shared analysis (no auth)
router.get('/shared/:token', async (req: Request, res: Response, next) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { shareToken: req.params.token, shareEnabled: true },
    });
    if (!analysis) return res.status(404).json({ error: 'Not found' });
    res.json({ result: analysis.result, createdAt: analysis.createdAt });
  } catch (err) {
    next(err);
  }
});

export default router;
