import { Router } from "express";
import { db, maintenanceTable, activityTable } from "@workspace/db";
import { SetMaintenanceBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/maintenance", async (_req, res) => {
  const [record] = await db.select().from(maintenanceTable);
  if (!record) {
    res.json({ enabled: false, message: "Panel is under maintenance." });
    return;
  }
  res.json({ enabled: record.enabled, message: record.message });
});

router.post("/maintenance", requireAuth, async (req, res) => {
  const parsed = SetMaintenanceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const existing = await db.select().from(maintenanceTable);
  let record;

  if (existing.length === 0) {
    const [r] = await db.insert(maintenanceTable).values({
      enabled: parsed.data.enabled,
      message: parsed.data.message ?? "The panel is currently under maintenance.",
    }).returning();
    record = r;
  } else {
    const [r] = await db.update(maintenanceTable).set({
      enabled: parsed.data.enabled,
      message: parsed.data.message ?? existing[0].message,
      updatedAt: new Date(),
    }).returning();
    record = r;
  }

  await db.insert(activityTable).values({
    action: `Maintenance ${parsed.data.enabled ? "enabled" : "disabled"}`,
    user: (req as any).user?.username ?? "system",
    details: parsed.data.enabled ? "Panel set to maintenance mode" : "Maintenance mode deactivated",
  });

  res.json({ enabled: record.enabled, message: record.message });
});

export default router;
