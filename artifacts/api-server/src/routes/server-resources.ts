import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// ─── IN-MEMORY STORES ────────────────────────────────────────────────────────
const filesStore: Record<number, Record<string, { name: string; type: "file" | "dir"; size: number; mode: number; modifiedAt: string; content?: string }[]>> = {};
const dbsStore: Record<number, Array<{ id: number; name: string; username: string; host: string; port: number; password: string; createdAt: string }>> = {};
const backupsStore: Record<number, Array<{ uuid: string; name: string; successful: boolean; locked: boolean; size: number; createdAt: string; completedAt: string | null }>> = {};
const schedulesStore: Record<number, Array<{ id: number; name: string; cron: { minute: string; hour: string; dom: string; month: string; dow: string }; active: boolean; processing: boolean; lastRunAt: string | null; nextRunAt: string; tasks: Array<{ id: number; action: string; payload: string; timeOffset: number }> }>> = {};
const allocationsStore: Record<number, Array<{ id: number; ip: string; port: number; alias: string | null; primary: boolean }>> = {};
const startupStore: Record<number, { startup: string; variables: Array<{ name: string; description: string; envVariable: string; defaultValue: string; serverValue: string; isEditable: boolean; rules: string }> }> = {};
const subusersStore: Record<number, Array<{ uuid: string; username: string; email: string; twoFactorEnabled: boolean; createdAt: string; permissions: string[] }>> = {};
let nextDbId = 100; let nextSchedId = 100; let nextAllocId = 100;

function seedFiles(sid: number) {
  if (filesStore[sid]) return;
  filesStore[sid] = {
    "/": [
      { name: "server.jar", type: "file", size: 40265728, mode: 33188, modifiedAt: new Date(Date.now() - 86400000).toISOString() },
      { name: "start.sh", type: "file", size: 312, mode: 33188, modifiedAt: new Date(Date.now() - 3600000).toISOString(), content: "#!/bin/bash\njava -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar" },
      { name: "eula.txt", type: "file", size: 183, mode: 33188, modifiedAt: new Date(Date.now() - 7200000).toISOString(), content: "eula=true" },
      { name: "server.properties", type: "file", size: 1024, mode: 33188, modifiedAt: new Date().toISOString(), content: "server-port=25565\nmotd=A Minecraft Server\nmax-players=20\nonline-mode=true\ndifficulty=easy" },
      { name: "logs", type: "dir", size: 0, mode: 16877, modifiedAt: new Date().toISOString() },
      { name: "plugins", type: "dir", size: 0, mode: 16877, modifiedAt: new Date().toISOString() },
      { name: "world", type: "dir", size: 0, mode: 16877, modifiedAt: new Date().toISOString() },
    ],
    "/logs": [
      { name: "latest.log", type: "file", size: 8192, mode: 33188, modifiedAt: new Date().toISOString(), content: "[INFO] Server started\n[INFO] Done (2.456s)" },
    ],
    "/plugins": [
      { name: "EssentialsX.jar", type: "file", size: 2097152, mode: 33188, modifiedAt: new Date().toISOString() },
      { name: "Vault.jar", type: "file", size: 524288, mode: 33188, modifiedAt: new Date().toISOString() },
    ],
    "/world": [
      { name: "level.dat", type: "file", size: 4096, mode: 33188, modifiedAt: new Date().toISOString() },
      { name: "region", type: "dir", size: 0, mode: 16877, modifiedAt: new Date().toISOString() },
    ],
  };
}

function seedDbs(sid: number) {
  if (dbsStore[sid]) return;
  dbsStore[sid] = [
    { id: nextDbId++, name: `s${sid}_main`, username: `u${sid}_main`, host: "127.0.0.1", port: 3306, password: "****", createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  ];
}

function seedBackups(sid: number) {
  if (backupsStore[sid]) return;
  backupsStore[sid] = [
    { uuid: `backup-${sid}-1`, name: "Auto backup", successful: true, locked: false, size: 52428800, createdAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86400000 + 120000).toISOString() },
  ];
}

function seedSchedules(sid: number) {
  if (schedulesStore[sid]) return;
  schedulesStore[sid] = [
    { id: nextSchedId++, name: "Daily Restart", cron: { minute: "0", hour: "4", dom: "*", month: "*", dow: "*" }, active: true, processing: false, lastRunAt: new Date(Date.now() - 86400000).toISOString(), nextRunAt: new Date(Date.now() + 3600000).toISOString(), tasks: [
      { id: 1, action: "power", payload: "restart", timeOffset: 0 },
    ]},
  ];
}

function seedAllocations(sid: number) {
  if (allocationsStore[sid]) return;
  allocationsStore[sid] = [
    { id: nextAllocId++, ip: "0.0.0.0", port: 25565, alias: null, primary: true },
    { id: nextAllocId++, ip: "0.0.0.0", port: 25575, alias: "rcon", primary: false },
  ];
}

function seedStartup(sid: number) {
  if (startupStore[sid]) return;
  startupStore[sid] = {
    startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
    variables: [
      { name: "Server Jar File", description: "The name of the jar file to use.", envVariable: "SERVER_JARFILE", defaultValue: "server.jar", serverValue: "server.jar", isEditable: true, rules: "required|string" },
      { name: "Server Version", description: "The version of Minecraft to run.", envVariable: "MC_VERSION", defaultValue: "latest", serverValue: "latest", isEditable: true, rules: "required|string" },
      { name: "Build Number", description: "Build number to use.", envVariable: "BUILD_NUMBER", defaultValue: "latest", serverValue: "latest", isEditable: true, rules: "required|string" },
    ],
  };
}

function seedSubusers(sid: number) {
  if (subusersStore[sid]) return;
  subusersStore[sid] = [];
}

// ─── FILE ROUTES ─────────────────────────────────────────────────────────────
router.get("/servers/:id/files/list", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const dir = (req.query.directory as string) || "/";
  seedFiles(sid);
  res.json(filesStore[sid][dir] ?? []);
});

router.get("/servers/:id/files/contents", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const filePath = req.query.file as string;
  if (!filePath) { res.status(400).json({ error: "file required" }); return; }
  seedFiles(sid);
  const dir = "/" + filePath.split("/").slice(1, -1).join("/") || "/";
  const fileName = filePath.split("/").pop() ?? "";
  const dirKey = dir === "//" ? "/" : dir;
  const file = (filesStore[sid][dirKey] ?? []).find((f) => f.name === fileName);
  res.send(file?.content ?? "# File content not available");
});

router.post("/servers/:id/files/write", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const filePath = req.query.file as string;
  const content = req.body;
  if (!filePath) { res.status(400).json({ error: "file required" }); return; }
  seedFiles(sid);
  const dir = filePath.includes("/") ? "/" + filePath.split("/").slice(1, -1).join("/") : "/";
  const fileName = filePath.split("/").pop() ?? "";
  const dirKey = dir === "//" ? "/" : dir;
  if (!filesStore[sid][dirKey]) filesStore[sid][dirKey] = [];
  const existing = filesStore[sid][dirKey].find((f) => f.name === fileName);
  if (existing) {
    existing.content = typeof content === "string" ? content : JSON.stringify(content);
    existing.modifiedAt = new Date().toISOString();
    existing.size = (existing.content ?? "").length;
  } else {
    filesStore[sid][dirKey].push({ name: fileName, type: "file", size: (typeof content === "string" ? content : "").length, mode: 33188, modifiedAt: new Date().toISOString(), content: typeof content === "string" ? content : JSON.stringify(content) });
  }
  res.json({ success: true });
});

router.post("/servers/:id/files/create-folder", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const { name, directory } = req.body;
  seedFiles(sid);
  const dir = directory || "/";
  if (!filesStore[sid][dir]) filesStore[sid][dir] = [];
  filesStore[sid][dir].push({ name, type: "dir", size: 0, mode: 16877, modifiedAt: new Date().toISOString() });
  filesStore[sid][`${dir === "/" ? "" : dir}/${name}`] = [];
  res.json({ success: true });
});

router.post("/servers/:id/files/rename", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const { files, root } = req.body;
  seedFiles(sid);
  const dir = root || "/";
  files.forEach(({ from, to }: { from: string; to: string }) => {
    const item = (filesStore[sid][dir] ?? []).find((f) => f.name === from);
    if (item) item.name = to;
  });
  res.json({ success: true });
});

router.post("/servers/:id/files/delete", requireAuth, (req: any, res) => {
  const sid = parseInt(req.params.id);
  const { files, root } = req.body;
  seedFiles(sid);
  const dir = root || "/";
  filesStore[sid][dir] = (filesStore[sid][dir] ?? []).filter((f) => !files.includes(f.name));
  res.json({ success: true });
});

router.post("/servers/:id/files/upload", requireAuth, upload.array("files"), (req: any, res) => {
  const sid = parseInt(req.params.id);
  const dir = (req.query.directory as string) || "/";
  seedFiles(sid);
  if (!filesStore[sid][dir]) filesStore[sid][dir] = [];
  const uploaded = (req.files as Express.Multer.File[]) ?? [];
  uploaded.forEach((f) => {
    const existing = filesStore[sid][dir].find((x) => x.name === f.originalname);
    if (existing) { existing.size = f.size; existing.modifiedAt = new Date().toISOString(); }
    else filesStore[sid][dir].push({ name: f.originalname, type: "file", size: f.size, mode: 33188, modifiedAt: new Date().toISOString(), content: f.buffer.toString("utf8") });
  });
  res.json({ success: true, files: uploaded.map((f) => f.originalname) });
});

// ─── DATABASE ROUTES ──────────────────────────────────────────────────────────
router.get("/servers/:id/databases", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedDbs(sid); res.json(dbsStore[sid]);
});

router.post("/servers/:id/databases", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedDbs(sid);
  const { name } = req.body;
  const newDb = { id: nextDbId++, name: `s${sid}_${name}`, username: `u${sid}_${name.slice(0, 10)}`, host: "127.0.0.1", port: 3306, password: Math.random().toString(36).slice(2, 14), createdAt: new Date().toISOString() };
  dbsStore[sid].push(newDb); res.status(201).json(newDb);
});

router.delete("/servers/:id/databases/:dbId", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedDbs(sid);
  dbsStore[sid] = dbsStore[sid].filter((d) => d.id !== parseInt(req.params.dbId));
  res.status(204).end();
});

router.post("/servers/:id/databases/:dbId/rotate-password", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedDbs(sid);
  const db = dbsStore[sid].find((d) => d.id === parseInt(req.params.dbId));
  if (!db) { res.status(404).json({ error: "Not found" }); return; }
  db.password = Math.random().toString(36).slice(2, 14);
  res.json(db);
});

// ─── BACKUP ROUTES ────────────────────────────────────────────────────────────
router.get("/servers/:id/backups", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedBackups(sid); res.json(backupsStore[sid]);
});

router.post("/servers/:id/backups", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedBackups(sid);
  const { name, locked, ignored } = req.body;
  const b = { uuid: `backup-${sid}-${Date.now()}`, name: name || `Backup ${new Date().toLocaleString()}`, successful: false, locked: locked ?? false, size: 0, createdAt: new Date().toISOString(), completedAt: null };
  backupsStore[sid].push(b);
  setTimeout(() => { b.successful = true; b.size = Math.floor(Math.random() * 104857600 + 10485760); b.completedAt = new Date().toISOString(); }, 3000);
  res.status(201).json(b);
});

router.delete("/servers/:id/backups/:uuid", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedBackups(sid);
  backupsStore[sid] = backupsStore[sid].filter((b) => b.uuid !== req.params.uuid);
  res.status(204).end();
});

router.post("/servers/:id/backups/:uuid/restore", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id);
  res.json({ success: true, message: "Restore queued" });
});

router.post("/servers/:id/backups/:uuid/lock", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedBackups(sid);
  const b = backupsStore[sid].find((x) => x.uuid === req.params.uuid);
  if (b) b.locked = !b.locked;
  res.json(b ?? { error: "Not found" });
});

// ─── SCHEDULE ROUTES ──────────────────────────────────────────────────────────
router.get("/servers/:id/schedules", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSchedules(sid); res.json(schedulesStore[sid]);
});

router.post("/servers/:id/schedules", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSchedules(sid);
  const { name, cron_minute, cron_hour, cron_dom, cron_month, cron_dow } = req.body;
  const s = { id: nextSchedId++, name, cron: { minute: cron_minute ?? "*", hour: cron_hour ?? "*", dom: cron_dom ?? "*", month: cron_month ?? "*", dow: cron_dow ?? "*" }, active: true, processing: false, lastRunAt: null, nextRunAt: new Date(Date.now() + 3600000).toISOString(), tasks: [] };
  schedulesStore[sid].push(s); res.status(201).json(s);
});

router.delete("/servers/:id/schedules/:schedId", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSchedules(sid);
  schedulesStore[sid] = schedulesStore[sid].filter((s) => s.id !== parseInt(req.params.schedId));
  res.status(204).end();
});

// ─── ALLOCATION / NETWORK ROUTES ─────────────────────────────────────────────
router.get("/servers/:id/allocations", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedAllocations(sid); res.json(allocationsStore[sid]);
});

router.post("/servers/:id/allocations/:allocId/primary", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedAllocations(sid);
  allocationsStore[sid].forEach((a) => { a.primary = a.id === parseInt(req.params.allocId); });
  res.json(allocationsStore[sid]);
});

router.delete("/servers/:id/allocations/:allocId", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedAllocations(sid);
  allocationsStore[sid] = allocationsStore[sid].filter((a) => a.id !== parseInt(req.params.allocId));
  res.status(204).end();
});

// ─── STARTUP ROUTES ───────────────────────────────────────────────────────────
router.get("/servers/:id/startup", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedStartup(sid); res.json(startupStore[sid]);
});

router.put("/servers/:id/startup/variable", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedStartup(sid);
  const { key, value } = req.body;
  const v = startupStore[sid].variables.find((x) => x.envVariable === key);
  if (v) v.serverValue = value;
  res.json(startupStore[sid]);
});

// ─── SUBUSER ROUTES ───────────────────────────────────────────────────────────
router.get("/servers/:id/subusers", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSubusers(sid); res.json(subusersStore[sid]);
});

router.post("/servers/:id/subusers", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSubusers(sid);
  const { email, permissions } = req.body;
  const u = { uuid: `sub-${Date.now()}`, username: email.split("@")[0], email, twoFactorEnabled: false, createdAt: new Date().toISOString(), permissions: permissions ?? [] };
  subusersStore[sid].push(u); res.status(201).json(u);
});

router.delete("/servers/:id/subusers/:uuid", requireAuth, (req, res) => {
  const sid = parseInt(req.params.id); seedSubusers(sid);
  subusersStore[sid] = subusersStore[sid].filter((u) => u.uuid !== req.params.uuid);
  res.status(204).end();
});

// ─── SETTINGS ROUTES ──────────────────────────────────────────────────────────
router.post("/servers/:id/settings/rename", requireAuth, (req, res) => {
  res.json({ success: true });
});

router.post("/servers/:id/settings/reinstall", requireAuth, (req, res) => {
  res.json({ success: true });
});

// ─── EGGS / NESTS ─────────────────────────────────────────────────────────────
const eggs = [
  { id: 1, nestId: 1, nestName: "Minecraft", name: "Vanilla", description: "Vanilla Minecraft server", dockerImage: "ghcr.io/pterodactyl/yolks:java_17", startupCommand: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}" },
  { id: 2, nestId: 1, nestName: "Minecraft", name: "Paper", description: "High performance Minecraft server", dockerImage: "ghcr.io/pterodactyl/yolks:java_17", startupCommand: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}" },
  { id: 3, nestId: 1, nestName: "Minecraft", name: "Forge", description: "Modded Minecraft with Forge", dockerImage: "ghcr.io/pterodactyl/yolks:java_17", startupCommand: "java -Xms128M -XX:MaxRAMPercentage=95.0 @user_jvm_args.txt @libraries/net/minecraftforge/forge/args.txt" },
  { id: 4, nestId: 2, nestName: "Source Engine", name: "CS2", description: "Counter-Strike 2", dockerImage: "ghcr.io/pterodactyl/yolks:steamcmd", startupCommand: "./srcds_run -game csgo +sv_lan 0" },
  { id: 5, nestId: 2, nestName: "Source Engine", name: "Garry's Mod", description: "Garry's Mod dedicated server", dockerImage: "ghcr.io/pterodactyl/yolks:steamcmd", startupCommand: "./srcds_run -game garrysmod +sv_lan 0" },
  { id: 6, nestId: 3, nestName: "Rust", name: "Rust", description: "Rust dedicated server", dockerImage: "ghcr.io/pterodactyl/yolks:steamcmd", startupCommand: "./RustDedicated -batchmode +server.hostname {{SERVER_HOSTNAME}}" },
  { id: 7, nestId: 4, nestName: "Voice Servers", name: "TeamSpeak3", description: "TeamSpeak 3 Server", dockerImage: "ghcr.io/pterodactyl/yolks:debian", startupCommand: "./ts3server_minimal_runscript.sh" },
  { id: 8, nestId: 5, nestName: "Discord Bots", name: "Python", description: "Python Discord Bot", dockerImage: "ghcr.io/pterodactyl/yolks:python_3.11", startupCommand: "python {{PY_FILE}}" },
  { id: 9, nestId: 5, nestName: "Discord Bots", name: "Node.js", description: "Node.js Discord Bot", dockerImage: "ghcr.io/pterodactyl/yolks:nodejs_18", startupCommand: "node {{BOT_JS_FILE}}" },
];

const mounts = [
  { id: 1, name: "Shared Plugins", description: "Shared plugins directory across servers", source: "/mnt/shared/plugins", target: "/home/container/plugins", readOnly: false, userMountable: false, servers: 3 },
  { id: 2, name: "Backup Volume", description: "NFS backup storage mount", source: "/mnt/nfs/backups", target: "/home/container/backups", readOnly: false, userMountable: false, servers: 12 },
  { id: 3, name: "World Templates", description: "Read-only world template files", source: "/mnt/templates/worlds", target: "/home/container/world-templates", readOnly: true, userMountable: true, servers: 5 },
];

const locations = [
  { id: 1, short: "SG", long: "Singapore (AS)", nodes: 2, servers: 15 },
  { id: 2, short: "US-E", long: "US East Coast (NA)", nodes: 3, servers: 24 },
  { id: 3, short: "EU-DE", long: "Frankfurt, Germany (EU)", nodes: 2, servers: 8 },
];

router.get("/eggs", requireAuth, (_req, res) => res.json(eggs));

router.get("/admin/mounts", requireAuth, (_req, res) => res.json(mounts));
router.post("/admin/mounts", requireAuth, (req, res) => {
  const { name, description, source, target, readOnly, userMountable } = req.body;
  const m = { id: mounts.length + 1, name, description: description ?? "", source, target, readOnly: readOnly ?? false, userMountable: userMountable ?? false, servers: 0 };
  mounts.push(m); res.status(201).json(m);
});
router.delete("/admin/mounts/:id", requireAuth, (req, res) => {
  const idx = mounts.findIndex((m) => m.id === parseInt(req.params.id));
  if (idx !== -1) mounts.splice(idx, 1);
  res.status(204).end();
});

router.get("/admin/locations", requireAuth, (_req, res) => res.json(locations));
router.get("/admin/eggs", requireAuth, (_req, res) => res.json(eggs));

export default router;
