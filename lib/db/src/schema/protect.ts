import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const protectFeaturesTable = pgTable("protect_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(false),
});

export const insertProtectFeatureSchema = createInsertSchema(protectFeaturesTable).omit({ id: true });
export type InsertProtectFeature = z.infer<typeof insertProtectFeatureSchema>;
export type ProtectFeature = typeof protectFeaturesTable.$inferSelect;
