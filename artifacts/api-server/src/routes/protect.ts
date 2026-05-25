import { Router } from "express";
import { store } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// In-memory protect features (dev-only toggles)
const features = [
  { id: 1,  name: "Anti-DDoS Layer",         key: "anti_ddos",          enabled: true,  description: "Block suspicious traffic spikes" },
  { id: 2,  name: "IP Whitelist Mode",        key: "ip_whitelist",       enabled: false, description: "Allow only whitelisted IPs" },
  { id: 3,  name: "Force 2FA",               key: "force_2fa",          enabled: false, description: "Require 2FA for all users" },
  { id: 4,  name: "Rate Limiting",            key: "rate_limit",         enabled: true,  description: "Limit API requests per IP" },
  { id: 5,  name: "Captcha on Login",         key: "captcha_login",      enabled: false, description: "Show CAPTCHA on login page" },
  { id: 6,  name: "Geo Block",               key: "geo_block",          enabled: false, description: "Block specific countries" },
  { id: 7,  name: "SQL Injection Guard",      key: "sql_guard",          enabled: true,  description: "Block SQL injection attempts" },
  { id: 8,  name: "XSS Protection",          key: "xss_protection",     enabled: true,  description: "Sanitize all input fields" },
  { id: 9,  name: "Brute Force Guard",        key: "brute_force",        enabled: true,  description: "Lock account after failed logins" },
  { id: 10, name: "Audit Logging",            key: "audit_log",          enabled: true,  description: "Log all admin actions" },
  { id: 11, name: "Session Timeout",          key: "session_timeout",    enabled: false, description: "Auto-logout after inactivity" },
  { id: 12, name: "File Upload Scan",         key: "file_upload_scan",   enabled: true,  description: "Scan uploaded files for malware" },
  { id: 13, name: "Email Verification",       key: "email_verify",       enabled: false, description: "Require email verification on signup" },
  { id: 14, name: "Minecraft EULA Guard",     key: "mc_eula_guard",      enabled: true,  description: "Block servers without EULA accepted" },
];

router.get("/protect/status", requireAuth, (_req, res) => {
  res.json(features);
});

router.post("/protect/toggle", requireAuth, (req: any, res) => {
  // Only ID 1 (dev) can toggle features
  if (req.user.id !== 1) { res.status(403).json({ error: "Only the dev account can toggle protect features" }); return; }
  const { id, enabled } = req.body ?? {};
  const feature = features.find((f) => f.id === id);
  if (!feature) { res.status(404).json({ error: "Feature not found" }); return; }
  feature.enabled = !!enabled;
  store.logActivity(
    `Protect ${enabled ? "enabled" : "disabled"}`,
    req.user.username,
    `${feature.name} ${enabled ? "enabled" : "disabled"}`
  );
  res.json(feature);
});

export default router;
