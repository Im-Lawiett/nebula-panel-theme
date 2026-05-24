import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// In-memory notifications store per user (keyed by userId)
const notificationsStore: Record<number, Array<{
  id: number; title: string; message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean; createdAt: string;
}>> = {};

let nextId = 1000;

function seedNotifications(userId: number, role: string) {
  if (notificationsStore[userId]) return;
  const base = [
    { title: "Welcome to Nebula Panel", message: "Your panel theme is fully installed and ready.", type: "success" as const },
    { title: "Server Online", message: "Server 'Game-01' has started successfully.", type: "info" as const },
  ];
  if (role === "admin" || role === "dev") {
    base.push({ title: "New User Registered", message: "User 'playerone' just created an account.", type: "info" as const });
  }
  if (role === "dev") {
    base.push({ title: "Protect Feature Alert", message: "Anti-DDoS Layer protection was toggled.", type: "warning" as const });
    base.push({ title: "Maintenance Reminder", message: "Scheduled maintenance window in 2 hours.", type: "warning" as const });
  }
  notificationsStore[userId] = base.map((n, i) => ({
    ...n, id: nextId++, read: i === 0,
    createdAt: new Date(Date.now() - (base.length - i) * 3600000).toISOString(),
  }));
}

router.get("/notifications", requireAuth, (req: any, res) => {
  seedNotifications(req.user.id, req.user.role);
  const list = notificationsStore[req.user.id] ?? [];
  res.json([...list].reverse());
});

router.post("/notifications/:id/read", requireAuth, (req: any, res) => {
  seedNotifications(req.user.id, req.user.role);
  const id = parseInt(req.params.id);
  const list = notificationsStore[req.user.id] ?? [];
  const n = list.find((x) => x.id === id);
  if (!n) return res.status(404).json({ error: "Not found" });
  n.read = true;
  res.json(n);
});

router.post("/notifications/read-all", requireAuth, (req: any, res) => {
  seedNotifications(req.user.id, req.user.role);
  (notificationsStore[req.user.id] ?? []).forEach((n) => { n.read = true; });
  res.json({ ok: true });
});

export default router;
