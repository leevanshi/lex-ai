import OpenAI from "openai";
import { randomUUID } from "crypto";
import { AIProvider, AIProviderOptions, AIProviderResponse, AIError, AIErrorType } from "../types";
import { config } from "../../config";
import { logger } from "../../logger";

export class OpenAIProvider implements AIProvider {
  public providerName = "openai";
  private client: OpenAI;

  constructor() {
    const apiKey = config.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("OPENAI_API_KEY is not set. OpenAIProvider will fail if used.");
    }
    this.client = new OpenAI({ apiKey: apiKey || "MISSING" });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateAnswer(options: AIProviderOptions): Promise<AIProviderResponse> {
    const reqId = randomUUID();
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4o-mini",
        messages: [
          ...(options.systemPrompt ? [{ role: "system" as const, content: options.systemPrompt }] : []),
          { role: "user" as const, content: options.userPrompt }
        ],
        max_tokens: options.maxTokens,
        temperature: options.temperature,
      });

      return {
        content: response.choices[0]?.message?.content || "",
        requestId: reqId,
        tokensUsed: response.usage?.total_tokens
      };
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const reqId = randomUUID();
    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  private handleError(error: any, requestId: string): AIError {
    logger.error({ err: error, requestId }, `OpenAIProvider Error`);

    if (error.status === 429) {
      return new AIError(AIErrorType.RATE_LIMIT, "OpenAI rate limit exceeded", true, 5000, requestId);
    }
    if (error.status === 401 || error.status === 403) {
      return new AIError(AIErrorType.UNAUTHORIZED, "OpenAI authentication failed", false, undefined, requestId);
    }
    if (error.status === 400) {
      return new AIError(AIErrorType.INVALID_REQUEST, `OpenAI invalid request: ${error.message}`, false, undefined, requestId);
    }
    
    // Default to internal/unknown error but retryable for network glitches
    return new AIError(AIErrorType.INTERNAL_ERROR, `OpenAI internal error: ${error.message}`, true, 2000, requestId);
  }
}
