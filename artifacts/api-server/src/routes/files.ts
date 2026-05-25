import { Router } from "express";

const router = Router();

// Mock file system per server
const mockFiles: Record<string, Array<{
  name: string;
  size: number;
  isDirectory: boolean;
  modified: string;
  permissions: string;
  mimetype: string | null;
}>> = {
  default: [
    { name: ".cache", size: 0, isDirectory: true, modified: "2026-05-24T10:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: ".npm", size: 0, isDirectory: true, modified: "2026-05-23T08:30:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: "database", size: 0, isDirectory: true, modified: "2026-05-22T16:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: "logs", size: 0, isDirectory: true, modified: "2026-05-25T09:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: "node_modules", size: 0, isDirectory: true, modified: "2026-05-20T12:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: "tmp-backup", size: 0, isDirectory: true, modified: "2026-05-18T14:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
    { name: "BOTC INSTALL.zip", size: 4718592, isDirectory: false, modified: "2026-05-21T11:00:00Z", permissions: "rw-r--r--", mimetype: "application/zip" },
    { name: "config.js", size: 2048, isDirectory: false, modified: "2026-05-24T15:30:00Z", permissions: "rw-r--r--", mimetype: "application/javascript" },
    { name: "main.js", size: 8192, isDirectory: false, modified: "2026-05-25T08:00:00Z", permissions: "rw-r--r--", mimetype: "application/javascript" },
    { name: "package-lock.json", size: 102400, isDirectory: false, modified: "2026-05-20T12:00:00Z", permissions: "rw-r--r--", mimetype: "application/json" },
    { name: "package.json", size: 1024, isDirectory: false, modified: "2026-05-20T12:00:00Z", permissions: "rw-r--r--", mimetype: "application/json" },
  ],
};

router.get("/servers/:id/files", (req, res) => {
  const files = mockFiles[req.params.id] || mockFiles.default;
  res.json(files);
});

router.get("/servers/:id/files/dir/:dir", (req, res) => {
  // Return mock sub-directory contents
  const dirFiles = [
    { name: "file1.txt", size: 512, isDirectory: false, modified: "2026-05-24T10:00:00Z", permissions: "rw-r--r--", mimetype: "text/plain" },
    { name: "file2.log", size: 2048, isDirectory: false, modified: "2026-05-25T09:00:00Z", permissions: "rw-r--r--", mimetype: "text/plain" },
    { name: "subdir", size: 0, isDirectory: true, modified: "2026-05-22T16:00:00Z", permissions: "rwxr-xr-x", mimetype: null },
  ];
  res.json(dirFiles);
});

router.post("/servers/:id/files/rename", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }
  res.json({ success: true, message: `Renamed ${from} to ${to}` });
});

router.post("/servers/:id/files/delete", (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "files array is required" });
  }
  res.json({ success: true, message: `Deleted ${files.length} file(s)` });
});

router.post("/servers/:id/files/compress", (req, res) => {
  const { files, name } = req.body;
  if (!files || !name) {
    return res.status(400).json({ error: "files and name are required" });
  }
  res.json({ success: true, message: `Compressed ${files.length} file(s) into ${name}` });
});

router.post("/servers/:id/files/decompress", (req, res) => {
  const { file } = req.body;
  if (!file) {
    return res.status(400).json({ error: "file is required" });
  }
  res.json({ success: true, message: `Decompressed ${file}` });
});

router.post("/servers/:id/files/chmod", (req, res) => {
  const { file, mode } = req.body;
  if (!file || !mode) {
    return res.status(400).json({ error: "file and mode are required" });
  }
  res.json({ success: true, message: `Changed permissions of ${file} to ${mode}` });
});

export default router;
