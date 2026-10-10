import crypto from "crypto";
import { db, legalDocumentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export class Deduplicator {
  
  public generateChecksum(content: string | Buffer): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Checks if a document with the exact checksum already exists.
   * Returns the document ID if it exists, otherwise null.
   */
  public async checkExists(checksum: string): Promise<string | null> {
    const existing = await db
      .select({ id: legalDocumentsTable.id })
      .from(legalDocumentsTable)
      .where(eq(legalDocumentsTable.checksum, checksum))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }
    return null;
  }
}
