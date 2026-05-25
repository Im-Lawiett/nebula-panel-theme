import { Router } from "express";
import { db } from "@workspace/db";
import { panelSettingsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Public panel status — checked by all users on every page load
router.get("/panel/status", async (req, res) => {
  try {
    const settings = await db.select().from(panelSettingsTable);
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({
      maintenanceMode: map["maintenance_mode"] === "true",
      antiPeekEnabled: map["anti_peek_enabled"] === "true",
      registrationEnabled: map["registration_enabled"] !== "false",
      panelName: map["panel_name"] || "Nebula Panel",
      maintenanceMessage:
        map["maintenance_message"] ||
        "Panel sedang dalam maintenance. Silakan coba lagi nanti.",
      motdEnabled: map["motd_enabled"] === "true",
      motd: map["motd"] || "",
      developerName: "RianModss",
      developerTelegram: "@RianModss",
    });
  } catch {
    res.json({
      maintenanceMode: false,
      antiPeekEnabled: false,
      registrationEnabled: true,
      panelName: "Nebula Panel",
      maintenanceMessage: "Panel sedang maintenance.",
      motdEnabled: false,
      motd: "",
      developerName: "RianModss",
      developerTelegram: "@RianModss",
    });
  }
});

// Get user ban status by ID — called by client to check own ban
router.get("/panel/user/:id/status", async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(req.params.id)));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.id,
      username: user.username,
      isBanned: user.isBanned,
      banReason: user.banReason,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user status");
    res.status(500).json({ error: "Failed to get user status" });
  }
});

export default router;
