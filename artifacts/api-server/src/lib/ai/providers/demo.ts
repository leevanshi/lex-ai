import { randomUUID } from "crypto";
import { AIProvider, AIProviderOptions, AIProviderResponse } from "../types";

export class DemoProvider implements AIProvider {
  public providerName = "demo";

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async generateAnswer(options: AIProviderOptions): Promise<AIProviderResponse> {
    return {
      content: "This is a fallback demo response because no AI provider was available or configured correctly.",
      requestId: randomUUID(),
      tokensUsed: 0
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate a dummy vector of 1536 dimensions
    return Array.from({ length: 1536 }, () => Math.random() * 0.1);
  }
}
