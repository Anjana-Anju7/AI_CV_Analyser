import { openai } from '../lib/openai';
import { z } from 'zod';
import type { AnalysisResult } from '../types';

const SYSTEM_PROMPT = `
You are an expert ATS system, technical recruiter, and career coach.
Analyse the candidate's resume against the job description.
Return ONLY a valid JSON object — no markdown, no extra text — matching this exact shape:

{
  "overallScore": <integer 0–100>,
  "toneAndStyle": {
    "score": <integer 0–100>,
    "label": <"Strong" | "Good Start" | "Needs Work" | "Poor">,
    "highlights": [
      { "type": "positive" | "improvement", "text": "<specific feedback referencing actual resume content>" }
    ]
  },
  "content": {
    "score": <integer 0–100>,
    "label": <"Strong" | "Good Start" | "Needs Work" | "Poor">,
    "highlights": [
      { "type": "positive" | "improvement", "text": "<specific feedback>" }
    ]
  },
  "structure": {
    "score": <integer 0–100>,
    "label": <"Strong" | "Good Start" | "Needs Work" | "Poor">,
    "highlights": [
      { "type": "positive" | "improvement", "text": "<specific feedback>" }
    ]
  },
  "skills": {
    "score": <integer 0–100>,
    "label": <"Strong" | "Good Start" | "Needs Work" | "Poor">,
    "highlights": [
      { "type": "positive" | "improvement", "text": "<specific feedback>" }
    ]
  },
  "atsScore": <integer 0–100>,
  "atsItems": [
    { "type": "pass" | "warning", "message": "<specific actionable sentence referencing actual resume content>" }
  ],
  "missingKeywords": [<strings — keywords in JD not found in resume>],
  "presentKeywords": [<strings — important JD keywords found in resume>],
  "rewriteSuggestions": [
    { "original": "...", "suggested": "...", "reason": "..." }
  ],
  "seniorityMatch": "too junior" | "good fit",
  "summary": "<2–3 sentence plain English verdict>"
}

Scoring rules:
- toneAndStyle (15%): active voice, strong action verbs (no "helped", "worked on"), professional language, consistent tense
- content (30%): quantified achievements, specific impact metrics, bullet relevance to JD, no generic filler
- structure (25%): all key sections present (Summary, Experience, Education, Skills), logical order, ATS-friendly (no tables/columns/text boxes/images)
- skills (30%): % of critical JD keywords present, skill gap severity, technical vs soft skills balance
- overallScore: weighted average per above percentages
- atsScore: probability of passing ATS filters — penalise tables, columns, images, non-standard section headers, keyword absence
- label: score ≥75 = "Strong", 50–74 = "Good Start", 25–49 = "Needs Work", 0–24 = "Poor"
- atsItems: 4–6 items — mix of passes and warnings, each referencing specific resume content
- highlights: 3–4 per section, mix of positives and improvements, specific not generic
- rewriteSuggestions: pick the 3 weakest bullet points; use STAR format with metrics

Be honest and specific. Reference actual names, companies, and bullet points from the resume. No generic praise.
`.trim();

const SectionHighlightSchema = z.object({
  type: z.enum(['positive', 'improvement']),
  text: z.string(),
});

const SectionDetailSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(['Strong', 'Good Start', 'Needs Work', 'Poor']),
  highlights: z.array(SectionHighlightSchema).min(1).max(6),
});

const AnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  toneAndStyle: SectionDetailSchema,
  content: SectionDetailSchema,
  structure: SectionDetailSchema,
  skills: SectionDetailSchema,
  atsScore: z.number().min(0).max(100),
  atsItems: z.array(z.object({
    type: z.enum(['pass', 'warning']),
    message: z.string(),
  })).min(1).max(8),
  missingKeywords: z.array(z.string()),
  presentKeywords: z.array(z.string()),
  rewriteSuggestions: z.array(z.object({
    original: z.string(),
    suggested: z.string(),
    reason: z.string(),
  })),
  seniorityMatch: z.enum(['too junior', 'good fit']),
  summary: z.string(),
});

export async function analyseResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0.3,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `RESUME:\n${resumeText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
  });

  const raw = JSON.parse(response.choices[0].message.content!);
  const parsed = AnalysisResultSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('GPT response failed schema validation:', parsed.error);
    throw new Error('INVALID_AI_RESPONSE');
  }

  return parsed.data as AnalysisResult;
}
