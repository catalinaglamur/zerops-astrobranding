import { pgTable, uuid, text, timestamp, jsonb, vector, index, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const clients = pgTable("clients", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  birthDate: text("birth_date").notNull(),
  birthTime: text("birth_time").notNull(),
  birthCity: text("birth_city").notNull(),
  birthCountry: text("birth_country").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const analyses = pgTable(
  "analyses",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    chartData: jsonb("chart_data").notNull(),
    archetype: text("archetype"),
    strategicSummary: text("strategic_summary"),
    brandingRecommendations: jsonb("branding_recommendations"),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("analyses_embedding_hnsw_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
    index("analyses_client_id_idx").on(table.clientId),
  ]
);

export const orders = pgTable("orders", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  clientId: uuid("client_id")
    .references(() => clients.id)
    .notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("pending").notNull(),
  paymentRef: text("payment_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TaskOutbox: Transactional Outbox Pattern in PostgreSQL 18
 * Adapted from di-sukharev/vibe with native UUIDv7 and skipDuplicates
 */
export const taskOutbox = pgTable(
  "task_outbox",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    type: text("type").notNull(),
    dedupeKey: text("dedupe_key"),
    payload: jsonb("payload").default({}).notNull(),
    status: text("status").default("pending").notNull(), // pending | processing | done | skipped | failed
    attempts: integer("attempts").default(0).notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).defaultNow().notNull(),
    processingToken: text("processing_token"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    redactedAt: timestamp("redacted_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("task_outbox_type_dedupe_key_idx").on(table.type, table.dedupeKey),
    index("task_outbox_status_scheduled_for_idx").on(table.status, table.scheduledFor),
  ]
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type TaskOutboxRecord = typeof taskOutbox.$inferSelect;
export type NewTaskOutboxRecord = typeof taskOutbox.$inferInsert;
