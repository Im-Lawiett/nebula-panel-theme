import { pgTable, serial, boolean, text, timestamp } from "drizzle-orm/pg-core";

export const maintenanceTable = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  message: text("message").notNull().default("The panel is currently under maintenance. Please check back later."),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Maintenance = typeof maintenanceTable.$inferSelect;
