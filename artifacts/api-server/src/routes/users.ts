import { Router } from "express";
import bcrypt from "bcryptjs";
import { store } from "../lib/store";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

// List all users — admin or dev only
router.get("/users", requireAuth, requireRole("admin", "dev"), (_req, res) => {
  res.json(store.getUsers().map((u) => store.userToDto(u)));
});

// Create user — admin or dev only
router.post("/users", requireAuth, requireRole("admin", "dev"), async (req: any, res) => {
  const { username, email, password, role } = req.body ?? {};
  if (!username || !email || !password) { res.status(400).json({ error: "Missing fields" }); return; }
  if (store.getUserByUsername(username)) { res.status(409).json({ error: "Username already taken" }); return; }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = store.createUser({ username, email, passwordHash, role: role ?? "user", isBanned: false, banReason: null });
  store.logActivity("User created", req.user.username, `Created user ${username}`);
  res.status(201).json(store.userToDto(user));
});

// Get single user
router.get("/users/:id", requireAuth, (req: any, res) => {
  const id = parseInt(req.params.id);
  // Users can only view themselves; admin/dev can view all
  if (req.user.id !== 1 && req.user.role !== "admin" && req.user.id !== id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const user = store.getUserById(id);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(store.userToDto(user));
});

// Update user
router.patch("/users/:id", requireAuth, requireRole("admin", "dev"), async (req: any, res) => {
  const id = parseInt(req.params.id);
  const { username, email, role, password } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (role && id !== 1) updates.role = role; // Can't change ID 1 role
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  const user = store.updateUser(id, updates as any);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  store.logActivity("User updated", req.user.username, `Updated user ${user.username}`);
  res.json(store.userToDto(user));
});

// Delete user
router.delete("/users/:id", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) { res.status(403).json({ error: "Cannot delete the dev account" }); return; }
  const user = store.getUserById(id);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  store.deleteUser(id);
  store.logActivity("User deleted", req.user.username, `Deleted user ${user.username}`);
  res.status(204).send();
});

// Ban user
router.post("/users/:id/ban", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) { res.status(403).json({ error: "Cannot ban the dev account" }); return; }
  const { reason } = req.body ?? {};
  const user = store.updateUser(id, { isBanned: true, banReason: reason ?? "No reason provided" });
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  store.logActivity("User banned", req.user.username, `Banned ${user.username}: ${reason}`);
  res.json(store.userToDto(user));
});

// Unban user
router.post("/users/:id/unban", requireAuth, requireRole("admin", "dev"), (req: any, res) => {
  const id = parseInt(req.params.id);
  const user = store.updateUser(id, { isBanned: false, banReason: null });
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  store.logActivity("User unbanned", req.user.username, `Unbanned ${user.username}`);
  res.json(store.userToDto(user));
});

export default router;
