import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  description: text("description").notNull(),
  allowedIps: text("allowed_ips").default("").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({ id: true, createdAt: true, lastUsedAt: true });
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKeyRow = typeof apiKeysTable.$inferSelect;
