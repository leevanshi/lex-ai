import { db } from "@workspace/db";
import { contractChunksTable, contractEmbeddingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { aiService } from "./ai";

function parseEmbedding(value: string | null): number[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((number) => Number(number));
    }
  } catch {
    // Ignore invalid embeddings and fall back to empty similarity.
  }

  return [];
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (!left.length || !right.length || left.length !== right.length) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    dotProduct += a * b;
    leftMagnitude += a * a;
    rightMagnitude += b * b;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export async function retrieveRelevantContractChunks(contractId: number, question: string, limit = 5) {
  const queryEmbedding = await aiService.generateEmbedding(question);

  const rows = await db
    .select({
      id: contractChunksTable.id,
      content: contractChunksTable.content,
      metadata: contractChunksTable.metadata,
      embedding: contractEmbeddingsTable.embedding,
    })
    .from(contractChunksTable)
    .leftJoin(contractEmbeddingsTable, eq(contractChunksTable.id, contractEmbeddingsTable.chunkId))
    .where(eq(contractChunksTable.contractId, contractId))
    .limit(50);

  const scored = rows
    .map((row) => {
      const embedding = parseEmbedding(row.embedding ?? null);
      return {
        content: row.content,
        metadata: row.metadata,
        score: cosineSimilarity(queryEmbedding, embedding),
      };
    })
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  if (scored.length) {
    return scored;
  }

  return rows
    .slice(0, limit)
    .map((row) => ({
      content: row.content,
      metadata: row.metadata,
      score: 0,
    }));
}
