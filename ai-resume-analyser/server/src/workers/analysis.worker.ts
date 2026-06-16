import Queue from 'bull';
import { analyseResume } from '../services/analysis.service';
import { storeResumeEmbedding, getSemanticSimilarityScore } from '../services/match.service';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const analysisQueue = new Queue<{
  analysisId: string;
  resumeText: string;
  jobDescription: string;
}>('resume-analysis', {
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  },
});

analysisQueue.process(async (job) => {
  const { analysisId, resumeText, jobDescription } = job.data;

  await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'PROCESSING' } });
  await redis.publish(`analysis:${analysisId}`, JSON.stringify({ status: 'PROCESSING' }));

  try {
    const [result, semanticScore] = await Promise.all([
      analyseResume(resumeText, jobDescription),
      getSemanticSimilarityScore(resumeText, jobDescription),
    ]);

    result.overallScore = Math.round(result.overallScore * 0.8 + semanticScore * 0.2);

    const updated = await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETE',
        result: result as any,
        overallScore: result.overallScore,
      },
    });

    await storeResumeEmbedding(analysisId, resumeText, {
      userId: updated.userId,
      overallScore: result.overallScore,
    });

    await redis.publish(
      `analysis:${analysisId}`,
      JSON.stringify({ status: 'COMPLETE', result })
    );
  } catch (err: any) {
    console.error(`[Worker] Analysis ${analysisId} failed:`, err?.message ?? err);
    await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'FAILED' } });
    await redis.publish(`analysis:${analysisId}`, JSON.stringify({ status: 'FAILED' }));
    throw err;
  }
});
