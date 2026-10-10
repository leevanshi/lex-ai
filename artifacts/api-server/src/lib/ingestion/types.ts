export type DocumentFormat = "pdf" | "html" | "txt";

export interface IngestionSource {
  url?: string;
  buffer?: Buffer;
  text?: string;
  format: DocumentFormat;
}

export interface DocumentMetadata {
  title: string;
  documentType: "act" | "rule" | "guideline" | "judgment" | "contract" | string;
  sourceUrl?: string;
  sourceName?: string;
  jurisdiction?: string;
  court?: string;
  legislation?: string;
  actName?: string;
  version?: string;
  publicationDate?: Date;
  effectiveDate?: Date;
  language?: string;
}

export interface ChunkMetadata {
  parentSection?: string;
  chapter?: string;
  sectionNumber?: string;
  subsection?: string;
  heading?: string;
  customData?: Record<string, any>;
}

export interface LegalChunk {
  content: string;
  normalizedContent: string;
  tokenCount: number;
  contentHash: string;
  metadata: ChunkMetadata;
  embedding?: number[];
}

export interface IngestionJobResult {
  jobId: string;
  documentId: string;
  status: "COMPLETED" | "FAILED" | "SKIPPED";
  totalChunks: number;
  errorReason?: string;
}
