import { db } from "@workspace/db";
import { legalChunksTable, legalDocumentsTable } from "@workspace/db/schema";
import { cosineDistance, desc, sql, eq, and, gt } from "drizzle-orm";
import { aiService } from "./ai";
import { type LegalSource } from "./legalKnowledge";

export interface RetrievalFilters {
  documentType?: string;
  jurisdiction?: string;
  minScore?: number;
  limit?: number;
}

export class LegalRetrievalSystem {
  /**
   * Performs hybrid search (currently heavily semantic, with metadata filtering).
   * Finds the top relevant chunks for a given legal question.
   */
  public async retrieveRelevantSources(
    question: string,
    filters: RetrievalFilters = {}
  ): Promise<LegalSource[]> {
    const { limit = 5, minScore = 0.5, jurisdiction, documentType } = filters;
    
    // 1. Generate the embedding for the query
    const queryEmbedding = await aiService.generateEmbedding(question);

    // 2. Build the vector search query
    // Drizzle ORM cosineDistance returns distance, so similarity is 1 - distance
    const similarity = sql<number>`1 - (${cosineDistance(legalChunksTable.embedding, queryEmbedding)})`;
    
    // 3. Build conditions based on metadata filters
    const conditions = [];
    
    // We only want chunks that meet a minimum semantic similarity threshold
    conditions.push(gt(similarity, minScore));

    if (jurisdiction) {
      conditions.push(eq(legalDocumentsTable.jurisdiction, jurisdiction));
    }
    if (documentType) {
      conditions.push(eq(legalDocumentsTable.documentType, documentType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 4. Execute the query using Drizzle
    const results = await db
      .select({
        chunkId: legalChunksTable.id,
        documentId: legalDocumentsTable.id,
        title: legalDocumentsTable.title,
        documentType: legalDocumentsTable.documentType,
        jurisdiction: legalDocumentsTable.jurisdiction,
        section: legalChunksTable.section,
        chapter: legalChunksTable.chapter,
        sourceUrl: legalDocumentsTable.sourceUrl,
        effectiveFrom: legalDocumentsTable.effectiveFrom,
        version: legalDocumentsTable.version,
        language: legalDocumentsTable.language,
        text: legalChunksTable.text,
        similarity,
      })
      .from(legalChunksTable)
      .innerJoin(legalDocumentsTable, eq(legalChunksTable.documentId, legalDocumentsTable.id))
      .where(whereClause)
      .orderBy(desc(similarity))
      .limit(limit);

    // 5. Map Drizzle results to the standard LegalSource interface
    return results.map((result) => ({
      id: result.chunkId,
      title: result.title,
      documentType: result.documentType as any,
      jurisdiction: result.jurisdiction,
      section: result.section || result.chapter || "General",
      sourceUrl: result.sourceUrl || "",
      effectiveFrom: result.effectiveFrom || "",
      version: result.version || "",
      language: result.language,
      summary: "", // Generated dynamically during reranking in Phase 8
      text: result.text,
      keywords: [], // handled by vector now, not keyword arrays
      score: result.similarity
    }));
  }
}

export const retrievalSystem = new LegalRetrievalSystem();
