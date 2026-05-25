import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// In-memory maintenance state
let maintenanceState = { enabled: false, message: "The panel is currently under maintenance." };

router.get("/maintenance", (_req, res) => {
  res.json(maintenanceState);
});

router.post("/maintenance", requireAuth, (req: any, res) => {
  // Only ID 1 (dev) can set maintenance mode
  if (req.user.id !== 1) { res.status(403).json({ error: "Only the dev account can change maintenance mode" }); return; }
  const { enabled, message } = req.body ?? {};
  maintenanceState = {
    enabled: !!enabled,
    message: message ?? maintenanceState.message,
  };
  store.logActivity(
    `Maintenance ${enabled ? "enabled" : "disabled"}`,
    req.user.username,
    enabled ? "Panel set to maintenance mode" : "Maintenance mode deactivated"
  );
  res.json(maintenanceState);
});

export default router;
