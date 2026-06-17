import { Router } from "express";
import { db, usersTable, documentsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateDocumentBody, UpdateDocumentBody, ListDocumentsQueryParams } from "@workspace/api-zod";
import { DOCUMENT_TYPES, PLAN_LIMITS, generateDocumentContent } from "../lib/document-templates";

const router = Router();

router.get("/document-types", async (_req, res): Promise<void> => {
  res.json(DOCUMENT_TYPES);
});

router.get("/documents/dashboard-stats", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const allDocs = await db.select().from(documentsTable).where(eq(documentsTable.userId, user[0].id));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const docsThisMonth = allDocs.filter(d => new Date(d.createdAt) >= startOfMonth);

  const byType: Record<string, number> = {};
  for (const doc of allDocs) {
    byType[doc.type] = (byType[doc.type] || 0) + 1;
  }

  const planInfo = PLAN_LIMITS[user[0].plan] || PLAN_LIMITS.free;

  res.json({
    totalDocuments: allDocs.length,
    documentsThisMonth: docsThisMonth.length,
    documentsByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    planLimits: {
      plan: user[0].plan,
      limit: planInfo.documentsPerMonth,
      used: docsThisMonth.length,
    },
  });
});

router.get("/documents/recent", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const docs = await db.select().from(documentsTable)
    .where(eq(documentsTable.userId, user[0].id))
    .orderBy(desc(documentsTable.createdAt))
    .limit(5);

  res.json(docs.map(d => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    type: d.type,
    status: d.status,
    content: d.content,
    metadata: d.metadata,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  })));
});

router.get("/documents", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const queryParsed = ListDocumentsQueryParams.safeParse(req.query);
  const filters: any[] = [eq(documentsTable.userId, user[0].id)];

  if (queryParsed.success) {
    if (queryParsed.data.type) {
      filters.push(eq(documentsTable.type, queryParsed.data.type));
    }
    if (queryParsed.data.status) {
      filters.push(eq(documentsTable.status, queryParsed.data.status));
    }
  }

  const docs = await db.select().from(documentsTable)
    .where(and(...filters))
    .orderBy(desc(documentsTable.createdAt));

  res.json(docs.map(d => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    type: d.type,
    status: d.status,
    content: d.content,
    metadata: d.metadata,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  })));
});

router.post("/documents", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, type, answers } = parsed.data;

  const planInfo = PLAN_LIMITS[user[0].plan] || PLAN_LIMITS.free;
  if (!planInfo.documentTypes.includes(type)) {
    res.status(403).json({ error: "This document type requires a higher plan" });
    return;
  }

  if (planInfo.documentsPerMonth !== null) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(documentsTable)
      .where(and(
        eq(documentsTable.userId, user[0].id),
        sql`${documentsTable.createdAt} >= ${startOfMonth}`
      ));
    const usedThisMonth = Number(countResult[0]?.count ?? 0);
    if (usedThisMonth >= planInfo.documentsPerMonth) {
      res.status(403).json({ error: "Monthly document limit reached. Please upgrade your plan." });
      return;
    }
  }

  const content = generateDocumentContent(type, answers as Record<string, string>);

  const doc = await db.insert(documentsTable).values({
    userId: user[0].id,
    title,
    type,
    status: "completed",
    content,
    metadata: JSON.stringify(answers),
  }).returning();

  const d = doc[0];
  res.status(201).json({
    id: d.id,
    userId: d.userId,
    title: d.title,
    type: d.type,
    status: d.status,
    content: d.content,
    metadata: d.metadata,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  });
});

router.get("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const doc = await db.select().from(documentsTable)
    .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, user[0].id)))
    .limit(1);

  if (!doc.length) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const d = doc[0];
  res.json({
    id: d.id,
    userId: d.userId,
    title: d.title,
    type: d.type,
    status: d.status,
    content: d.content,
    metadata: d.metadata,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  });
});

router.patch("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = await db.update(documentsTable)
    .set(parsed.data)
    .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, user[0].id)))
    .returning();

  if (!updated.length) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const d = updated[0];
  res.json({
    id: d.id,
    userId: d.userId,
    title: d.title,
    type: d.type,
    status: d.status,
    content: d.content,
    metadata: d.metadata,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  });
});

router.delete("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  await db.delete(documentsTable)
    .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, user[0].id)));

  res.status(204).send();
});

router.get("/documents/:id/download", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const doc = await db.select().from(documentsTable)
    .where(and(eq(documentsTable.id, id), eq(documentsTable.userId, user[0].id)))
    .limit(1);

  if (!doc.length) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const d = doc[0];
  res.json({
    id: d.id,
    title: d.title,
    content: d.content || "",
  });
});

export default router;
