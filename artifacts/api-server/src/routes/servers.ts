import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

// ─── List servers ─────────────────────────────────────────────────────────────
// Staff (dev + admin) see ALL servers. Regular users see only their own.
router.get("/servers", requireAuth, (req: any, res) => {
  const user = req.user;
  const servers = store.isStaff(user)
    ? store.getServers()
    : store.getServersByOwner(user.id);
  res.json(servers.map((s) => store.serverToDto(s)));
});

// ─── Get one server ───────────────────────────────────────────────────────────
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
  const {
    name, description, ownerUsername, node,
    egg, dockerImage, startupCommand, allocation,
    ram, cpu, disk, databases, backups,
  } = req.body ?? {};

  if (!name || !node) {
    res.status(400).json({ error: "Missing required fields: name, node" });
    return;
  }

  const ownerUser = ownerUsername ? store.getUserByUsername(ownerUsername) : req.user;
  if (!ownerUser) {
    res.status(400).json({ error: `User '${ownerUsername}' not found` });
    return;
  }

  const server = store.createServer({
    name,
    description: description ?? "",
    node,
    ownerId: ownerUser.id,
    ownerUsername: ownerUser.username,
    egg: egg ?? "Vanilla",
    dockerImage: dockerImage ?? "ghcr.io/pterodactyl/yolks:java_17",
    startupCommand: startupCommand ?? "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar",
    allocation: allocation ?? "0.0.0.0:25565",
    ram: ram ?? 1024,
    cpu: cpu ?? 100,
    disk: disk ?? 10240,
    databases: databases ?? 0,
    backups: backups ?? 3,
    status: "installing",
  });

  store.logActivity("Server created", req.user.username, `Created '${name}' for ${ownerUser.username} on ${node}`);

  // Simulate install → stopped after 3s
  setTimeout(() => { store.updateServer(server.id, { status: "stopped" }); }, 3000);

  res.status(201).json(store.serverToDto(server));
});

// ─── Update server ────────────────────────────────────────────────────────────
router.patch("/servers/:id", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const id = parseInt(req.params.id);
  const { name, description, node, egg, ram, cpu, disk, databases, backups } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (node !== undefined) updates.node = node;
  if (egg !== undefined) updates.egg = egg;
  if (ram !== undefined) updates.ram = ram;
  if (cpu !== undefined) updates.cpu = cpu;
  if (disk !== undefined) updates.disk = disk;
  if (databases !== undefined) updates.databases = databases;
  if (backups !== undefined) updates.backups = backups;
  const server = store.updateServer(id, updates as any);
  if (!server) { res.status(404).json({ error: "Not found" }); return; }
  store.logActivity("Server updated", req.user.username, `Updated '${server.name}'`);
  res.json(store.serverToDto(server));
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

// ─── Suspend / Unsuspend ──────────────────────────────────────────────────────
router.post("/servers/:id/suspend", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Not found" }); return; }
  store.updateServer(server.id, { status: "suspended" });
  store.logActivity("Server suspended", req.user.username, server.name);
  res.json(store.serverToDto(store.getServerById(server.id)!));
});

router.post("/servers/:id/unsuspend", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Not found" }); return; }
  store.updateServer(server.id, { status: "stopped" });
  store.logActivity("Server unsuspended", req.user.username, server.name);
  res.json(store.serverToDto(store.getServerById(server.id)!));
});

// ─── Live resource stats (simulated) ─────────────────────────────────────────
router.get("/servers/:id/resources", requireAuth, (req: any, res) => {
  const server = store.getServerById(parseInt(req.params.id));
  if (!server) { res.status(404).json({ error: "Not found" }); return; }
  if (!store.canAccessServer(req.user, server)) {
    res.status(403).json({ error: "Access denied" }); return;
  }
  const on = server.status === "running";
  res.json({
    cpuAbsolute: on ? Math.round((Math.random() * 40 + 5) * 10) / 10 : 0,
    memoryBytes: on ? Math.floor(Math.random() * server.ram * 0.5 * 1048576 + server.ram * 0.15 * 1048576) : 0,
    memoryLimitBytes: server.ram * 1048576,
    diskBytes: Math.floor(server.disk * 0.24 * 1048576),
    diskLimitBytes: server.disk * 1048576,
    networkRxBytes: on ? Math.floor(Math.random() * 512000) : 0,
    networkTxBytes: on ? Math.floor(Math.random() * 204800) : 0,
    uptime: on ? Math.floor(Math.random() * 86400 + 3600) : 0,
    state: server.status,
  });
});

export default router;
