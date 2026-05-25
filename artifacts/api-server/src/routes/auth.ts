import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { store } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "nebula-secret-key";

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) { res.status(400).json({ error: "Missing username or password" }); return; }
  const user = store.getUserByUsername(username);
  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  if (user.isBanned) { res.status(403).json({ error: "Account banned", banReason: user.banReason }); return; }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  store.logActivity("User login", user.username);
  res.json({ token, user: store.userToDto(user) });
});

router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = store.getUserById(payload.userId);
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    res.json(store.userToDto(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.put("/auth/profile", requireAuth, async (req: any, res) => {
  const { email, currentPassword, newPassword } = req.body ?? {};
  const user = store.getUserById(req.user.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const updates: Record<string, unknown> = {};
  if (email) updates.email = email;

  if (newPassword) {
    if (!currentPassword) { res.status(400).json({ error: "Current password required" }); return; }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: "Current password incorrect" }); return; }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = store.updateUser(user.id, updates as any);
  res.json(store.userToDto(updated!));
});

export default router;
