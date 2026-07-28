import pdf from "pdf-parse";
import mammoth from "mammoth";

export class DocumentProcessor {
  static async extractText(file: Buffer, mimeType: string): Promise<string> {
    switch (mimeType) {
      case "application/pdf":
        return await this.extractFromPDF(file);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await this.extractFromDocx(file);
      case "text/plain":
        return file.toString("utf-8");
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  private static async extractFromPDF(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }

  private static async extractFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n\n") // Normalize line breaks
      .trim();
  }
}
