import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { retrieveRelevantLegalSources, type LegalSource } from "../legalKnowledge";
import { buildLegalSafetyNote, evaluateLegalSafety } from "../legalSafety";

const DEFAULT_BEDROCK_TEXT_MODEL = "anthropic.claude-3-5-sonnet-20240620-v1:0";
const DEFAULT_BEDROCK_EMBEDDING_MODEL = "amazon.titan-embed-text-v1";

export type AIProviderType = "ollama" | "bedrock" | "openai";

export interface AIProvider {
  providerName: string;
  generateText(args: { systemPrompt: string; userPrompt: string; maxTokens?: number }): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}

function parseJsonObject<T>(input: string, fallback: T): T {
  if (!input) return fallback;

  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

function getConfiguredProvider(): AIProviderType {
  const configured = (process.env.AI_PROVIDER || "ollama").trim().toLowerCase();

  if (configured === "openai") return "openai";
  if (configured === "bedrock") return "bedrock";
  if (configured === "ollama") return "ollama";

  return process.env.OPENAI_API_KEY ? "openai" : "ollama";
}

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-your-openai-api-key-here") {
      throw new Error("Valid OPENAI_API_KEY environment variable is required");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

class OllamaProvider implements AIProvider {
  providerName = "ollama";

  private async request<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const baseUrl = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as T;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.request<{ embedding?: number[] }>("/api/embeddings", {
      model: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
      prompt: text,
    });

    return response.embedding ?? [];
  }

  async generateText({
    systemPrompt,
    userPrompt,
    maxTokens = 1500,
  }: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<string> {
    const response = await this.request<{ message?: { content?: string } }>("/api/chat", {
      model: process.env.OLLAMA_MODEL || "llama3.2",
      stream: false,
      format: "text",
      options: { num_predict: maxTokens },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return response.message?.content || "";
  }
}

class BedrockAIProvider implements AIProvider {
  providerName = "bedrock";
  private client: BedrockRuntimeClient;
  private textModelId: string;
  private embeddingModelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    this.textModelId =
      process.env.AWS_BEDROCK_MODEL_ID || DEFAULT_BEDROCK_TEXT_MODEL;
    this.embeddingModelId =
      process.env.AWS_BEDROCK_EMBEDDING_MODEL_ID || DEFAULT_BEDROCK_EMBEDDING_MODEL;
  }

  private async invokeModel(modelId: string, input: Record<string, unknown>) {
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(JSON.stringify(input)),
    });

    const response = await this.client.send(command);
    const body = response.body ? Buffer.from(response.body).toString("utf-8") : "{}";
    return JSON.parse(body);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.invokeModel(this.embeddingModelId, {
      inputText: text,
      normalize: true,
    });

    const embedding = response.embedding ?? response.embeddings?.[0] ?? [];
    if (!Array.isArray(embedding)) {
      throw new Error("Bedrock embedding response did not include a numeric vector");
    }

    return embedding.map((value) => Number(value));
  }

  async generateText({
    systemPrompt,
    userPrompt,
    maxTokens = 1024,
  }: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<string> {
    const response = await this.invokeModel(this.textModelId, {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
    });

    const textParts =
      response.content?.flatMap((item: any) =>
        item?.type === "text" ? [item.text] : [],
      ) ?? [];

    return textParts.join("\n") || "";
  }
}

class OpenAIProvider implements AIProvider {
  providerName = "openai";

  async generateEmbedding(text: string): Promise<number[]> {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateText({
    systemPrompt,
    userPrompt,
    maxTokens = 1500,
  }: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<string> {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "";
  }
}

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;

  private constructor() {
    const configuredProvider = getConfiguredProvider();

    if (configuredProvider === "ollama") {
      this.provider = new OllamaProvider();
      return;
    }

    if (configuredProvider === "bedrock") {
      this.provider = new BedrockAIProvider();
      return;
    }

    this.provider = new OpenAIProvider();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  async chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    return splitter.splitText(text);
  }

  async analyzeContract(content: string): Promise<{
    riskLevel: "low" | "medium" | "high";
    summary: string;
    riskyClauses: Array<{
      text: string;
      risk: string;
      suggestion: string;
    }>;
  }> {
    const systemPrompt = `You are an expert legal contract analyst. Analyze contracts for risks and provide clear explanations. Return JSON only with keys riskLevel, summary, and riskyClauses. Risky clauses should each include text, risk, and suggestion.`;
    const userPrompt = `Analyze this contract:\n\n${content}`;

    const raw = await this.provider.generateText({
      systemPrompt,
      userPrompt,
    });

    return parseJsonObject(raw, {
      riskLevel: "medium",
      summary: "Contract analysis could not be completed.",
      riskyClauses: [],
    });
  }

  async explainClause(clause: string): Promise<string> {
    const systemPrompt = "You are a legal expert who explains complex legal language in simple, plain English. Keep the answer practical and accessible, and clearly state when a clause may require lawyer review.";
    const userPrompt = `Explain this legal clause in simple terms:\n\n${clause}`;

    return this.provider.generateText({
      systemPrompt,
      userPrompt,
    });
  }

  async generateDraft(prompt: string, context?: string): Promise<{
    content: string;
    tokensUsed: number;
  }> {
    const systemPrompt = "You are an expert legal document drafter. Generate clear, professional legal documents based on the user's requirements. Use standard legal terminology while keeping the language accessible and avoid giving legal advice as final authority.";
    const userPrompt = context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt;

    const content = await this.provider.generateText({
      systemPrompt,
      userPrompt,
    });

    return {
      content,
      tokensUsed: 0,
    };
  }

  async generateNegotiationSuggestions(clause: string, position: "favorable" | "unfavorable"): Promise<{
    suggestions: Array<{
      originalText: string;
      suggestedText: string;
      reasoning: string;
    }>;
  }> {
    const systemPrompt = "You are a skilled contract negotiator. Provide specific, actionable suggestions to improve contract terms. Return valid JSON with a suggestions array, where each item has originalText, suggestedText, and reasoning.";
    const userPrompt = `This clause is currently ${position} to my position. Provide negotiation suggestions:\n\n${clause}`;

    const raw = await this.provider.generateText({
      systemPrompt,
      userPrompt,
    });

    return parseJsonObject(raw, {
      suggestions: [],
    });
  }

  async ragQuery(question: string, relevantChunks: Array<{ content: string; metadata?: any }>): Promise<string> {
    const context = relevantChunks
      .map((chunk, i) => `Context ${i + 1}:\n${chunk.content}`)
      .join("\n\n");

    const systemPrompt = "You are a legal expert answering questions based only on the provided contract context. If the context does not include the answer, say so clearly and avoid guessing. Cite the relevant context in your answer by referencing the source context numbers.";
    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

    return this.provider.generateText({
      systemPrompt,
      userPrompt,
    });
  }

  async answerLegalQuestion(
    question: string,
    sources: LegalSource[],
    options?: {
      mode?: "citizen" | "lawyer";
      safety?: { disclaimer?: string; requiresLegalCounsel?: boolean; clarityQuestions?: string[]; risks?: string[] };
      disclaimer?: string;
    },
  ): Promise<string> {
    const legalContext = sources
      .map(
        (source) =>
          `Title: ${source.title}\nSection: ${source.section}\nJurisdiction: ${source.jurisdiction}\nSummary: ${source.summary}\nSource: ${source.sourceUrl}\nText: ${source.text}`,
      )
      .join("\n\n");

    const safetySummary = options?.safety ? `\n\nLegal safety notes:\n- Risks: ${options.safety.risks?.join(", ") || "none identified"}\n- Requires lawyer review: ${options.safety.requiresLegalCounsel ? "yes" : "no"}\n- Clarifying questions: ${(options.safety.clarityQuestions ?? []).join("; ")}` : "";

    const modeInstruction = options?.mode === "lawyer"
      ? "Answer in a lawyer-oriented research style with concise legal issue framing, relevant provisions, practical arguments, and source references."
      : "Answer in simple citizen-friendly language, explain the likely legal meaning, and provide practical next steps. Avoid definitive conclusions when the facts are uncertain.";

    const systemPrompt = `You are LexAI, an Indian legal information assistant. ${modeInstruction} You are not a lawyer and cannot provide definitive legal advice. Use only the legal sources supplied below. If a source cannot be verified, say that it could not be verified. Do not invent case names, sections, URLs, or authorities. Explain uncertainty carefully. ${options?.disclaimer ?? buildLegalSafetyNote(question)}${safetySummary}`;

    const userPrompt = `Question: ${question}\n\nRelevant legal sources:\n${legalContext}`;

    return this.provider.generateText({
      systemPrompt,
      userPrompt,
      maxTokens: 1500,
    });
  }
}

export const aiService = AIService.getInstance();
