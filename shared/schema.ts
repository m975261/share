import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  objectPath: text("object_path").notNull(),
  uploadTime: timestamp("upload_time").notNull().defaultNow(),
  expirationTime: timestamp("expiration_time").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadTime: true,
  downloadCount: true,
}).extend({
  expirationTime: z.string().transform((str) => new Date(str)),
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileMetadata = typeof files.$inferSelect;

// Frontend deletion time options (values in minutes)
export const DELETION_TIME_OPTIONS = [
  { label: "10 minutes", value: 10 },
  { label: "1 hour", value: 60 },
  { label: "24 hours", value: 1440 }, // 24 * 60
  { label: "7 days", value: 10080 }, // 7 * 24 * 60
] as const;
