import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  
  // AI Provider
  AI_PROVIDER: z.enum(["openai", "bedrock", "local"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  
  // AWS Configuration
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Bedrock specific
  AWS_BEDROCK_MODEL_ID: z.string().default("anthropic.claude-3-sonnet-20240229-v1:0"),
  AWS_BEDROCK_EMBEDDING_MODEL_ID: z.string().default("amazon.titan-embed-text-v1"),
  
  // Storage
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_S3_DOCUMENT_PREFIX: z.string().default("documents"),
  
  // DB
  DATABASE_URL: z.string(),
  
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),

  // Local AI Fallback (Ollama)
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3"),
  OLLAMA_EMBEDDING_MODEL: z.string().default("nomic-embed-text"),

  // Rate Limiting
  RATE_LIMIT_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(15 * 60 * 1000), // 15 mins

  LOG_LEVEL: z.string().default("info"),
});

export const config = envSchema.parse(process.env);
