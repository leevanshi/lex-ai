import { randomUUID } from "crypto";
import { db, legalDocumentsTable, legalChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { DocumentMetadata, IngestionJobResult, IngestionSource } from "./types";
import { Deduplicator } from "./deduplicator";
import { LegalChunker } from "./legalChunker";
import { Embedder } from "./embedder";
import { logger } from "../logger";

export class IngestionPipeline {
  private deduplicator: Deduplicator;
  private chunker: LegalChunker;
  private embedder: Embedder;

  constructor() {
    this.deduplicator = new Deduplicator();
    this.chunker = new LegalChunker();
    this.embedder = new Embedder();
  }

  public async processDocument(
    source: IngestionSource,
    metadata: DocumentMetadata
  ): Promise<IngestionJobResult> {
    const jobId = `job_${randomUUID()}`;
    logger.info({ jobId, title: metadata.title }, "Starting ingestion job");

    try {
      const rawText = source.text;
      if (!rawText) {
        throw new Error("Only direct text ingestion is supported in this example");
      }

      // Step 1: Deduplication
      const checksum = this.deduplicator.generateChecksum(rawText);
      const existingDocId = await this.deduplicator.checkExists(checksum);
      
      if (existingDocId) {
        logger.info({ jobId, existingDocId }, "Document already exists. Skipping ingestion.");
        return {
          jobId,
          documentId: existingDocId,
          status: "SKIPPED",
          totalChunks: 0,
          errorReason: "Document checksum already exists."
        };
      }

      // Step 2: Create Document Record
      const documentId = `doc_${randomUUID()}`;
      await db.insert(legalDocumentsTable).values({
        id: documentId,
        title: metadata.title,
        documentType: metadata.documentType,
        sourceUrl: metadata.sourceUrl,
        sourceName: metadata.sourceName,
        jurisdiction: metadata.jurisdiction,
        court: metadata.court,
        legislation: metadata.legislation,
        actName: metadata.actName,
        version: metadata.version,
        publicationDate: metadata.publicationDate,
        effectiveDate: metadata.effectiveDate,
        checksum,
        language: metadata.language || "en",
        status: "processing"
      });

      // Step 3: Legal-Aware Chunking
      const chunks = this.chunker.chunkDocument(rawText, metadata.documentType);
      if (chunks.length === 0) {
        throw new Error("Chunking resulted in 0 chunks.");
      }

      // Step 4: Embedding
      const embeddedChunks = await this.embedder.embedChunks(chunks, (done, total) => {
        logger.info({ jobId, done, total }, "Embedding progress");
      });

      // Step 5: Indexing to pgvector
      const chunkRecords = embeddedChunks.map(c => ({
        id: `chunk_${randomUUID()}`,
        documentId,
        parentSection: c.metadata.parentSection,
        chapter: c.metadata.chapter,
        sectionNumber: c.metadata.sectionNumber,
        heading: c.metadata.heading,
        content: c.content,
        normalizedContent: c.normalizedContent,
        tokenCount: c.tokenCount,
        contentHash: c.contentHash,
        embedding: c.embedding!,
        metadata: c.metadata.customData || {}
      }));

      // Insert in batches if very large, but Drizzle supports bulk inserts
      await db.insert(legalChunksTable).values(chunkRecords);

      // Update status
      await db.update(legalDocumentsTable)
        .set({ status: "active" })
        .where(eq(legalDocumentsTable.id, documentId));

      logger.info({ jobId, documentId }, "Ingestion completed successfully");

      return {
        jobId,
        documentId,
        status: "COMPLETED",
        totalChunks: embeddedChunks.length,
      };

    } catch (error: any) {
      logger.error({ jobId, err: error }, "Ingestion failed");
      return {
        jobId,
        documentId: "",
        status: "FAILED",
        totalChunks: 0,
        errorReason: error.message
      };
    }
  }
}

export const ingestionPipeline = new IngestionPipeline();
