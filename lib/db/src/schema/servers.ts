import { pgTable, serial, text, integer, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serverStatusEnum = pgEnum("server_status", ["running", "stopped", "installing", "suspended"]);

export const serversTable = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: serverStatusEnum("status").notNull().default("stopped"),
  owner: text("owner").notNull(),
  node: text("node").notNull(),
  ram: integer("ram").notNull().default(1024),
  cpu: integer("cpu").notNull().default(100),
  disk: integer("disk").notNull().default(10240),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServerSchema = createInsertSchema(serversTable).omit({ id: true, createdAt: true });
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof serversTable.$inferSelect;
