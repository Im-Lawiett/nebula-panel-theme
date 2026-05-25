import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/settings", (_req, res) => {
  res.json(store.getSettings());
});

router.put("/settings", requireAuth, (req: any, res) => {
  if (req.user.id !== 1) {
    res.status(403).json({ error: "Only the dev account can change panel settings" });
    return;
  }
  const { panelName, panelDescription, panelUrl, accentColor, allowRegistration, maintenanceMessage } = req.body ?? {};
  const updated = store.updateSettings({
    ...(panelName !== undefined && { panelName }),
    ...(panelDescription !== undefined && { panelDescription }),
    ...(panelUrl !== undefined && { panelUrl }),
    ...(accentColor !== undefined && { accentColor }),
    ...(allowRegistration !== undefined && { allowRegistration }),
    ...(maintenanceMessage !== undefined && { maintenanceMessage }),
  });
  store.logActivity("Panel settings updated", req.user.username, `Panel name: ${updated.panelName}`);
  res.json(updated);
});

export default router;
