import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "nebula-secret-key";

function userToJson(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    banReason: user.banReason,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: userToJson(user) });
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    res.json(userToJson(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.put("/auth/profile", requireAuth, async (req: any, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (email) updates.email = email;

  if (newPassword) {
    if (!currentPassword) { res.status(400).json({ error: "Current password required" }); return; }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: "Current password incorrect" }); return; }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    res.json(userToJson(user));
    return;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  res.json(userToJson(updated));
});

export default router;
