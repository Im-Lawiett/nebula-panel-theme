import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

const nodes = [
  { id: 1, name: "Node-SG01", location: "Singapore", memoryTotal: 32768, diskTotal: 524288, serverCount: 12, status: "online" },
  { id: 2, name: "Node-US01", location: "US East", memoryTotal: 65536, diskTotal: 1048576, serverCount: 24, status: "online" },
  { id: 3, name: "Node-EU01", location: "Frankfurt", memoryTotal: 32768, diskTotal: 524288, serverCount: 8, status: "online" },
  { id: 4, name: "Node-AU01", location: "Sydney", memoryTotal: 16384, diskTotal: 262144, serverCount: 3, status: "maintenance" },
  { id: 5, name: "Node-JP01", location: "Tokyo", memoryTotal: 32768, diskTotal: 524288, serverCount: 0, status: "offline" },
];

router.get("/nodes", requireAuth, (req, res) => {
  res.json(nodes);
});

export default router;
