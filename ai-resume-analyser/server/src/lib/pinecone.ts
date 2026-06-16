import { Pinecone } from '@pinecone-database/pinecone';

export const INDEX_NAME = process.env.PINECONE_INDEX ?? 'resume-analyser';

let _pinecone: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!_pinecone) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set');
    }
    _pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return _pinecone;
}
