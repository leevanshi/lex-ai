import { Router } from "express";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { UpgradeSubscriptionBody } from "@workspace/api-zod";

const router = Router();

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: ["3 documents per month", "NDA templates only", "PDF download", "Email support"],
    documentTypes: ["nda"],
    documentsPerMonth: 3,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    interval: "month",
    features: [
      "20 documents per month",
      "NDAs, Service Agreements, IP Assignments, Employment Contracts",
      "PDF & Word download",
      "Priority email support",
      "Document history",
    ],
    documentTypes: ["nda", "service-agreement", "ip-assignment", "employment-contract"],
    documentsPerMonth: 20,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    features: [
      "Unlimited documents",
      "All document types including Terms of Service and Privacy Policies",
      "All download formats",
      "Dedicated support",
      "Custom branding",
      "Team collaboration",
    ],
    documentTypes: ["nda", "service-agreement", "ip-assignment", "employment-contract", "terms-of-service", "privacy-policy", "founder-agreement"],
    documentsPerMonth: null,
  },
];

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

router.get("/users/me/subscription", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;

  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, user[0].id)).limit(1);

  if (!sub.length) {
    const newSub = await db.insert(subscriptionsTable).values({
      userId: user[0].id,
      plan: user[0].plan,
      status: "active",
    }).returning();
    res.json({
      id: newSub[0].id,
      userId: newSub[0].userId,
      plan: newSub[0].plan,
      status: newSub[0].status,
      currentPeriodEnd: newSub[0].currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: newSub[0].cancelAtPeriodEnd,
    });
    return;
  }

  const s = sub[0];
  res.json({
    id: s.id,
    userId: s.userId,
    plan: s.plan,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
  });
});

router.post("/subscriptions/upgrade", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpgradeSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const { plan } = parsed.data;
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.update(usersTable).set({ plan }).where(eq(usersTable.clerkId, clerkUserId));

  const sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, user[0].id)).limit(1);

  let updated;
  if (sub.length) {
    updated = await db.update(subscriptionsTable)
      .set({ plan, status: "active", currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false })
      .where(eq(subscriptionsTable.userId, user[0].id))
      .returning();
  } else {
    updated = await db.insert(subscriptionsTable).values({
      userId: user[0].id,
      plan,
      status: "active",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    }).returning();
  }

  const s = updated[0];
  res.json({
    id: s.id,
    userId: s.userId,
    plan: s.plan,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
  });
});

router.post("/subscriptions/cancel", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
  if (!user.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const updated = await db.update(subscriptionsTable)
    .set({ cancelAtPeriodEnd: true, status: "cancelled" })
    .where(eq(subscriptionsTable.userId, user[0].id))
    .returning();

  if (!updated.length) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  await db.update(usersTable).set({ plan: "free" }).where(eq(usersTable.clerkId, clerkUserId));

  const s = updated[0];
  res.json({
    id: s.id,
    userId: s.userId,
    plan: s.plan,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
  });
});

export default router;
