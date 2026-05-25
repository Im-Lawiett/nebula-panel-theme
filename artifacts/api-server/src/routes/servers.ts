import { Router } from "express";

const router = Router();

// Mock server data
const mockServers = [
  {
    id: "abc123",
    name: "Roseeunli",
    description: "Main game server",
    status: "running",
    node: "node-nyk1",
    egg: "Paper MC 1.20",
    cpuUsage: 45.2,
    memoryUsage: 2048,
    memoryLimit: 4096,
    diskUsage: 8192,
    diskLimit: 20480,
    ip: "0.0.0.0",
    port: 25565,
    uuid: "18bdad52-96e6-47c5-ba4f-a1b2c3d4e5f6",
  },
  {
    id: "def456",
    name: "freeunli",
    description: null,
    status: "running",
    node: "node-nyk1",
    egg: "Vanilla MC 1.20",
    cpuUsage: 12.8,
    memoryUsage: 512,
    memoryLimit: 1024,
    diskUsage: 1024,
    diskLimit: 5120,
    ip: "0.0.0.0",
    port: 25566,
    uuid: "2ab3c4d5-e6f7-8901-bcde-f01234567890",
  },
  {
    id: "ghi789",
    name: "semogabisayaallahunli",
    description: "Survival world",
    status: "stopped",
    node: "node-sg1",
    egg: "Fabric 1.20",
    cpuUsage: 0,
    memoryUsage: 0,
    memoryLimit: 2048,
    diskUsage: 4096,
    diskLimit: 10240,
    ip: "0.0.0.0",
    port: 25567,
    uuid: "3bc4d5e6-f789-0123-cdef-012345678901",
  },
  {
    id: "jkl012",
    name: "lynzraunli",
    description: null,
    status: "running",
    node: "node-nyk1",
    egg: "NodeJS Bot",
    cpuUsage: 8.1,
    memoryUsage: 256,
    memoryLimit: 512,
    diskUsage: 512,
    diskLimit: 2048,
    ip: "0.0.0.0",
    port: 3000,
    uuid: "4cd5e6f7-8901-2345-def0-123456789012",
  },
  {
    id: "mno345",
    name: "ubotisbackunli",
    description: "Discord bot server",
    status: "starting",
    node: "node-sg1",
    egg: "NodeJS Bot",
    cpuUsage: 0,
    memoryUsage: 128,
    memoryLimit: 512,
    diskUsage: 256,
    diskLimit: 1024,
    ip: "0.0.0.0",
    port: 3001,
    uuid: "5de6f789-0123-4567-e012-345678901234",
  },
  {
    id: "pqr678",
    name: "kalzzunli",
    description: null,
    status: "offline",
    node: "node-nyk1",
    egg: "Python App",
    cpuUsage: 0,
    memoryUsage: 0,
    memoryLimit: 1024,
    diskUsage: 2048,
    diskLimit: 5120,
    ip: "0.0.0.0",
    port: 8080,
    uuid: "6ef78901-2345-6789-f123-456789012345",
  },
  {
    id: "stu901",
    name: "panounli",
    description: "Pano's server",
    status: "running",
    node: "node-nyk2",
    egg: "Paper MC 1.19",
    cpuUsage: 67.5,
    memoryUsage: 3072,
    memoryLimit: 4096,
    diskUsage: 15360,
    diskLimit: 20480,
    ip: "0.0.0.0",
    port: 25568,
    uuid: "7f089012-3456-789a-0234-567890123456",
  },
  {
    id: "vwx234",
    name: "madeunli",
    description: null,
    status: "stopped",
    node: "node-sg1",
    egg: "Vanilla MC 1.18",
    cpuUsage: 0,
    memoryUsage: 0,
    memoryLimit: 2048,
    diskUsage: 8192,
    diskLimit: 15360,
    ip: "0.0.0.0",
    port: 25569,
    uuid: "8a190123-4567-89ab-1234-678901234567",
  },
];

router.get("/servers", (req, res) => {
  res.json(mockServers);
});

router.get("/servers/:id", (req, res) => {
  const server = mockServers.find((s) => s.id === req.params.id);
  if (!server) {
    return res.status(404).json({ error: "Server not found" });
  }
  res.json(server);
});

export default router;
