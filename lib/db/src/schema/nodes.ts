import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  short: text("short").notNull(),
  long: text("long").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nodesTable = pgTable("nodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fqdn: text("fqdn").notNull(),
  locationId: integer("location_id").notNull(),
  totalMemory: integer("total_memory").notNull().default(0),
  usedMemory: integer("used_memory").notNull().default(0),
  totalDisk: integer("total_disk").notNull().default(0),
  usedDisk: integer("used_disk").notNull().default(0),
  serverCount: integer("server_count").notNull().default(0),
  status: text("status").notNull().default("online"),
  daemonVersion: text("daemon_version").notNull().default("1.11.13"),
  daemonBase: text("daemon_base").default("/var/lib/pterodactyl/volumes"),
  daemonSftp: integer("daemon_sftp").default(2022),
  daemonListen: integer("daemon_listen").default(8080),
  behindProxy: boolean("behind_proxy").default(false),
  maintenanceMode: boolean("maintenance_mode").default(false),
  memoryOverallocate: integer("memory_overallocate").default(0),
  diskOverallocate: integer("disk_overallocate").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locationsTable).omit({ id: true, createdAt: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type LocationRow = typeof locationsTable.$inferSelect;

export const insertNodeSchema = createInsertSchema(nodesTable).omit({ id: true, createdAt: true });
export type InsertNode = z.infer<typeof insertNodeSchema>;
export type NodeRow = typeof nodesTable.$inferSelect;
