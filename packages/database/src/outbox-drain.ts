import { eq, and, lte, sql } from "drizzle-orm";
import { db } from "./index";
import { taskOutbox, type TaskOutboxRecord } from "./schema";

export interface EnqueueTaskInput {
  type: string;
  dedupeKey?: string | null;
  payload?: Record<string, unknown>;
  scheduledFor?: Date;
}

export interface TaskCompletion {
  kind: "terminal" | "retry";
  status: "done" | "skipped" | "failed";
  attempts: number;
  lastError?: string | null;
  scheduledFor?: Date;
}

/**
 * Inserts a task idempotently into task_outbox.
 * Skips duplicates if (type, dedupeKey) already exists without aborting transaction.
 */
export async function insertTask(input: EnqueueTaskInput): Promise<{ created: boolean; id?: string }> {
  const result = await db
    .insert(taskOutbox)
    .values({
      type: input.type,
      dedupeKey: input.dedupeKey ?? null,
      payload: input.payload ?? {},
      scheduledFor: input.scheduledFor ?? new Date(),
    })
    .onConflictDoNothing({ target: [taskOutbox.type, taskOutbox.dedupeKey] })
    .returning({ id: taskOutbox.id });

  if (result.length > 0) {
    return { created: true, id: result[0].id };
  }

  // Already exists
  return { created: false };
}

/**
 * Claims a pending task atomically with a unique processingToken.
 * Prevents concurrent workers from executing the same job.
 */
export async function claimTask(id: string, now = new Date()): Promise<string | null> {
  const processingToken = crypto.randomUUID();

  const result = await db
    .update(taskOutbox)
    .set({
      status: "processing",
      processingToken,
      updatedAt: now,
    })
    .where(
      and(
        eq(taskOutbox.id, id),
        eq(taskOutbox.status, "pending"),
        lte(taskOutbox.scheduledFor, now)
      )
    )
    .returning({ id: taskOutbox.id });

  return result.length === 1 ? processingToken : null;
}

/**
 * Completes a task atomically.
 * If terminal, redacts the payload to {} to comply with data protection and reduce storage.
 */
export async function completeTask(
  id: string,
  processingToken: string,
  completion: TaskCompletion,
  now = new Date()
): Promise<boolean> {
  const updateData =
    completion.kind === "terminal"
      ? {
          status: completion.status,
          attempts: completion.attempts,
          lastError: completion.lastError ?? null,
          payload: {}, // Redacted on completion
          processedAt: now,
          redactedAt: now,
          processingToken: null,
          updatedAt: now,
        }
      : {
          status: "pending",
          attempts: completion.attempts,
          lastError: completion.lastError ?? null,
          scheduledFor: completion.scheduledFor ?? now,
          processingToken: null,
          updatedAt: now,
        };

  const result = await db
    .update(taskOutbox)
    .set(updateData)
    .where(
      and(
        eq(taskOutbox.id, id),
        eq(taskOutbox.processingToken, processingToken),
        eq(taskOutbox.status, "processing")
      )
    )
    .returning({ id: taskOutbox.id });

  return result.length === 1;
}

/**
 * Recovers tasks stuck in 'processing' status past lease duration (e.g. 5 minutes).
 */
export async function recoverStaleLeases(leaseTimeoutMs = 300_000, now = new Date()): Promise<number> {
  const staleThreshold = new Date(now.getTime() - leaseTimeoutMs);

  const result = await db
    .update(taskOutbox)
    .set({
      status: "pending",
      processingToken: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(taskOutbox.status, "processing"),
        lte(taskOutbox.updatedAt, staleThreshold)
      )
    )
    .returning({ id: taskOutbox.id });

  return result.length;
}

/**
 * Fetches pending tasks ready for processing.
 */
export async function fetchPendingTasks(limit = 10, now = new Date()): Promise<TaskOutboxRecord[]> {
  return db
    .select()
    .from(taskOutbox)
    .where(
      and(
        eq(taskOutbox.status, "pending"),
        lte(taskOutbox.scheduledFor, now)
      )
    )
    .limit(limit);
}
