import { Router } from "express";
import { db, serversTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/servers", requireAuth, async (_req, res) => {
  const servers = await db.select().from(serversTable);
  res.json(
    servers.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      owner: s.owner,
      node: s.node,
      ram: s.ram,
      cpu: s.cpu,
      disk: s.disk,
    }))
  );
});

export default router;
