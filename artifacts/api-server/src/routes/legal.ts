import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { aiService } from "../lib/ai";
import { retrievalSystem } from "../lib/retrieval";
import { reranker } from "../lib/reranker";
import { buildLegalSafetyNote, evaluateLegalSafety } from "../lib/legalSafety";

const router = Router();

router.post("/ask", requireAuth, async (req, res): Promise<void> => {
  try {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    const mode = req.body?.mode === "lawyer" ? "lawyer" : "citizen";

    if (!question) {
      res.status(400).json({ error: "Question is required" });
      return;
    }

    // 1. Broad Vector Recall (Phase 7)
    // Fetch top 15 candidates. We use a negative minScore (-1) to ensure we get results 
    // even with simulated orthogonal Demo vectors.
    const rawSources = await retrievalSystem.retrieveRelevantSources(question, { limit: 15, minScore: -1 });
    
    // 2. Hybrid Reranking (Phase 8)
    // Rerank using lexical overlap and exact phrase matching to bubble up the best 5.
    const sources = reranker.rerank(question, rawSources, { topK: 5, keywordWeight: 0.5 });
    
    const safety = evaluateLegalSafety(question);
    const disclaimer = buildLegalSafetyNote(question);
    
    // Construct the context string similar to the old getDefaultLegalPromptContext
    const legalContext = sources
      .map(
        (source, i) =>
          `--- SOURCE ${i + 1} ---\nTitle: ${source.title}\nSection: ${source.section}\nJurisdiction: ${source.jurisdiction}\nSummary: ${source.summary}\nText: ${source.text}`,
      )
      .join("\n\n");
      
    const hasSufficientEvidence = sources.length > 0;

    const answer = hasSufficientEvidence
      ? await aiService.answerLegalQuestion(question, sources, {
          mode,
          safety,
          disclaimer,
        })
      : "I couldn't find sufficiently relevant legal sources in the available knowledge base to answer this reliably. Please share more facts or narrow the legal issue so I can ground the response in the right authorities.";

    const response = {
      question,
      mode,
      answer,
      summary: hasSufficientEvidence
        ? "LexAI reviewed the relevant legal sources and summarized the likely legal context."
        : "No sufficiently relevant legal sources were matched in the available knowledge base for this question.",
      relevantLaw: sources.map((source) => ({
        title: source.title,
        section: source.section,
        documentType: source.documentType,
        jurisdiction: source.jurisdiction,
        sourceUrl: source.sourceUrl,
        relevanceScore: Number((source.score ?? 0).toFixed(3)),
      })),
      sources: sources.map((source) => ({
        documentId: source.id,
        title: source.title,
        section: source.section,
        sourceUrl: source.sourceUrl,
        relevanceScore: Number((source.score ?? 0).toFixed(3)),
      })),
      safety,
      disclaimer,
      clarifyingQuestions: safety.clarityQuestions,
      context: legalContext,
      hasSufficientEvidence,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Legal ask error:", error);
    if (error.name === 'AIRateLimitError' || error?.status === 429 || error?.code === 'insufficient_quota') {
      res.status(429).json({ error: "OpenAI quota exceeded or rate limit reached. Please check your billing details." });
      return;
    }
    res.status(500).json({ error: "Failed to answer legal question", message: error?.message || "Unknown error" });
  }
});

export default router;
