import { getPinecone, INDEX_NAME } from '../lib/pinecone';
import { openai } from '../lib/openai';

const pineconeEnabled = !!process.env.PINECONE_API_KEY;

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8_000),
    dimensions: 1024,
  });
  return res.data[0].embedding;
}

export async function storeResumeEmbedding(
  analysisId: string,
  resumeText: string,
  metadata: { userId: string; overallScore: number }
) {
  if (!pineconeEnabled) return;
  const index = getPinecone().index(INDEX_NAME).namespace('resumes');
  const vector = await embed(resumeText);
  await index.upsert([{ id: analysisId, values: vector, metadata }]);
}

export async function storeJDEmbedding(
  jdId: string,
  jdText: string,
  metadata: { title: string; company?: string }
) {
  if (!pineconeEnabled) return;
  const index = getPinecone().index(INDEX_NAME).namespace('job-descriptions');
  const vector = await embed(jdText);
  await index.upsert([{ id: jdId, values: vector, metadata }]);
}

export async function findSimilarJDs(
  resumeText: string,
  topK = 5
): Promise<{ score: number; title: string; jdId: string }[]> {
  if (!pineconeEnabled) return [];
  const index = getPinecone().index(INDEX_NAME).namespace('job-descriptions');
  const vector = await embed(resumeText);
  const results = await index.query({ vector, topK, includeMetadata: true });

  return results.matches.map((m) => ({
    score: Math.round((m.score ?? 0) * 100),
    title: m.metadata?.title as string,
    jdId: m.id,
  }));
}

export async function getSemanticSimilarityScore(
  resumeText: string,
  jdText: string
): Promise<number> {
  if (!pineconeEnabled) return 0;
  const [resumeVec, jdVec] = await Promise.all([embed(resumeText), embed(jdText)]);

  const dot = resumeVec.reduce((sum, a, i) => sum + a * jdVec[i], 0);
  const magA = Math.sqrt(resumeVec.reduce((s, a) => s + a * a, 0));
  const magB = Math.sqrt(jdVec.reduce((s, b) => s + b * b, 0));
  const cosine = dot / (magA * magB);

  return Math.round(cosine * 100);
}
