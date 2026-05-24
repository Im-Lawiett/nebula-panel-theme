import { Router } from "express";
import { db, usersTable, serversTable, activityTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/stats/overview", requireAuth, async (_req, res) => {
  const [users, servers] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(serversTable),
  ]);

  const totalUsers = users.length;
  const totalServers = servers.length;
  const activeServers = servers.filter((s) => s.status === "running").length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const devCount = users.filter((u) => u.role === "dev").length;

  res.json({ totalUsers, totalServers, activeServers, bannedUsers, adminCount, devCount });
});

router.get("/stats/activity", requireAuth, async (_req, res) => {
  const logs = await db.select().from(activityTable).orderBy(desc(activityTable.timestamp)).limit(20);
  res.json(
    logs.map((l) => ({
      id: l.id,
      action: l.action,
      user: l.user,
      timestamp: l.timestamp.toISOString(),
      details: l.details ?? null,
    }))
  );
});

export default router;
