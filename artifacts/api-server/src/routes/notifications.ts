import { Router } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const notificationsStore: Record<number, Array<{
  id: number; title: string; message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean; createdAt: string;
}>> = {};

let nextId = 1000;

function seedNotifications(userId: number, role: string) {
  if (notificationsStore[userId]) return;
  const base: Array<{ title: string; message: string; type: "info" | "warning" | "success" | "error" }> = [
    { title: "Welcome to Nebula Panel", message: "Your panel is installed and ready.", type: "success" },
    { title: "Server Online", message: "Server 'Survival SMP' has started successfully.", type: "info" },
  ];
  if (role === "admin" || role === "dev") {
    base.push({ title: "New User Registered", message: "User 'playerone' just created an account.", type: "info" });
  }
  if (role === "dev") {
    base.push({ title: "Protect Feature Alert", message: "Anti-DDoS Layer was toggled.", type: "warning" });
    base.push({ title: "Maintenance Reminder", message: "Scheduled maintenance in 2 hours.", type: "warning" });
  }
  notificationsStore[userId] = base.map((n, i) => ({
    ...n, id: nextId++, read: i === 0,
    createdAt: new Date(Date.now() - (base.length - i) * 3600000).toISOString(),
  }));
}

router.get("/notifications", requireAuth, (req: any, res) => {
  const role = req.user.id === 1 ? "dev" : req.user.role;
  seedNotifications(req.user.id, role);
  res.json([...(notificationsStore[req.user.id] ?? [])].reverse());
});

router.post("/notifications/:id/read", requireAuth, (req: any, res) => {
  const role = req.user.id === 1 ? "dev" : req.user.role;
  seedNotifications(req.user.id, role);
  const n = (notificationsStore[req.user.id] ?? []).find((x) => x.id === parseInt(req.params.id));
  if (!n) { res.status(404).json({ error: "Not found" }); return; }
  n.read = true;
  res.json(n);
});

router.post("/notifications/read-all", requireAuth, (req: any, res) => {
  const role = req.user.id === 1 ? "dev" : req.user.role;
  seedNotifications(req.user.id, role);
  (notificationsStore[req.user.id] ?? []).forEach((n) => { n.read = true; });
  res.json({ ok: true });
});

export default router;
