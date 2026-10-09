import { randomUUID } from "crypto";

export interface AIProviderOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userPrompt: string;
}

export interface AIProviderResponse {
  content: string;
  requestId: string;
  tokensUsed?: number;
}

export interface AIProvider {
  providerName: string;
  generateAnswer(options: AIProviderOptions): Promise<AIProviderResponse>;
  generateEmbedding(text: string): Promise<number[]>;
  healthCheck(): Promise<boolean>;
  // streamAnswer?(options: AIProviderOptions): AsyncGenerator<string, void, unknown>;
}

export enum AIErrorType {
  RATE_LIMIT = "RATE_LIMIT",
  TIMEOUT = "TIMEOUT",
  INVALID_REQUEST = "INVALID_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN = "UNKNOWN"
}

export class AIError extends Error {
  public requestId: string;

  constructor(
    public type: AIErrorType,
    message: string,
    public retryable: boolean,
    public retryAfterMs?: number,
    requestId?: string
  ) {
    super(message);
    this.name = "AIError";
    this.requestId = requestId || randomUUID();
  }
}
