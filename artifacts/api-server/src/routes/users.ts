import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { BanUserBody, UpdateUserBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function userToDto(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    banReason: user.banReason ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", requireAuth, async (req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(userToDto));
});

router.post("/users", requireAuth, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ username, email, passwordHash, role }).returning();
  await db.insert(activityTable).values({ action: "User created", user: (req as any).user?.username ?? "system", details: `Created user ${username}` });
  res.status(201).json(userToDto(user));
});

router.get("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(userToDto(user));
});

router.patch("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.username) updates.username = parsed.data.username;
  if (parsed.data.email) updates.email = parsed.data.email;
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.password) updates.passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityTable).values({ action: "User updated", user: (req as any).user?.username ?? "system", details: `Updated user ${user.username}` });
  res.json(userToDto(user));
});

router.delete("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityTable).values({ action: "User deleted", user: (req as any).user?.username ?? "system", details: `Deleted user ${user.username}` });
  res.status(204).send();
});

router.post("/users/:id/ban", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = BanUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [user] = await db.update(usersTable).set({ isBanned: true, banReason: parsed.data.reason }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityTable).values({ action: "User banned", user: (req as any).user?.username ?? "system", details: `Banned ${user.username}: ${parsed.data.reason}` });
  res.json(userToDto(user));
});

router.post("/users/:id/unban", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.update(usersTable).set({ isBanned: false, banReason: null }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityTable).values({ action: "User unbanned", user: (req as any).user?.username ?? "system", details: `Unbanned ${user.username}` });
  res.json(userToDto(user));
});

export default router;
