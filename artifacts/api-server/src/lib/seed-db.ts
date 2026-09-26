import { db } from "@workspace/db";
import { legalChunksTable, legalDocumentsTable } from "@workspace/db/schema";
import { LEGAL_KNOWLEDGE_CORPUS } from "./legalKnowledge";
import { aiService } from "./ai";
import { v4 as uuidv4 } from "uuid";

async function run() {
  console.log("Seeding database with default corpus...");
  for (const source of LEGAL_KNOWLEDGE_CORPUS) {
    console.log("Inserting document:", source.id);
    
    // Insert document record
    await db.insert(legalDocumentsTable).values({
      id: source.id,
      title: source.title,
      documentType: source.documentType,
      jurisdiction: source.jurisdiction,
      sourceUrl: source.sourceUrl,
      effectiveFrom: source.effectiveFrom,
      version: source.version,
      language: source.language,
    }).onConflictDoNothing();

    const rawText = source.title + "\n\n" + source.summary + "\n\n" + source.text;
    
    const embedding = await aiService.generateEmbedding(rawText);

    if (embedding.length > 0) {
      await db.insert(legalChunksTable).values({
        id: uuidv4(),
        documentId: source.id,
        text: rawText,
        chapter: "General",
        section: source.section,
        embedding: embedding
      });
    }
  }
  console.log("Done!");
}

run().catch(console.error);
