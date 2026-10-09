import { pgTable, text, timestamp, vector, index, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const legalDocumentsTable = pgTable("legal_documents", {
  id: text("id").primaryKey(), 
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), 
  sourceUrl: text("source_url"),
  sourceName: text("source_name"),
  jurisdiction: text("jurisdiction"),
  court: text("court"),
  legislation: text("legislation"),
  actName: text("act_name"),
  version: text("version"),
  publicationDate: timestamp("publication_date", { withTimezone: true }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  checksum: text("checksum"),
  storageKey: text("storage_key"),
  language: text("language").notNull().default("en"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const legalChunksTable = pgTable("legal_chunks", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => legalDocumentsTable.id, { onDelete: "cascade" }),
  parentSection: text("parent_section"),
  chapter: text("chapter"),
  sectionNumber: text("section_number"),
  subsection: text("subsection"),
  heading: text("heading"),
  content: text("content").notNull(),
  normalizedContent: text("normalized_content"),
  tokenCount: integer("token_count"),
  contentHash: text("content_hash"),
  // using 1536 as standard for text-embedding-3-small and titan-embed-text-v1
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
  index("documentIdIndex").on(table.documentId),
]);

export const citationsTable = pgTable("citations", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => legalDocumentsTable.id, { onDelete: "cascade" }),
  chunkId: text("chunk_id").references(() => legalChunksTable.id, { onDelete: "set null" }),
  citationText: text("citation_text").notNull(),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocumentsTable);
export const insertLegalChunkSchema = createInsertSchema(legalChunksTable);
export const insertCitationSchema = createInsertSchema(citationsTable);

export type LegalDocument = typeof legalDocumentsTable.$inferSelect;
export type LegalChunkRecord = typeof legalChunksTable.$inferSelect;
export type CitationRecord = typeof citationsTable.$inferSelect;
