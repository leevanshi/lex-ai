import { LegalChunker, type LegalMetadata, type LegalChunk } from "./legalChunker";
import { aiService } from "../ai";

export type IngestionStatus = 
  | "PENDING"
  | "DOWNLOADING"
  | "EXTRACTING"
  | "CLEANING"
  | "CHUNKING"
  | "EMBEDDING"
  | "INDEXING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING";

export interface IngestionJob {
  jobId: string;
  status: IngestionStatus;
  metadata: LegalMetadata;
  sourceText?: string;
  errorReason?: string;
}

export class IngestionPipeline {
  private chunker: LegalChunker;

  constructor() {
    this.chunker = new LegalChunker();
  }

  /**
   * Main entry point for processing a raw document into vector-ready chunks.
   * In a full production AWS environment, this would be an SQS worker or Step Function.
   */
  public async processDocument(
    rawText: string, 
    metadata: LegalMetadata, 
    onProgress?: (status: IngestionStatus) => void
  ) {
    const jobId = `job_${Date.now()}_${metadata.documentId}`;
    
    try {
      onProgress?.("CLEANING");
      const cleanedText = this.cleanText(rawText);

      onProgress?.("CHUNKING");
      const chunks = metadata.documentType === "act" || metadata.documentType === "rule"
        ? this.chunker.chunkAct(cleanedText, metadata)
        : this.chunker.chunkGeneric(cleanedText, metadata);

      if (chunks.length === 0) {
        throw new Error("Chunking resulted in 0 chunks. Document might be empty.");
      }

      onProgress?.("EMBEDDING");
      const embeddedChunks = await this.embedChunks(chunks);

      onProgress?.("INDEXING");
      await this.indexToDatabase(embeddedChunks);

      onProgress?.("COMPLETED");
      return {
        jobId,
        status: "COMPLETED",
        totalChunks: embeddedChunks.length,
      };

    } catch (error: any) {
      onProgress?.("FAILED");
      return {
        jobId,
        status: "FAILED",
        errorReason: error.message || "Unknown error during ingestion",
      };
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace, normalize quotes, strip invalid chars
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim();
  }

  private async embedChunks(chunks: LegalChunk[]): Promise<Array<LegalChunk & { embedding: number[] }>> {
    const embedded: Array<LegalChunk & { embedding: number[] }> = [];
    
    // Process sequentially for safety against rate limits. 
    // In production, we can batch these using Promise.all with a concurrency limiter.
    for (const chunk of chunks) {
      const vector = await aiService.generateEmbedding(chunk.text);
      embedded.push({
        ...chunk,
        embedding: vector,
      });
    }

    return embedded;
  }

  private async indexToDatabase(chunks: Array<LegalChunk & { embedding: number[] }>) {
    // Stub for Phase 6 Database Integration
    // This will map to drizzle-orm INSERT into the new vector tables
    console.log(`[Ingestion Pipeline] Indexed ${chunks.length} chunks to database (mock)`);
  }
}

export const ingestionPipeline = new IngestionPipeline();
