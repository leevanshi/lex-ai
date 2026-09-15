import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { aiService } from "../lib/ai";
import {
  getDefaultLegalPromptContext,
  rankLegalSources,
  retrieveRelevantLegalSources,
} from "../lib/legalKnowledge";
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

    const rankedSources = rankLegalSources(question, { limit: 5, minScore: 0.18 });
    const sources = rankedSources.map(({ source }) => source);
    const safety = evaluateLegalSafety(question);
    const disclaimer = buildLegalSafetyNote(question);
    const legalContext = getDefaultLegalPromptContext(question, 5, { minScore: 0.18 });
    const hasSufficientEvidence = rankedSources.length > 0;

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
      relevantLaw: sources.map((source, index) => ({
        title: source.title,
        section: source.section,
        documentType: source.documentType,
        jurisdiction: source.jurisdiction,
        sourceUrl: source.sourceUrl,
        relevanceScore: Number((rankedSources[index]?.score ?? 0).toFixed(3)),
      })),
      sources: sources.map((source, index) => ({
        documentId: source.id,
        title: source.title,
        section: source.section,
        sourceUrl: source.sourceUrl,
        relevanceScore: Number((rankedSources[index]?.score ?? 0).toFixed(3)),
      })),
      safety,
      disclaimer,
      clarifyingQuestions: safety.clarityQuestions,
      context: legalContext,
      hasSufficientEvidence,
    };

    res.json(response);
  } catch (error) {
    console.error("Legal ask error:", error);
    res.status(500).json({ error: "Failed to answer legal question" });
  }
});

export default router;
