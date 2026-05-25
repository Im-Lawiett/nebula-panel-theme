import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { store } from "../lib/store";

const JWT_SECRET = process.env.SESSION_SECRET ?? "nebula-secret-key";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = store.getUserById(payload.userId);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/** Allow only: ID 1 (dev), or users whose role is in the list */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) { res.status(403).json({ error: "Forbidden" }); return; }
    // ID 1 is always dev — always has access
    if (user.id === 1) { next(); return; }
    const effectiveRole = user.role as string;
    if (!roles.includes(effectiveRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
