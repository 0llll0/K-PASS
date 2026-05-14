/**
 * Pinecone vector search — TODO: Connect to real Pinecone
 */

import { MOCK_LOCAL_GUIDES } from './mockData';

export async function searchVectors(query, topK = 5) {
  // TODO: Initialize Pinecone client and search
  // const { Pinecone } = await import('@pinecone-database/pinecone');
  // const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  // const index = pc.Index('kpass-local-rules');
  // const results = await index.query({ vector: await embed(query), topK });
  return MOCK_LOCAL_GUIDES;
}

export async function upsertLocalRules(rules) {
  // TODO: Embed and upsert rules into Pinecone
  return { upserted: rules.length };
}
