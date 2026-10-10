import crypto from "crypto";
import { LegalChunk, ChunkMetadata } from "./types";

export class LegalChunker {
  
  public chunkDocument(text: string, documentType: string): LegalChunk[] {
    const cleaned = this.cleanText(text);
    if (documentType === "act" || documentType === "rule") {
      return this.chunkAct(cleaned);
    }
    return this.chunkGeneric(cleaned);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim();
  }

  private chunkAct(text: string): LegalChunk[] {
    const chunks: LegalChunk[] = [];
    const lines = text.split('\n');

    let currentPart = "";
    let currentChapter = "";
    let currentSection = "";
    let currentHeading = "";
    
    let currentBuffer: string[] = [];

    const partRegex = /^PART\s+([A-ZIVX]+)/i;
    const chapterRegex = /^CHAPTER\s+([A-ZIVX0-9]+)/i;
    const sectionRegex = /^([0-9]+[A-Z]?)\.\s+(.*)/i;

    const flushBuffer = () => {
      if (currentBuffer.length > 0) {
        const chunkText = currentBuffer.join('\n').trim();
        if (chunkText.length > 20) {
          chunks.push(this.createChunk(chunkText, {
            parentSection: currentPart || undefined,
            chapter: currentChapter || undefined,
            sectionNumber: currentSection || undefined,
            heading: currentHeading || undefined
          }));
        }
        currentBuffer = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const partMatch = trimmed.match(partRegex);
      if (partMatch) {
        flushBuffer();
        currentPart = `PART ${partMatch[1]}`;
        currentChapter = ""; // Reset chapter on new part
        currentHeading = trimmed;
        currentBuffer.push(trimmed);
        continue;
      }

      const chapterMatch = trimmed.match(chapterRegex);
      if (chapterMatch) {
        flushBuffer();
        currentChapter = `CHAPTER ${chapterMatch[1]}`;
        currentHeading = trimmed;
        currentBuffer.push(trimmed);
        continue;
      }

      const sectionMatch = trimmed.match(sectionRegex);
      if (sectionMatch && trimmed.length < 500) { 
        flushBuffer();
        currentSection = sectionMatch[1];
        currentHeading = sectionMatch[2];
        currentBuffer.push(trimmed);
        continue;
      }

      currentBuffer.push(trimmed);
    }

    flushBuffer();
    return chunks;
  }

  private chunkGeneric(text: string, maxTokens = 800): LegalChunk[] {
    const chunks: LegalChunk[] = [];
    const chunkSize = maxTokens * 4; 
    const overlap = 200;

    let index = 0;
    while (index < text.length) {
      const end = Math.min(index + chunkSize, text.length);
      let slice = text.slice(index, end);
      
      if (end < text.length) {
        const lastNewline = slice.lastIndexOf('\n');
        if (lastNewline > chunkSize * 0.5) {
          slice = slice.slice(0, lastNewline);
        } else {
          const lastPeriod = slice.lastIndexOf('. ');
          if (lastPeriod > chunkSize * 0.5) {
            slice = slice.slice(0, lastPeriod + 1);
          }
        }
      }

      const chunkText = slice.trim();
      if (chunkText.length > 20) {
        chunks.push(this.createChunk(chunkText, {}));
      }

      index += slice.length - overlap;
    }
    return chunks;
  }

  private createChunk(content: string, metadata: ChunkMetadata): LegalChunk {
    const normalizedContent = content.toLowerCase().replace(/[^a-z0-9]/g, "");
    return {
      content,
      normalizedContent,
      tokenCount: Math.ceil(content.length / 4), // rough estimate
      contentHash: crypto.createHash("sha256").update(content).digest("hex"),
      metadata
    };
  }
}
