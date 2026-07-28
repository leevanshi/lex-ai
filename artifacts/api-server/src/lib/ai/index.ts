import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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

export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    const chunks = await splitter.splitText(text);
    return chunks;
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
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert legal contract analyst. Analyze contracts for risks and provide clear explanations.
          Return a JSON response with:
          - riskLevel: "low", "medium", or "high"
          - summary: A 2-3 sentence summary of the contract
          - riskyClauses: Array of objects with text, risk, and suggestion fields`
        },
        {
          role: "user",
          content: `Analyze this contract:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  }

  async explainClause(clause: string): Promise<string> {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal expert who explains complex legal language in simple, plain English that anyone can understand. Break down the clause into its key components and explain what each part means in practical terms."
        },
        {
          role: "user",
          content: `Explain this legal clause in simple terms:\n\n${clause}`
        }
      ],
    });

    return response.choices[0].message.content || "Unable to explain clause.";
  }

  async generateDraft(prompt: string, context?: string): Promise<{
    content: string;
    tokensUsed: number;
  }> {
    const client = getOpenAIClient();
    const messages = [
      {
        role: "system" as const,
        content: "You are an expert legal document drafter. Generate clear, professional legal documents based on the user's requirements. Use standard legal terminology while keeping the language accessible."
      },
      {
        role: "user" as const,
        content: context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt
      }
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return {
      content: response.choices[0].message.content || "",
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }

  async generateNegotiationSuggestions(clause: string, position: "favorable" | "unfavorable"): Promise<{
    suggestions: Array<{
      originalText: string;
      suggestedText: string;
      reasoning: string;
    }>;
  }> {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a skilled contract negotiator. Provide specific, actionable suggestions to improve contract terms.
          Return a JSON response with an array of suggestions, each containing:
          - originalText: The text being modified
          - suggestedText: The improved version
          - reasoning: Why this change is beneficial`
        },
        {
          role: "user",
          content: `This clause is currently ${position} to my position. Provide negotiation suggestions:\n\n${clause}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  }

  async ragQuery(question: string, relevantChunks: Array<{ content: string; metadata?: any }>): Promise<string> {
    const client = getOpenAIClient();
    const context = relevantChunks
      .map((chunk, i) => `Context ${i + 1}:\n${chunk.content}`)
      .join("\n\n");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal expert answering questions based on provided contract context. Use only the given context to answer questions. If the context doesn't contain the answer, say so clearly."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ],
    });

    return response.choices[0].message.content || "Unable to answer question based on provided context.";
  }
}

export const aiService = AIService.getInstance();
