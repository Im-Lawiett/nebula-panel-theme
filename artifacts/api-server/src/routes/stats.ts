import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/stats/overview", requireAuth, (_req, res) => {
  const users   = store.getUsers();
  const servers = store.getServers();
  res.json({
    totalUsers:    users.length,
    totalServers:  servers.length,
    activeServers: servers.filter((s) => s.status === "running").length,
    bannedUsers:   users.filter((u) => u.isBanned).length,
    adminCount:    users.filter((u) => u.id !== 1 && u.role === "admin").length,
    devCount:      1, // always 1 — ID 1 is the only dev
  });
});

router.get("/stats/activity", requireAuth, (_req, res) => {
  res.json(store.getActivity(20));
});

export default router;
