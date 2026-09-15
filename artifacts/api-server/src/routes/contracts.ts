import { Router, type IRouter } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { contractsTable, contractChunksTable, contractEmbeddingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { DocumentProcessor } from "../lib/documentProcessor";
import { extractTextWithFallback } from "../lib/documentPipeline";
import { aiService } from "../lib/ai";
import { retrieveRelevantContractChunks } from "../lib/retrieval";

const router: IRouter = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload contract
router.post("/upload", upload.single("file"), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    if (!req.body.userId) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    // Extract text from document, preferring the AWS document pipeline when configured.
    const text = await extractTextWithFallback({
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      userId: Number(req.body.userId),
      fileName: req.file.originalname,
    });
    const cleanedText = DocumentProcessor.cleanText(text);

    // Save contract to database
    const [contract] = await db.insert(contractsTable).values({
      userId: parseInt(req.body.userId),
      title: req.body.title || req.file.originalname,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      content: cleanedText,
      status: "processing",
    }).returning();

    // Process document in background (chunking and embeddings)
    processContract(contract.id, cleanedText).catch(console.error);

    res.json({ contractId: contract.id, status: "processing" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload contract" });
  }
});

// Get all contracts for a user
router.get("/user/:userId", async (req, res): Promise<void> => {
  try {
    const contracts = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.userId, parseInt(req.params.userId)))
      .orderBy(contractsTable.uploadedAt);

    res.json(contracts);
  } catch (error) {
    console.error("Get contracts error:", error);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
});

// Get single contract
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const [contract] = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, parseInt(req.params.id)));

    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    res.json(contract);
  } catch (error) {
    console.error("Get contract error:", error);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
});

// Analyze contract
router.post("/:id/analyze", async (req, res): Promise<void> => {
  try {
    const [contract] = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, parseInt(req.params.id)));

    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    const analysis = await aiService.analyzeContract(contract.content);
    res.json(analysis);
  } catch (error) {
    console.error("Analyze contract error:", error);
    res.status(500).json({ error: "Failed to analyze contract" });
  }
});

// Explain clause
router.post("/explain", async (req, res): Promise<void> => {
  try {
    const { clause } = req.body;
    if (!clause) {
      res.status(400).json({ error: "Clause text required" });
      return;
    }

    const explanation = await aiService.explainClause(clause);
    res.json({ explanation });
  } catch (error) {
    console.error("Explain clause error:", error);
    res.status(500).json({ error: "Failed to explain clause" });
  }
});

// RAG query
router.post("/:id/query", async (req, res): Promise<void> => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Question required" });
      return;
    }

    const contractId = Number.parseInt(req.params.id, 10);
    const relevantChunks = await retrieveRelevantContractChunks(contractId, question, 5);

    const answer = await aiService.ragQuery(question, relevantChunks);
    res.json({ answer });
  } catch (error) {
    console.error("RAG query error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

// Generate negotiation suggestions
router.post("/negotiate", async (req, res): Promise<void> => {
  try {
    const { clause, position } = req.body;
    if (!clause || !position) {
      res.status(400).json({ error: "Clause and position required" });
      return;
    }

    const suggestions = await aiService.generateNegotiationSuggestions(clause, position);
    res.json(suggestions);
  } catch (error) {
    console.error("Negotiation suggestions error:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

// Background processing function
async function processContract(contractId: number, content: string) {
  try {
    // Chunk the text
    const chunks = await aiService.chunkText(content);

    // Save chunks to database
    for (let i = 0; i < chunks.length; i++) {
      const [chunk] = await db.insert(contractChunksTable).values({
        contractId,
        content: chunks[i],
        chunkIndex: i,
        metadata: { chunkSize: chunks[i].length },
      }).returning();

      // Generate embedding for each chunk
      const embedding = await aiService.generateEmbedding(chunks[i]);
      
      await db.insert(contractEmbeddingsTable).values({
        chunkId: chunk.id,
        embedding: JSON.stringify(embedding),
        model: "text-embedding-3-small",
      });
    }

    // Update contract status
    await db
      .update(contractsTable)
      .set({ 
        status: "ready",
        processedAt: new Date(),
      })
      .where(eq(contractsTable.id, contractId));

  } catch (error) {
    console.error("Process contract error:", error);
    await db
      .update(contractsTable)
      .set({ status: "error" })
      .where(eq(contractsTable.id, contractId));
  }
}

export default router;
