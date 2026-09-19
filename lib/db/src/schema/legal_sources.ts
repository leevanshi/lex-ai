import { pgTable, text, timestamp, vector, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const legalDocumentsTable = pgTable("legal_documents", {
  id: text("id").primaryKey(), // using text so we can use meaningful IDs like 'constitution-india'
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), // act, rule, guideline, judgment
  jurisdiction: text("jurisdiction").notNull(),
  sourceUrl: text("source_url"),
  effectiveFrom: text("effective_from"), // string to support fuzzy dates like 'general-practice'
  version: text("version"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const legalChunksTable = pgTable("legal_chunks", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => legalDocumentsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  chapter: text("chapter"),
  section: text("section"),
  // using 1536 as standard for text-embedding-3-small and titan-embed-text-v1
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Optional: Add an HNSW index for much faster vector search at scale
  index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops"))
]);

export const insertLegalDocumentSchema = createInsertSchema(legalDocumentsTable);
export const insertLegalChunkSchema = createInsertSchema(legalChunksTable);

export type LegalDocument = typeof legalDocumentsTable.$inferSelect;
export type LegalChunkRecord = typeof legalChunksTable.$inferSelect;
