import crypto from "crypto";

export interface LegalMetadata {
  documentId: string;
  documentTitle: string;
  documentType: string;
  jurisdiction: string;
  court?: string;
  citation?: string;
  date?: string;
  sourceUrl?: string;
}

export interface LegalChunk {
  chunkId: string;
  documentId: string;
  text: string;
  chapter?: string;
  section?: string;
  metadata: LegalMetadata;
}

export class LegalChunker {
  /**
   * Splits an Indian legal act into logically separated sections.
   * Preserves hierarchy (e.g. tracking the current Chapter).
   */
  public chunkAct(text: string, metadata: LegalMetadata): LegalChunk[] {
    const chunks: LegalChunk[] = [];
    const lines = text.split('\n');

    let currentChapter = "";
    let currentSection = "";
    let currentBuffer: string[] = [];

    // Simple regex to match standard Indian Act chapters and sections
    // e.g., "CHAPTER II" or "CHAPTER 2"
    const chapterRegex = /^CHAPTER\s+([A-Z0-9]+)/i;
    // e.g., "1. Short title..." or "14A. Definitions..."
    const sectionRegex = /^([0-9]+[A-Z]?)\.\s+(.*)/i;

    const flushBuffer = () => {
      if (currentBuffer.length > 0) {
        const chunkText = currentBuffer.join('\n').trim();
        if (chunkText.length > 20) { // Ignore tiny fragmented chunks
          chunks.push({
            chunkId: this.generateHash(chunkText),
            documentId: metadata.documentId,
            text: chunkText,
            chapter: currentChapter || undefined,
            section: currentSection || undefined,
            metadata,
          });
        }
        currentBuffer = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const chapterMatch = trimmed.match(chapterRegex);
      if (chapterMatch) {
        flushBuffer();
        currentChapter = `Chapter ${chapterMatch[1]}`;
        currentBuffer.push(trimmed);
        continue;
      }

      const sectionMatch = trimmed.match(sectionRegex);
      if (sectionMatch && trimmed.length < 500) { 
        // Likely a section header
        flushBuffer();
        currentSection = `Section ${sectionMatch[1]}`;
        currentBuffer.push(trimmed);
        continue;
      }

      currentBuffer.push(trimmed);
    }

    flushBuffer();

    return chunks;
  }

  /**
   * Universal chunker for documents that don't neatly follow Act hierarchy
   * (e.g. Guidelines, plain Articles, loosely structured judgments).
   */
  public chunkGeneric(text: string, metadata: LegalMetadata, maxTokens = 800): LegalChunk[] {
    // Basic character-based sliding window splitting for now.
    // In production, we'll swap this with token-based recursive splitting.
    const chunks: LegalChunk[] = [];
    const chunkSize = maxTokens * 4; // Approx chars per token
    const overlap = 200;

    let index = 0;
    while (index < text.length) {
      const end = Math.min(index + chunkSize, text.length);
      let slice = text.slice(index, end);
      
      // Try to back up to the nearest newline to avoid breaking sentences
      if (end < text.length) {
        const lastNewline = slice.lastIndexOf('\n');
        if (lastNewline > chunkSize * 0.5) {
          slice = slice.slice(0, lastNewline);
        }
      }

      const chunkText = slice.trim();
      if (chunkText.length > 20) {
        chunks.push({
          chunkId: this.generateHash(chunkText),
          documentId: metadata.documentId,
          text: chunkText,
          metadata,
        });
      }

      index += slice.length - overlap;
    }

    return chunks;
  }

  private generateHash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
  }
}
