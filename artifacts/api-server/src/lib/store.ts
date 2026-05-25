/**
 * Nebula Panel — zero-dependency JSON file database.
 * No DATABASE_URL, no PostgreSQL, no migrations needed.
 * Data stored at: data/db.json (relative to api-server working dir).
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin" | "dev";
  isBanned: boolean;
  banReason: string | null;
  createdAt: string;
}

export interface Server {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerUsername: string;
  node: string;
  egg: string;
  dockerImage: string;
  startupCommand: string;
  allocation: string;
  ram: number;
  cpu: number;
  disk: number;
  databases: number;
  backups: number;
  status: "running" | "stopped" | "installing" | "suspended";
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string;
  details: string | null;
  timestamp: string;
}

export interface PanelSettings {
  panelName: string;
  panelDescription: string;
  panelUrl: string;
  accentColor: string;
  allowRegistration: boolean;
  maintenanceMessage: string;
}

interface StoreData {
  users: User[];
  servers: Server[];
  activity: ActivityLog[];
  settings: PanelSettings;
  _meta: { nextUserId: number; nextServerId: number; nextActivityId: number };
}

// ─── Seed data (created on first run) ────────────────────────────────────────

async function buildSeed(): Promise<StoreData> {
  const [h1, h2, h3] = await Promise.all([
    bcrypt.hash("dev123", 10),
    bcrypt.hash("admin123", 10),
    bcrypt.hash("user123", 10),
  ]);

  const users: User[] = [
    { id: 1, username: "dev",       email: "dev@nebula.local",    passwordHash: h1, role: "dev",   isBanned: false, banReason: null, createdAt: new Date().toISOString() },
    { id: 2, username: "admin",     email: "admin@nebula.local",  passwordHash: h2, role: "admin", isBanned: false, banReason: null, createdAt: new Date().toISOString() },
    { id: 3, username: "playerone", email: "player@nebula.local", passwordHash: h3, role: "user",  isBanned: false, banReason: null, createdAt: new Date().toISOString() },
  ];

  const servers: Server[] = [
    {
      id: 1, name: "Survival SMP", description: "Main survival Minecraft server",
      ownerId: 3, ownerUsername: "playerone", node: "Node-SG01",
      egg: "Paper", dockerImage: "ghcr.io/pterodactyl/yolks:java_17",
      startupCommand: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar",
      allocation: "0.0.0.0:25565",
      ram: 4096, cpu: 200, disk: 20480, databases: 2, backups: 5,
      status: "running", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 2, name: "Creative World", description: "Creative mode server",
      ownerId: 3, ownerUsername: "playerone", node: "Node-US01",
      egg: "Vanilla", dockerImage: "ghcr.io/pterodactyl/yolks:java_17",
      startupCommand: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar",
      allocation: "0.0.0.0:25566",
      ram: 2048, cpu: 100, disk: 10240, databases: 1, backups: 3,
      status: "stopped", createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 3, name: "Dev Test Server", description: "Internal dev testing environment",
      ownerId: 1, ownerUsername: "dev", node: "Node-EU01",
      egg: "Node.js", dockerImage: "ghcr.io/pterodactyl/yolks:nodejs_18",
      startupCommand: "node {{BOT_JS_FILE}}",
      allocation: "0.0.0.0:3000",
      ram: 8192, cpu: 400, disk: 51200, databases: 3, backups: 10,
      status: "running", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 4, name: "Admin Monitor", description: "Server monitoring bot",
      ownerId: 2, ownerUsername: "admin", node: "Node-SG01",
      egg: "Python", dockerImage: "ghcr.io/pterodactyl/yolks:python_3.11",
      startupCommand: "python {{PY_FILE}}",
      allocation: "0.0.0.0:8000",
      ram: 1024, cpu: 50, disk: 5120, databases: 0, backups: 2,
      status: "stopped", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 5, name: "CS2 Competitive", description: "Counter-Strike 2 competitive server",
      ownerId: 3, ownerUsername: "playerone", node: "Node-US01",
      egg: "CS2", dockerImage: "ghcr.io/pterodactyl/yolks:steamcmd",
      startupCommand: "./srcds_run -game csgo +sv_lan 0",
      allocation: "0.0.0.0:27015",
      ram: 4096, cpu: 300, disk: 30720, databases: 0, backups: 3,
      status: "running", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const activity: ActivityLog[] = [
    { id: 1, action: "Server started",  user: "playerone", details: "Server 'Survival SMP' started",   timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, action: "User login",      user: "admin",     details: "Logged in from 192.168.1.1",       timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, action: "Server created",  user: "dev",       details: "Created server 'Dev Test Server'", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  const settings: PanelSettings = {
    panelName: "Nebula Panel",
    panelDescription: "Pterodactyl Panel Theme",
    panelUrl: "",
    accentColor: "blue",
    allowRegistration: false,
    maintenanceMessage: "The panel is currently under maintenance. Please check back later.",
  };

  return { users, servers, activity, settings, _meta: { nextUserId: 4, nextServerId: 6, nextActivityId: 4 } };
}

// ─── Store class ──────────────────────────────────────────────────────────────

class Store {
  private data!: StoreData;
  private ready = false;

  async init() {
    if (this.ready) return;
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      const seed = await buildSeed();
      this.data = seed;
      this.flush();
    } else {
      this.data = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as StoreData;
      // Migrations
      if (!this.data._meta) {
        const maxUid = Math.max(0, ...this.data.users.map((u) => u.id));
        const maxSid = Math.max(0, ...this.data.servers.map((s) => s.id));
        const maxAid = Math.max(0, ...(this.data.activity ?? []).map((a) => a.id));
        this.data._meta = { nextUserId: maxUid + 1, nextServerId: maxSid + 1, nextActivityId: maxAid + 1 };
        this.data.activity = this.data.activity ?? [];
        this.flush();
      }
      if (!this.data.settings) {
        this.data.settings = {
          panelName: "Nebula Panel", panelDescription: "Pterodactyl Panel Theme",
          panelUrl: "", accentColor: "blue", allowRegistration: false,
          maintenanceMessage: "The panel is currently under maintenance.",
        };
        this.flush();
      }
      // Migrate servers to add new fields
      let needsFlush = false;
      for (const s of this.data.servers) {
        if (!s.description) { s.description = ""; needsFlush = true; }
        if (!s.egg) { s.egg = "Vanilla"; needsFlush = true; }
        if (!s.dockerImage) { s.dockerImage = "ghcr.io/pterodactyl/yolks:java_17"; needsFlush = true; }
        if (!s.startupCommand) { s.startupCommand = "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar"; needsFlush = true; }
        if (!s.allocation) { s.allocation = "0.0.0.0:25565"; needsFlush = true; }
        if (s.databases === undefined) { s.databases = 0; needsFlush = true; }
        if (s.backups === undefined) { s.backups = 3; needsFlush = true; }
      }
      if (needsFlush) this.flush();
    }
    this.ready = true;
  }

  flush() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf8");
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  userToDto(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.id === 1 ? "dev" : user.role,
      isBanned: user.isBanned,
      banReason: user.banReason ?? null,
      createdAt: user.createdAt,
    };
  }

  serverToDto(s: Server) {
    return {
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      ownerId: s.ownerId,
      owner: s.ownerUsername,
      node: s.node,
      egg: s.egg ?? "Vanilla",
      dockerImage: s.dockerImage ?? "",
      startupCommand: s.startupCommand ?? "",
      allocation: s.allocation ?? "0.0.0.0:25565",
      ram: s.ram,
      cpu: s.cpu,
      disk: s.disk,
      databases: s.databases ?? 0,
      backups: s.backups ?? 3,
      status: s.status,
      createdAt: s.createdAt,
    };
  }

  isDev(user: User) { return user.id === 1; }
  isAdmin(user: User) { return user.role === "admin" || user.id === 1; }
  isStaff(user: User) { return user.role === "admin" || user.role === "dev" || user.id === 1; }

  canAccessServer(user: User, server: Server) {
    return this.isStaff(user) || server.ownerId === user.id;
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  getSettings(): PanelSettings { return { ...this.data.settings }; }

  updateSettings(updates: Partial<PanelSettings>): PanelSettings {
    Object.assign(this.data.settings, updates);
    this.flush();
    return { ...this.data.settings };
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getUsers() { return [...this.data.users]; }
  getUserById(id: number) { return this.data.users.find((u) => u.id === id) ?? null; }
  getUserByUsername(username: string) { return this.data.users.find((u) => u.username === username) ?? null; }

  createUser(fields: Omit<User, "id" | "createdAt">) {
    const user: User = { ...fields, id: this.data._meta.nextUserId++, createdAt: new Date().toISOString() };
    if (user.id === 1) user.role = "dev";
    this.data.users.push(user);
    this.flush();
    return user;
  }

  updateUser(id: number, updates: Partial<Omit<User, "id" | "createdAt">>) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    if (user.id === 1) user.role = "dev";
    this.flush();
    return user;
  }

  deleteUser(id: number) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.flush();
    return true;
  }

  // ── Servers ────────────────────────────────────────────────────────────────

  getServers() { return [...this.data.servers]; }
  getServerById(id: number) { return this.data.servers.find((s) => s.id === id) ?? null; }
  getServersByOwner(ownerId: number) { return this.data.servers.filter((s) => s.ownerId === ownerId); }

  createServer(fields: Omit<Server, "id" | "createdAt">) {
    const server: Server = { ...fields, id: this.data._meta.nextServerId++, createdAt: new Date().toISOString() };
    this.data.servers.push(server);
    this.flush();
    return server;
  }

  updateServer(id: number, updates: Partial<Omit<Server, "id">>) {
    const server = this.data.servers.find((s) => s.id === id);
    if (!server) return null;
    Object.assign(server, updates);
    this.flush();
    return server;
  }

  deleteServer(id: number) {
    const idx = this.data.servers.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.servers.splice(idx, 1);
    this.flush();
    return true;
  }

  // ── Activity ───────────────────────────────────────────────────────────────

  getActivity(limit = 50) {
    return [...this.data.activity].sort((a, b) => b.id - a.id).slice(0, limit);
  }

  logActivity(action: string, user: string, details?: string) {
    const log: ActivityLog = {
      id: this.data._meta.nextActivityId++,
      action, user,
      details: details ?? null,
      timestamp: new Date().toISOString(),
    };
    this.data.activity.push(log);
    if (this.data.activity.length > 500) this.data.activity = this.data.activity.slice(-500);
    this.flush();
    return log;
  }
}

export const store = new Store();
