import { randomUUID } from "crypto";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { AIProvider, AIProviderOptions, AIProviderResponse, AIError, AIErrorType } from "../types";
import { config } from "../../config";
import { logger } from "../../logger";

export class BedrockProvider implements AIProvider {
  public providerName = "bedrock";
  private client: BedrockRuntimeClient;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: config.AWS_REGION,
    });
  }

  async healthCheck(): Promise<boolean> {
    // Basic connectivity check to Bedrock is tricky without a specific API, but we'll assume true if initialized
    return true; 
  }

  async generateAnswer(options: AIProviderOptions): Promise<AIProviderResponse> {
    const reqId = randomUUID();
    const modelId = options.model || config.AWS_BEDROCK_MODEL_ID;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature,
      system: options.systemPrompt,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: options.userPrompt }],
        },
      ],
    };

    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content?.[0]?.text || "",
        requestId: reqId,
        tokensUsed: responseBody.usage?.output_tokens
      };
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const reqId = randomUUID();
    const modelId = config.AWS_BEDROCK_EMBEDDING_MODEL_ID;

    const payload = { inputText: text };

    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.embedding;
    } catch (error: any) {
      throw this.handleError(error, reqId);
    }
  }

  private handleError(error: any, requestId: string): AIError {
    logger.error({ err: error, requestId }, `BedrockProvider Error`);

    if (error.name === "ThrottlingException") {
      return new AIError(AIErrorType.RATE_LIMIT, "Bedrock rate limit exceeded", true, 5000, requestId);
    }
    if (error.name === "ValidationException") {
      return new AIError(AIErrorType.INVALID_REQUEST, `Bedrock validation error: ${error.message}`, false, undefined, requestId);
    }
    if (error.name === "AccessDeniedException") {
      return new AIError(AIErrorType.UNAUTHORIZED, "Bedrock access denied", false, undefined, requestId);
    }

    return new AIError(AIErrorType.INTERNAL_ERROR, `Bedrock internal error: ${error.message}`, true, 2000, requestId);
  }
}
