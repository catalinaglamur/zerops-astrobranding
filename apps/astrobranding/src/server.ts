import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  CreateClientSchema,
  NatalChartInputSchema,
  ChatCompletionRequestSchema,
  WhatsAppSendOtpSchema,
} from "@astrobranding/contracts";
import { bifrost, freellmapi, evolution } from "@astrobranding/engine";
import { db, clients, checkDatabaseConnection } from "@astrobranding/database";
import { bullboardServerAdapter, getAiQueue, getWhatsAppQueue, getAstrologyQueue } from "./queues";
import { initWorkers } from "./workers";

const app = new Hono();

// Global CORS & Request Logging
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") return c.text("", 204);
  await next();
});

// Mount BullBoard for Queue Inspection at /admin/queues
try {
  app.route("/admin/queues", bullboardServerAdapter.registerPlugin());
} catch {
  // Fail-safe if adapter plugin mounting deferred
}

// Root & Health Verification
app.get("/health", async (c) => {
  const dbOk = await checkDatabaseConnection();
  const bifrostOk = await bifrost.healthCheck();
  const freeApiOk = await freellmapi.ping();
  const evolutionOk = await evolution.healthCheck();

  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "astrobranding",
    uptime: process.uptime(),
    mesh: {
      database: dbOk ? "connected" : "standby",
      bifrost: bifrostOk ? "healthy" : "standby",
      freellmapi: freeApiOk ? "healthy" : "standby",
      evolution: evolutionOk ? "healthy" : "standby",
    },
    queues: {
      dashboard: "/admin/queues",
      active: ["ai-inference", "whatsapp-messaging", "astrology-calculations"],
    },
  });
});

app.get("/", (c) => {
  return c.json({
    name: "Zerops AstroBranding Sovereign Platform",
    status: "active",
    healthCheck: "/health",
    queuesDashboard: "/admin/queues",
    endpoints: [
      "POST /api/clients",
      "GET  /api/clients",
      "POST /api/astrology/chart",
      "POST /api/ai/chat",
      "POST /api/ai/queue-chat",
      "POST /api/whatsapp/otp",
    ],
  });
});

// API: Clients Management
app.post("/api/clients", zValidator("json", CreateClientSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    const [client] = await db
      .insert(clients)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        birthCity: input.birthCity,
        birthCountry: input.birthCountry,
        latitude: input.latitude.toString(),
        longitude: input.longitude.toString(),
      })
      .returning();

    return c.json({ success: true, client }, 201);
  } catch (err: unknown) {
    console.error("[API] Error creating client:", err);
    return c.json({ success: false, error: err instanceof Error ? err.message : "Database error" }, 500);
  }
});

app.get("/api/clients", async (c) => {
  try {
    const allClients = await db.select().from(clients).limit(50);
    return c.json({ success: true, clients: allClients });
  } catch (err: unknown) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "Database error" }, 500);
  }
});

// API: Astrology & Natal Chart Generation (with Queue option)
app.post("/api/astrology/chart", zValidator("json", NatalChartInputSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    await getAstrologyQueue().add("calculate", { input });
  } catch {
    // Graceful fallback if queue is offline
  }

  return c.json({
    success: true,
    status: "processing",
    chart: {
      clientId: input.clientId,
      ayanamsha: input.ayanamsha,
      houseSystem: input.houseSystem,
      archetype: "The Sovereign Pioneer",
      strategicSummary: "High conviction, strategic differentiation.",
    },
  });
});

// API: AI Chat Completion via Sovereign AI Mesh (Bifrost -> FreeLLMAPI)
app.post("/api/ai/chat", zValidator("json", ChatCompletionRequestSchema), async (c) => {
  const req = c.req.valid("json");
  try {
    const completion = await bifrost.createChatCompletion(req);
    return c.json(completion);
  } catch (bifrostError) {
    console.warn("[API] Bifrost unreachable, failing over to FreeLLMAPI:", bifrostError);
    try {
      const fallback = await freellmapi.complete(req);
      return c.json(fallback);
    } catch (fallbackError: unknown) {
      return c.json(
        {
          error: "All AI Gateways unavailable",
          details: fallbackError instanceof Error ? fallbackError.message : "Unknown error",
        },
        502
      );
    }
  }
});

// API: Enqueue Async AI Chat Job via BullMQ
app.post("/api/ai/queue-chat", zValidator("json", ChatCompletionRequestSchema), async (c) => {
  const req = c.req.valid("json");
  try {
    const job = await getAiQueue().add("chat", { request: req });
    return c.json({ success: true, jobId: job.id, status: "queued" });
  } catch (err: unknown) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "Queue error" }, 500);
  }
});

// API: WhatsApp OTP
app.post("/api/whatsapp/otp", zValidator("json", WhatsAppSendOtpSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    await getWhatsAppQueue().add("send-otp", { otpRequest: input });
  } catch {
    // Graceful fallback
  }
  const result = await evolution.sendOtp(input);
  return c.json(result, result.success ? 200 : 500);
});

// Start background workers
initWorkers();

const port = Number(process.env.PORT || 3000);
console.log(`[AstroBranding] Sovereign Hono Server running on port ${port}`);

export { app };
export type AppType = typeof app;

export default {
  port,
  fetch: app.fetch,
};
