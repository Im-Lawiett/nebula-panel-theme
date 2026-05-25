import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const panelSettingsTable = pgTable("panel_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
});

export type SettingRow = typeof panelSettingsTable.$inferSelect;
