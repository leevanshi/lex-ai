import { randomUUID } from "crypto";
import { AIProvider, AIProviderOptions, AIProviderResponse, AIError, AIErrorType } from "../types";
import { config } from "../../config";
import { logger } from "../../logger";

export class OllamaProvider implements AIProvider {
  public providerName = "ollama";
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.OLLAMA_BASE_URL.replace(/\/$/, "");
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateAnswer(options: AIProviderOptions): Promise<AIProviderResponse> {
    const reqId = randomUUID();
    const model = options.model || config.OLLAMA_MODEL;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
            { role: "user", content: options.userPrompt }
          ],
          stream: false,
          options: {
            temperature: options.temperature,
            num_predict: options.maxTokens
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.message?.content || "",
        requestId: reqId,
        tokensUsed: data.eval_count
      };
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const reqId = randomUUID();
    const model = config.OLLAMA_EMBEDDING_MODEL;

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  private handleError(error: any, requestId: string): AIError {
    logger.error({ err: error, requestId }, `OllamaProvider Error`);
    if (error.name === "AbortError" || error.message.includes("fetch failed")) {
      return new AIError(AIErrorType.TIMEOUT, "Ollama connection timeout", true, 2000, requestId);
    }
    return new AIError(AIErrorType.INTERNAL_ERROR, `Ollama error: ${error.message}`, true, 1000, requestId);
  }
}
