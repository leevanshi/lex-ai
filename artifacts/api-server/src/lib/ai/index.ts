import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AIProvider, AIProviderOptions, AIProviderResponse, AIError, AIErrorType } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { BedrockProvider } from "./providers/bedrock";
import { OllamaProvider } from "./providers/ollama";
import { DemoProvider } from "./providers/demo";
import { config } from "../config";
import { logger } from "../logger";

export class AIService {
  private static instance: AIService;
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider | null = null;
  private demoProvider = new DemoProvider();

  private constructor() {
    this.primaryProvider = this.createProvider(config.AI_PROVIDER);

    if (config.AI_PROVIDER !== "openai" && config.OPENAI_API_KEY) {
      this.fallbackProvider = new OpenAIProvider();
    } else if (config.AI_PROVIDER !== "ollama" && config.OLLAMA_BASE_URL) {
      this.fallbackProvider = new OllamaProvider();
    }
  }

  private createProvider(type: string): AIProvider {
    switch (type.toLowerCase()) {
      case "openai": return new OpenAIProvider();
      case "bedrock": return new BedrockProvider();
      case "ollama": return new OllamaProvider();
      default: return new DemoProvider();
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async executeWithRetry<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await operation(this.primaryProvider);
      } catch (error: any) {
        if (error instanceof AIError) {
          logger.warn(`[AI Service] Provider error on ${this.primaryProvider.providerName}: ${error.message} (Retryable: ${error.retryable})`);
          
          if (!error.retryable || attempt === maxRetries) {
            if (this.fallbackProvider) {
               logger.warn(`[AI Service] Falling back to ${this.fallbackProvider.providerName}`);
               try {
                 return await operation(this.fallbackProvider);
               } catch (fallbackErr) {
                 logger.warn(`[AI Service] Fallback failed. Using Demo Mode.`);
                 return await operation(this.demoProvider);
               }
            }
            logger.warn(`[AI Service] Quota exhausted or fatal error. Falling back to Demo Mode.`);
            return await operation(this.demoProvider);
          }
          
          const delay = error.retryAfterMs || Math.pow(2, attempt) * 1000;
          await new Promise((res) => setTimeout(res, delay));
          attempt++;
        } else {
          logger.error("[AI Service] Unknown Error:", error.message, "Using Demo Mode.");
          return await operation(this.demoProvider);
        }
      }
    }
    return await operation(this.demoProvider);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.executeWithRetry((p) => p.generateEmbedding(text));
  }

  async chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    return splitter.splitText(text);
  }

  private parseJsonObject<T>(input: string, fallback: T): T {
    if (!input) return fallback;
    try {
      const match = input.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
      return JSON.parse(input) as T;
    } catch {
      return fallback;
    }
  }

  // --- Existing application business logic methods adapted to new provider ---
  async analyzeContract(content: string): Promise<{
    riskLevel: "low" | "medium" | "high";
    summary: string;
    riskyClauses: Array<{ text: string; risk: string; suggestion: string; }>;
  }> {
    const systemPrompt = `You are an expert legal contract analyst. Analyze contracts for risks and provide clear explanations. Return JSON only with keys riskLevel, summary, and riskyClauses. Risky clauses should each include text, risk, and suggestion.`;
    const userPrompt = `Analyze this contract:\n\n${content}`;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt }));

    return this.parseJsonObject(res.content, {
      riskLevel: "medium",
      summary: "Contract analysis could not be completed.",
      riskyClauses: [],
    });
  }

  async explainClause(clause: string): Promise<string> {
    const systemPrompt = "You are a legal expert who explains complex legal language in simple, plain English. Keep the answer practical and accessible, and clearly state when a clause may require lawyer review.";
    const userPrompt = `Explain this legal clause in simple terms:\n\n${clause}`;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt }));
    return res.content;
  }

  async generateDraft(prompt: string, context?: string): Promise<{ content: string; tokensUsed: number; }> {
    const systemPrompt = "You are an expert legal document drafter. Generate clear, professional legal documents based on the user's requirements. Use standard legal terminology while keeping the language accessible and avoid giving legal advice as final authority.";
    const userPrompt = context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt }));
    return { content: res.content, tokensUsed: res.tokensUsed || 0 };
  }

  async generateNegotiationSuggestions(clause: string, position: "favorable" | "unfavorable"): Promise<{
    suggestions: Array<{ originalText: string; suggestedText: string; reasoning: string; }>;
  }> {
    const systemPrompt = "You are a skilled contract negotiator. Provide specific, actionable suggestions to improve contract terms. Return valid JSON with a suggestions array, where each item has originalText, suggestedText, and reasoning.";
    const userPrompt = `This clause is currently ${position} to my position. Provide negotiation suggestions:\n\n${clause}`;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt }));
    return this.parseJsonObject(res.content, { suggestions: [] });
  }

  async ragQuery(question: string, relevantChunks: Array<{ content: string; metadata?: any }>): Promise<string> {
    const context = relevantChunks.map((c, i) => `Context ${i + 1}:\n${c.content}`).join("\n\n");
    const systemPrompt = "You are a legal expert answering questions based only on the provided contract context. If the context does not include the answer, say so clearly and avoid guessing. Cite the relevant context in your answer by referencing the source context numbers.";
    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt }));
    return res.content;
  }

  async answerLegalQuestion(
    question: string,
    sources: any[],
    options?: {
      mode?: "citizen" | "lawyer";
      safety?: { disclaimer?: string; requiresLegalCounsel?: boolean; clarityQuestions?: string[]; risks?: string[] };
      disclaimer?: string;
    },
  ): Promise<string> {
    const legalContext = sources
      .map(
        (source, index) =>
          `[Source ${index + 1}]\nTitle: ${source.title}\nSection: ${source.section}\nJurisdiction: ${source.jurisdiction}\nSummary: ${source.summary}\nSource: ${source.sourceUrl}\nText: ${source.text}`,
      )
      .join("\n\n");

    const safetySummary = options?.safety ? `\n\nLegal safety notes:\n- Risks: ${options.safety.risks?.join(", ") || "none identified"}\n- Requires lawyer review: ${options.safety.requiresLegalCounsel ? "yes" : "no"}\n- Clarifying questions: ${(options.safety.clarityQuestions ?? []).join("; ")}` : "";

    const modeInstruction = options?.mode === "lawyer"
      ? "Answer in a lawyer-oriented research style with concise legal issue framing, relevant provisions, practical arguments, and source references."
      : "Answer in simple citizen-friendly language, explain the likely legal meaning, and provide practical next steps. Avoid definitive conclusions when the facts are uncertain.";

    const systemPrompt = `You are LexAI, an Indian legal information assistant. ${modeInstruction} You are not a lawyer and cannot provide definitive legal advice. 

CRITICAL INSTRUCTIONS:
1. Ground your answer ONLY in the provided legal sources. Do not invent case names, sections, URLs, or authorities.
2. You MUST cite your sources inline using bracketed numbers [1], [2] corresponding to the [Source X] labels in the context.
3. If the context is insufficient to fully answer, state what is missing.
4. Explain uncertainty carefully.

${options?.disclaimer ?? "This information is for educational purposes only and does not constitute legal advice."}${safetySummary}`;

    const userPrompt = `Question: ${question}\n\nRelevant legal sources:\n${legalContext}`;

    const res = await this.executeWithRetry((p) => p.generateAnswer({ systemPrompt, userPrompt, maxTokens: 1500 }));
    return res.content;
  }
}

export const aiService = AIService.getInstance();
