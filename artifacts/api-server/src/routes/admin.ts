import { Router } from "express";
import { db, nodesTable, locationsTable, usersTable, nestsTable, eggsTable, apiKeysTable, panelSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

// ===== ADMIN STATS =====
router.get("/admin/stats", async (req, res) => {
  try {
    const [nodes, users] = await Promise.all([
      db.select().from(nodesTable),
      db.select().from(usersTable),
    ]);
    const totalRam = nodes.reduce((s, n) => s + n.totalMemory, 0);
    const usedRam = nodes.reduce((s, n) => s + n.usedMemory, 0);
    const totalDisk = nodes.reduce((s, n) => s + n.totalDisk, 0);
    const usedDisk = nodes.reduce((s, n) => s + n.usedDisk, 0);
    res.json({
      totalServers: 8, activeServers: 5,
      totalUsers: users.length, totalNodes: nodes.length,
      totalRam, usedRam, totalDisk, usedDisk,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ===== ADMIN SERVERS =====
router.get("/admin/servers", (req, res) => {
  res.json([
    { id: 1, uuid: "18bdad52-96e6-47c5-ba4f-a1b2c3d4e5f6", name: "Roseeunli", owner: "dilzz", ownerUserId: 1, node: "node-nyk1", egg: "Paper MC 1.20", cpuLimit: 0, memoryLimit: 4096, diskLimit: 20480, status: "running" },
    { id: 2, uuid: "2ab3c4d5-e6f7-8901-bcde-f01234567890", name: "freeunli", owner: "jelen", ownerUserId: 2, node: "node-nyk1", egg: "Vanilla MC 1.20", cpuLimit: 0, memoryLimit: 1024, diskLimit: 5120, status: "running" },
    { id: 3, uuid: "3bc4d5e6-f789-0123-cdef-012345678901", name: "semogabisayaallahunli", owner: "dilzz", ownerUserId: 1, node: "node-sg1", egg: "Fabric 1.20", cpuLimit: 0, memoryLimit: 2048, diskLimit: 10240, status: "stopped" },
    { id: 4, uuid: "4cd5e6f7-8901-2345-def0-123456789012", name: "lynzraunli", owner: "jelen", ownerUserId: 2, node: "node-nyk1", egg: "NodeJS Bot", cpuLimit: 0, memoryLimit: 512, diskLimit: 2048, status: "running" },
    { id: 5, uuid: "5de6f789-0123-4567-e012-345678901234", name: "ubotisbackunli", owner: "dilzz", ownerUserId: 1, node: "node-sg1", egg: "NodeJS Bot", cpuLimit: 0, memoryLimit: 512, diskLimit: 1024, status: "starting" },
    { id: 6, uuid: "6ef78901-2345-6789-f123-456789012345", name: "kalzzunli", owner: "jelen", ownerUserId: 2, node: "node-nyk1", egg: "Python App", cpuLimit: 0, memoryLimit: 1024, diskLimit: 5120, status: "offline" },
    { id: 7, uuid: "7f089012-3456-789a-0234-567890123456", name: "panounli", owner: "pano", ownerUserId: 3, node: "node-nyk2", egg: "Paper MC 1.19", cpuLimit: 0, memoryLimit: 4096, diskLimit: 20480, status: "running" },
    { id: 8, uuid: "8a190123-4567-89ab-1234-678901234567", name: "madeunli", owner: "pano", ownerUserId: 3, node: "node-sg1", egg: "Vanilla MC 1.18", cpuLimit: 0, memoryLimit: 2048, diskLimit: 15360, status: "stopped" },
  ]);
});

// ===== PANEL SETTINGS =====
router.get("/admin/settings", async (req, res) => {
  try {
    const settings = await db.select().from(panelSettingsTable);
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({
      panelName: map["panel_name"] || "Nebula Panel",
      panelDescription: map["panel_description"] || "Next generation server management panel",
      maintenanceMode: map["maintenance_mode"] === "true",
      maintenanceMessage: map["maintenance_message"] || "Panel sedang dalam maintenance. Silakan coba lagi nanti.",
      antiPeekEnabled: map["anti_peek_enabled"] === "true",
      registrationEnabled: map["registration_enabled"] !== "false",
      developerName: "RianModss",
      developerTelegram: "@RianModss",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.patch("/admin/settings", async (req, res) => {
  try {
    const allowed = ["panel_name", "panel_description", "maintenance_mode", "maintenance_message", "anti_peek_enabled", "registration_enabled"];
    const keyMap: Record<string, string> = {
      panelName: "panel_name",
      panelDescription: "panel_description",
      maintenanceMode: "maintenance_mode",
      maintenanceMessage: "maintenance_message",
      antiPeekEnabled: "anti_peek_enabled",
      registrationEnabled: "registration_enabled",
    };
    for (const [jsKey, dbKey] of Object.entries(keyMap)) {
      if (req.body[jsKey] !== undefined && allowed.includes(dbKey)) {
        const value = String(req.body[jsKey]);
        const existing = await db.select().from(panelSettingsTable).where(eq(panelSettingsTable.key, dbKey));
        if (existing.length > 0) {
          await db.update(panelSettingsTable).set({ value }).where(eq(panelSettingsTable.key, dbKey));
        } else {
          await db.insert(panelSettingsTable).values({ key: dbKey, value });
        }
      }
    }
    const settings = await db.select().from(panelSettingsTable);
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({
      panelName: map["panel_name"] || "Nebula Panel",
      panelDescription: map["panel_description"] || "Next generation server management panel",
      maintenanceMode: map["maintenance_mode"] === "true",
      maintenanceMessage: map["maintenance_message"] || "Panel sedang dalam maintenance. Silakan coba lagi nanti.",
      antiPeekEnabled: map["anti_peek_enabled"] === "true",
      registrationEnabled: map["registration_enabled"] !== "false",
      developerName: "RianModss",
      developerTelegram: "@RianModss",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// ===== NODES =====
router.get("/admin/nodes", async (req, res) => {
  try {
    const nodes = await db.select().from(nodesTable);
    const locs = await db.select().from(locationsTable);
    const locMap = Object.fromEntries(locs.map((l) => [l.id, l.short]));
    res.json(nodes.map((n) => ({ ...n, location: locMap[n.locationId] || "Unknown" })));
  } catch (err) {
    req.log.error({ err }, "Failed to list nodes");
    res.status(500).json({ error: "Failed to list nodes" });
  }
});

router.post("/admin/nodes", async (req, res) => {
  try {
    const { name, fqdn, locationId, memory, memoryOverallocate, disk, diskOverallocate, daemonBase, daemonSftp, daemonListen, behindProxy, maintenanceMode } = req.body;
    if (!name || !fqdn || !locationId || !memory || !disk) {
      return res.status(400).json({ error: "name, fqdn, locationId, memory, disk required" });
    }
    const [node] = await db.insert(nodesTable).values({
      name, fqdn, locationId: Number(locationId),
      totalMemory: Number(memory), usedMemory: 0,
      totalDisk: Number(disk), usedDisk: 0,
      memoryOverallocate: Number(memoryOverallocate || 0),
      diskOverallocate: Number(diskOverallocate || 0),
      daemonBase: daemonBase || "/var/lib/pterodactyl/volumes",
      daemonSftp: Number(daemonSftp || 2022),
      daemonListen: Number(daemonListen || 8080),
      behindProxy: Boolean(behindProxy),
      maintenanceMode: Boolean(maintenanceMode),
      status: "online", daemonVersion: "1.11.13",
    }).returning();
    const locs = await db.select().from(locationsTable);
    const locMap = Object.fromEntries(locs.map((l) => [l.id, l.short]));
    res.status(201).json({ ...node, location: locMap[node.locationId] || "Unknown" });
  } catch (err) {
    req.log.error({ err }, "Failed to create node");
    res.status(500).json({ error: "Failed to create node" });
  }
});

router.get("/admin/nodes/:id", async (req, res) => {
  try {
    const [node] = await db.select().from(nodesTable).where(eq(nodesTable.id, Number(req.params.id)));
    if (!node) return res.status(404).json({ error: "Node not found" });
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, node.locationId));
    res.json({ ...node, location: loc?.short || "Unknown" });
  } catch (err) {
    req.log.error({ err }, "Failed to get node");
    res.status(500).json({ error: "Failed to get node" });
  }
});

router.patch("/admin/nodes/:id", async (req, res) => {
  try {
    const { name, fqdn, memory, disk, maintenanceMode } = req.body;
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (fqdn) updates.fqdn = fqdn;
    if (memory != null) updates.totalMemory = Number(memory);
    if (disk != null) updates.totalDisk = Number(disk);
    if (maintenanceMode != null) updates.maintenanceMode = Boolean(maintenanceMode);
    const [node] = await db.update(nodesTable).set(updates).where(eq(nodesTable.id, Number(req.params.id))).returning();
    if (!node) return res.status(404).json({ error: "Node not found" });
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, node.locationId));
    res.json({ ...node, location: loc?.short || "Unknown" });
  } catch (err) {
    req.log.error({ err }, "Failed to update node");
    res.status(500).json({ error: "Failed to update node" });
  }
});

router.delete("/admin/nodes/:id", async (req, res) => {
  try {
    await db.delete(nodesTable).where(eq(nodesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete node");
    res.status(500).json({ error: "Failed to delete node" });
  }
});

// ===== USERS =====
router.get("/admin/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.post("/admin/users", async (req, res) => {
  try {
    const { username, email, firstName, lastName, isAdmin } = req.body;
    if (!username || !email || !firstName || !lastName) {
      return res.status(400).json({ error: "username, email, firstName, lastName required" });
    }
    const [user] = await db.insert(usersTable).values({
      username, email, firstName, lastName,
      isAdmin: Boolean(isAdmin), isBanned: false, banReason: "", serverCount: 0,
    }).returning();
    res.status(201).json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/admin/users/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id)));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.patch("/admin/users/:id", async (req, res) => {
  try {
    const { username, email, firstName, lastName, isAdmin } = req.body;
    const updates: Record<string, unknown> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (isAdmin != null) updates.isAdmin = Boolean(isAdmin);
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, Number(req.params.id))).returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to update user");
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/admin/users/:id", async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete user");
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Ban user
router.post("/admin/users/:id/ban", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (userId === 1) return res.status(403).json({ error: "Cannot ban the panel owner (ID 1)" });
    const { reason } = req.body;
    const [user] = await db.update(usersTable)
      .set({ isBanned: true, banReason: reason || "Banned by administrator" })
      .where(eq(usersTable.id, userId))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to ban user");
    res.status(500).json({ error: "Failed to ban user" });
  }
});

// Unban user
router.post("/admin/users/:id/unban", async (req, res) => {
  try {
    const [user] = await db.update(usersTable)
      .set({ isBanned: false, banReason: "" })
      .where(eq(usersTable.id, Number(req.params.id)))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to unban user");
    res.status(500).json({ error: "Failed to unban user" });
  }
});

// ===== LOCATIONS =====
router.get("/admin/locations", async (req, res) => {
  try {
    const locations = await db.select().from(locationsTable);
    res.json(locations.map((l) => ({ ...l, nodeCount: 0, serverCount: 0 })));
  } catch (err) {
    req.log.error({ err }, "Failed to list locations");
    res.status(500).json({ error: "Failed to list locations" });
  }
});

router.post("/admin/locations", async (req, res) => {
  try {
    const { short, long } = req.body;
    if (!short || !long) return res.status(400).json({ error: "short and long required" });
    const [loc] = await db.insert(locationsTable).values({ short, long }).returning();
    res.status(201).json({ ...loc, nodeCount: 0, serverCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create location");
    res.status(500).json({ error: "Failed to create location" });
  }
});

// ===== NESTS / EGGS =====
router.get("/admin/nests", async (req, res) => {
  try {
    const nests = await db.select().from(nestsTable);
    res.json(nests);
  } catch (err) {
    req.log.error({ err }, "Failed to list nests");
    res.status(500).json({ error: "Failed to list nests" });
  }
});

router.get("/admin/nests/:nestId/eggs", async (req, res) => {
  try {
    const eggs = await db.select().from(eggsTable).where(eq(eggsTable.nestId, Number(req.params.nestId)));
    res.json(eggs);
  } catch (err) {
    req.log.error({ err }, "Failed to list eggs");
    res.status(500).json({ error: "Failed to list eggs" });
  }
});

// ===== API KEYS =====
router.get("/admin/api-keys", async (req, res) => {
  try {
    const keys = await db.select().from(apiKeysTable);
    res.json(keys.map((k) => ({ ...k, allowedIps: k.allowedIps ? k.allowedIps.split(",").filter(Boolean) : [] })));
  } catch (err) {
    req.log.error({ err }, "Failed to list API keys");
    res.status(500).json({ error: "Failed to list API keys" });
  }
});

router.post("/admin/api-keys", async (req, res) => {
  try {
    const { description, allowedIps } = req.body;
    if (!description) return res.status(400).json({ error: "description required" });
    const identifier = "ptla_" + randomBytes(16).toString("hex");
    const token = randomBytes(32).toString("hex");
    const [key] = await db.insert(apiKeysTable).values({
      identifier, token, description,
      allowedIps: Array.isArray(allowedIps) ? allowedIps.join(",") : "",
    }).returning();
    res.status(201).json({ ...key, allowedIps: key.allowedIps ? key.allowedIps.split(",").filter(Boolean) : [] });
  } catch (err) {
    req.log.error({ err }, "Failed to create API key");
    res.status(500).json({ error: "Failed to create API key" });
  }
});

router.delete("/admin/api-keys/:id", async (req, res) => {
  try {
    await db.delete(apiKeysTable).where(eq(apiKeysTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete API key");
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export default router;
