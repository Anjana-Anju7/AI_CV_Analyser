import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { storeJDEmbedding } from '../services/match.service';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const jds = await prisma.savedJD.findMany({
      where: { userId: authReq.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jds);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const { title, company, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const jd = await prisma.savedJD.create({
      data: { userId: authReq.user.id, title, company, description },
    });

    await storeJDEmbedding(jd.id, description, { title, company: company ?? '' });

    res.status(201).json(jd);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    await prisma.savedJD.deleteMany({
      where: { id: req.params.id, userId: authReq.user.id },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
