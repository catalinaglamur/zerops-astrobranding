import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const DATABASE_VERSION = "1.0.0";
export * from "./schema";
export * from "./outbox-drain";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/astrobranding";

// Query client for pooled connections
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error("[Database] Connection check failed:", error);
    return false;
  }
}

export async function initPgVector(): Promise<void> {
  try {
    await queryClient`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log("[Database] pgvector extension initialized successfully");
  } catch (error) {
    console.error("[Database] Failed to initialize pgvector extension:", error);
  }
}
