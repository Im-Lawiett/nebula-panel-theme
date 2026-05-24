import { Router } from "express";
import { db, serversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

function srvJson(s: typeof serversTable.$inferSelect) {
  return { id: s.id, name: s.name, status: s.status, owner: s.owner, node: s.node, ram: s.ram, cpu: s.cpu, disk: s.disk };
}

router.get("/servers", requireAuth, async (_req, res) => {
  const servers = await db.select().from(serversTable);
  res.json(servers.map(srvJson));
});

router.get("/servers/:id", requireAuth, async (req, res) => {
  const [server] = await db.select().from(serversTable).where(eq(serversTable.id, parseInt(req.params.id)));
  if (!server) { res.status(404).json({ error: "Server not found" }); return; }
  res.json(srvJson(server));
});

router.post("/servers", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, owner, node, ram, cpu, disk } = req.body;
  if (!name || !owner || !node) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [created] = await db.insert(serversTable).values({
    name, owner, node,
    ram: ram ?? 1024, cpu: cpu ?? 100, disk: disk ?? 10240,
    status: "installing",
  }).returning();
  setTimeout(async () => {
    await db.update(serversTable).set({ status: "stopped" }).where(eq(serversTable.id, created.id));
  }, 3000);
  res.status(201).json(srvJson(created));
});

router.delete("/servers/:id", requireAuth, requireRole("admin"), async (req, res) => {
  await db.delete(serversTable).where(eq(serversTable.id, parseInt(req.params.id)));
  res.status(204).end();
});

// Power control: start | stop | restart | kill
router.post("/servers/:id/power", requireAuth, async (req, res) => {
  const { action } = req.body;
  const id = parseInt(req.params.id);
  const [server] = await db.select().from(serversTable).where(eq(serversTable.id, id));
  if (!server) { res.status(404).json({ error: "Server not found" }); return; }

  let newStatus: "running" | "stopped" | "installing" | "suspended" = server.status as any;

  switch (action) {
    case "start":   newStatus = "running";  break;
    case "stop":    newStatus = "stopped";  break;
    case "kill":    newStatus = "stopped";  break;
    case "restart":
      await db.update(serversTable).set({ status: "installing" }).where(eq(serversTable.id, id));
      setTimeout(async () => {
        await db.update(serversTable).set({ status: "running" }).where(eq(serversTable.id, id));
      }, 2000);
      res.json({ ...srvJson(server), status: "installing" });
      return;
  }

  const [updated] = await db.update(serversTable).set({ status: newStatus }).where(eq(serversTable.id, id)).returning();
  res.json(srvJson(updated));
});

export default router;
