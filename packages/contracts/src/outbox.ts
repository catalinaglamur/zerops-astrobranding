import { z } from "zod";

/**
 * TaskOutboxSchema: SSoT schema for transactional outbox jobs
 * Adapted from di-sukharev/vibe for PostgreSQL 18 + native UUIDv7
 */
export const TaskOutboxStatusSchema = z.enum([
  "pending",
  "processing",
  "done",
  "skipped",
  "failed",
]);

export const TaskOutboxSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  dedupeKey: z.string().nullable().optional(),
  payload: z.record(z.unknown()).default({}),
  status: TaskOutboxStatusSchema.default("pending"),
  attempts: z.number().int().nonnegative().default(0),
  scheduledFor: z.date(),
  processingToken: z.string().nullable().optional(),
  processedAt: z.date().nullable().optional(),
  redactedAt: z.date().nullable().optional(),
  lastError: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskOutboxStatus = z.infer<typeof TaskOutboxStatusSchema>;
export type TaskOutbox = z.infer<typeof TaskOutboxSchema>;
