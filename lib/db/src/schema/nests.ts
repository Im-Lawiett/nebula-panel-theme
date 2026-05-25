import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nestsTable = pgTable("nests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  eggCount: integer("egg_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eggsTable = pgTable("eggs", {
  id: serial("id").primaryKey(),
  nestId: integer("nest_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dockerImage: text("docker_image").notNull(),
  serverCount: integer("server_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNestSchema = createInsertSchema(nestsTable).omit({ id: true, createdAt: true });
export type InsertNest = z.infer<typeof insertNestSchema>;
export type NestRow = typeof nestsTable.$inferSelect;

export const insertEggSchema = createInsertSchema(eggsTable).omit({ id: true, createdAt: true });
export type InsertEgg = z.infer<typeof insertEggSchema>;
export type EggRow = typeof eggsTable.$inferSelect;
