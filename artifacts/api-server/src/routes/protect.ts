import { Router } from "express";
import { db, protectFeaturesTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ToggleProtectBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/protect/status", requireAuth, async (_req, res) => {
  const features = await db.select().from(protectFeaturesTable);
  res.json(features);
});

router.post("/protect/toggle", requireAuth, async (req, res) => {
  const parsed = ToggleProtectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [feature] = await db
    .update(protectFeaturesTable)
    .set({ enabled: parsed.data.enabled })
    .where(eq(protectFeaturesTable.id, parsed.data.id))
    .returning();

  if (!feature) { res.status(404).json({ error: "Not found" }); return; }

  await db.insert(activityTable).values({
    action: `Protect ${parsed.data.enabled ? "enabled" : "disabled"}`,
    user: (req as any).user?.username ?? "system",
    details: `${feature.name} ${parsed.data.enabled ? "enabled" : "disabled"}`,
  });

  res.json(feature);
});

export default router;
