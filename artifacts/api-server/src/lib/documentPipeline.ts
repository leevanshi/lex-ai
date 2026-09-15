import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  GetDocumentTextDetectionCommand,
  StartDocumentTextDetectionCommand,
  TextractClient,
} from "@aws-sdk/client-textract";
import { DocumentProcessor } from "./documentProcessor";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export function isDocumentPipelineEnabled(): boolean {
  return Boolean(process.env.AWS_S3_BUCKET_NAME);
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/\\/g, "/")
    .split("/").pop() ?? "document";
}

function buildObjectKey(userId: number, fileName: string): string {
  const safeName = sanitizeFileName(fileName)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();

  return `${process.env.AWS_S3_DOCUMENT_PREFIX || "documents"}/user-${userId}/${Date.now()}-${safeName}`;
}

export async function uploadDocumentToS3({
  userId,
  fileName,
  fileBuffer,
  mimeType,
}: {
  userId: number;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<{ bucket: string; key: string } | null> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    return null;
  }

  const objectKey = buildObjectKey(userId, fileName);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        userId: String(userId),
        originalFileName: sanitizeFileName(fileName),
      },
    }),
  );

  return {
    bucket: bucketName,
    key: objectKey,
  };
}

export async function extractTextWithFallback({
  fileBuffer,
  mimeType,
  userId,
  fileName,
}: {
  fileBuffer: Buffer;
  mimeType: string;
  userId: number;
  fileName: string;
}): Promise<string> {
  if (!isDocumentPipelineEnabled()) {
    return DocumentProcessor.extractText(fileBuffer, mimeType);
  }

  const storedDocument = await uploadDocumentToS3({
    userId,
    fileName,
    fileBuffer,
    mimeType,
  });

  if (!storedDocument) {
    return DocumentProcessor.extractText(fileBuffer, mimeType);
  }

  try {
    const textractJob = await textractClient.send(
      new StartDocumentTextDetectionCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: storedDocument.bucket,
            Name: storedDocument.key,
          },
        },
      }),
    );

    const jobId = textractJob.JobId;
    if (!jobId) {
      return DocumentProcessor.extractText(fileBuffer, mimeType);
    }

    let attempts = 0;
    let jobStatus = "IN_PROGRESS";

    while (jobStatus === "IN_PROGRESS" && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await textractClient.send(
        new GetDocumentTextDetectionCommand({ JobId: jobId }),
      );
      jobStatus = response.JobStatus ?? "FAILED";
      attempts += 1;
    }

    if (jobStatus !== "SUCCEEDED") {
      return DocumentProcessor.extractText(fileBuffer, mimeType);
    }

    const blocks = (await textractClient.send(new GetDocumentTextDetectionCommand({ JobId: jobId }))).Blocks ?? [];
    const lines = blocks
      .filter((block) => block.BlockType === "LINE" && typeof block.Text === "string")
      .map((block) => block.Text)
      .join("\n");

    if (lines.trim()) {
      return lines;
    }

    return DocumentProcessor.extractText(fileBuffer, mimeType);
  } catch (_error) {
    return DocumentProcessor.extractText(fileBuffer, mimeType);
  }
}
