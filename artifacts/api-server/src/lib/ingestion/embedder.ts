import { aiService } from "../ai";
import { LegalChunk } from "./types";
import { logger } from "../logger";

export class Embedder {
  private concurrencyLimit = 5;

  public async embedChunks(chunks: LegalChunk[], onProgress?: (embeddedCount: number, total: number) => void): Promise<LegalChunk[]> {
    const embeddedChunks: LegalChunk[] = [];
    let currentIndex = 0;

    while (currentIndex < chunks.length) {
      const batch = chunks.slice(currentIndex, currentIndex + this.concurrencyLimit);
      
      const promises = batch.map(async (chunk) => {
        try {
          const embedding = await aiService.generateEmbedding(chunk.content);
          return { ...chunk, embedding };
        } catch (error) {
          logger.error(`Failed to embed chunk (hash: ${chunk.contentHash}):`, error);
          throw error;
        }
      });

      const results = await Promise.all(promises);
      embeddedChunks.push(...results);
      
      currentIndex += this.concurrencyLimit;
      if (onProgress) {
        onProgress(Math.min(currentIndex, chunks.length), chunks.length);
      }
    }

    return embeddedChunks;
  }
}
