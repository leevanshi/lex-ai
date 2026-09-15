import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId as string;

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);

  if (!user.length) {
    const auth = getAuth(req);
    const newUser = await db.insert(usersTable).values({
      clerkId: clerkUserId,
      email: (auth as any)?.sessionClaims?.email || "",
      plan: "free",
    }).returning();

    await db.insert(subscriptionsTable).values({
      userId: newUser[0].id,
      plan: "free",
      status: "active",
    });

    res.json({
      id: newUser[0].id,
      clerkId: newUser[0].clerkId,
      email: newUser[0].email,
      name: newUser[0].name,
      plan: newUser[0].plan,
      createdAt: newUser[0].createdAt.toISOString(),
    });
    return;
  }

  const u = user[0];
  res.json({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    name: u.name,
    plan: u.plan,
    createdAt: u.createdAt.toISOString(),
  });
});

export default router;
