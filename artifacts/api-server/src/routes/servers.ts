import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

// ─── List servers ─────────────────────────────────────────────────────────────
// ID 1 sees ALL servers. Everyone else sees only their own.
router.get("/servers", requireAuth, (req: any, res) => {
  const user = req.user;
  const servers = store.isDev(user) ? store.getServers() : store.getServersByOwner(user.id);
  res.json(servers.map((s) => store.serverToDto(s)));
});

// ─── Get one server ───────────────────────────────────────────────────────────
// ID 1 can open any server. Others get 403 if not their own.
router.get("/servers/:id", requireAuth, (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Server not found" }); return; }
  if (!store.canAccessServer(req.user, server)) {
    res.status(403).json({ error: "You do not have access to this server" }); return;
  }
  res.json(store.serverToDto(server));
});

// ─── Create server ────────────────────────────────────────────────────────────
router.post("/servers", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const { name, ownerUsername, node, ram, cpu, disk } = req.body ?? {};
  if (!name || !node) { res.status(400).json({ error: "Missing required fields (name, node)" }); return; }
  // Resolve owner by username or default to current user
  const ownerUser = ownerUsername ? store.getUserByUsername(ownerUsername) : req.user;
  if (!ownerUser) { res.status(400).json({ error: `User '${ownerUsername}' not found` }); return; }
  const server = store.createServer({
    name, node,
    ownerId: ownerUser.id,
    ownerUsername: ownerUser.username,
    ram: ram ?? 1024, cpu: cpu ?? 100, disk: disk ?? 10240,
    status: "installing",
  });
  store.logActivity("Server created", req.user.username, `Created '${name}' for ${ownerUser.username}`);
  // Simulate install → stopped
  setTimeout(() => { store.updateServer(server.id, { status: "stopped" }); }, 3000);
  res.status(201).json(store.serverToDto(server));
});

// ─── Delete server ────────────────────────────────────────────────────────────
router.delete("/servers/:id", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Not found" }); return; }
  store.deleteServer(server.id);
  store.logActivity("Server deleted", req.user.username, `Deleted '${server.name}'`);
  res.status(204).end();
});

// ─── Power control ────────────────────────────────────────────────────────────
router.post("/servers/:id/power", requireAuth, (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Server not found" }); return; }
  if (!store.canAccessServer(req.user, server)) {
    res.status(403).json({ error: "Access denied" }); return;
  }

  const { action } = req.body ?? {};
  switch (action) {
    case "start":
      store.updateServer(server.id, { status: "running" });
      store.logActivity("Server started", req.user.username, server.name);
      break;
    case "stop":
    case "kill":
      store.updateServer(server.id, { status: "stopped" });
      store.logActivity("Server stopped", req.user.username, server.name);
      break;
    case "restart":
      store.updateServer(server.id, { status: "installing" });
      store.logActivity("Server restarted", req.user.username, server.name);
      setTimeout(() => { store.updateServer(server.id, { status: "running" }); }, 2000);
      res.json({ ...store.serverToDto(server), status: "installing" });
      return;
    default:
      res.status(400).json({ error: "Invalid action" }); return;
  }
  res.json(store.serverToDto(store.getServerById(server.id)!));
});

export default router;
