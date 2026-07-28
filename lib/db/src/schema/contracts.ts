import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("processing"), // processing, ready, error
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const contractChunksTable = pgTable("contract_chunks", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contractsTable.id),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contractEmbeddingsTable = pgTable("contract_embeddings", {
  id: serial("id").primaryKey(),
  chunkId: integer("chunk_id").notNull().references(() => contractChunksTable.id),
  embedding: text("embedding").notNull(), // Store as JSON string
  model: text("model").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contractAnalysesTable = pgTable("contract_analyses", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contractsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  analysisType: text("analysis_type").notNull(), // review, explanation, negotiation
  result: jsonb("result").notNull(),
  summary: text("summary"),
  riskLevel: text("risk_level").notNull(), // low, medium, high
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiDraftsTable = pgTable("ai_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  documentId: integer("document_id").references(() => usersTable.id),
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  model: text("model").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, uploadedAt: true, processedAt: true });
export const insertContractChunkSchema = createInsertSchema(contractChunksTable).omit({ id: true, createdAt: true });
export const insertContractEmbeddingSchema = createInsertSchema(contractEmbeddingsTable).omit({ id: true, createdAt: true });
export const insertContractAnalysisSchema = createInsertSchema(contractAnalysesTable).omit({ id: true, createdAt: true });
export const insertAiDraftSchema = createInsertSchema(aiDraftsTable).omit({ id: true, createdAt: true });

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
export type ContractChunk = typeof contractChunksTable.$inferSelect;
export type ContractEmbedding = typeof contractEmbeddingsTable.$inferSelect;
export type ContractAnalysis = typeof contractAnalysesTable.$inferSelect;
export type AiDraft = typeof aiDraftsTable.$inferSelect;
