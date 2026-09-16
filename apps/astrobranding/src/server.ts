import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  CreateClientSchema,
  NatalChartInputSchema,
  ChatCompletionRequestSchema,
  WhatsAppSendOtpSchema,
  UniversalBirthInputSchema,
  CreatePaymentSessionSchema,
  PaymentGatewayIdSchema,
} from "@astrobranding/contracts";
import {
  bifrost,
  freellmapi,
  evolution,
  executeUniversalExtraction,
  DIAGNOSTIC_PROMPTS,
  paymentRegistry,
  frappe,
} from "@astrobranding/engine";
import {
  db,
  clients,
  clientDumps,
  clientFeeds,
  orders,
  taskOutbox,
  checkDatabaseConnection,
  eq,
} from "@astrobranding/database";
import { bullboardServerAdapter, getAiQueue, getWhatsAppQueue, getAstrologyQueue } from "./queues";
import { initWorkers } from "./workers";

const app = new Hono();

// Global CORS & Request Logging
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") return c.body(null, 204);
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
    const q = getAstrologyQueue();
    if (q) await q.add("calculate", { input });
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

// API: Universal 15-Shard Extraction (Lakehouse Tier 1 Bronze Dumps & Tier 2 Gold Feeds)
app.post("/api/v1/extract", zValidator("json", UniversalBirthInputSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    const result = await executeUniversalExtraction(input);
    return c.json({
      success: true,
      dumpId: result.dumps.id,
      clientId: result.dumps.clientId,
      feedsGenerated: result.feedsCount,
    });
  } catch (err: unknown) {
    console.error("[API] Error in universal extraction:", err);
    return c.json({ success: false, error: err instanceof Error ? err.message : "Extraction error" }, 500);
  }
});

// API: Query Gold Feeds for a Client
app.get("/api/v1/feeds/:clientId", async (c) => {
  const clientId = c.req.param("clientId");
  try {
    const feeds = await db.select().from(clientFeeds).where(eq(clientFeeds.clientId, clientId));
    return c.json({ success: true, clientId, feeds });
  } catch (err: unknown) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "Database error" }, 500);
  }
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
    const q = getAiQueue();
    if (!q) {
      return c.json({ success: false, error: "AI queue is offline" }, 503);
    }
    const job = await q.add("chat", { request: req });
    return c.json({ success: true, jobId: job.id, status: "queued" });
  } catch (err: unknown) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "Queue error" }, 500);
  }
});

// API: WhatsApp OTP
app.post("/api/whatsapp/otp", zValidator("json", WhatsAppSendOtpSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    const q = getWhatsAppQueue();
    if (q) await q.add("send-otp", { otpRequest: input });
  } catch {
    // Graceful fallback
  }
  const result = await evolution.sendOtp(input);
  return c.json(result, result.success ? 200 : 500);
});

// API: Payment Gateways Discovery (Dynamic detection from environment)
app.get("/api/v1/payments/gateways", (c) => {
  const active = paymentRegistry.getActiveGateways();
  return c.json(active);
});

// API: Create Checkout Session with Selected Gateway (dLocal Go / Wompi / ePayco)
app.post("/api/v1/payments/create-session", zValidator("json", CreatePaymentSessionSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    // 1. Create Pending Order in PostgreSQL 18
    const [order] = await db.insert(orders).values({
      clientId: input.clientId,
      amount: input.amount.toString(),
      currency: input.currency,
      status: "pending",
    }).returning();

    // 2. Delegate session creation to selected Gateway Driver
    const session = await paymentRegistry.createSession(input, order.id);
    return c.json(session, 201);
  } catch (err: unknown) {
    console.error("[Payments] Error creating checkout session:", err);
    return c.json({ success: false, error: err instanceof Error ? err.message : "Payment error" }, 500);
  }
});

// API: Unified Webhook Ingestion (/api/webhooks/:gateway)
app.post("/api/webhooks/:gateway", async (c) => {
  const gatewayParam = c.req.param("gateway");
  const parsed = PaymentGatewayIdSchema.safeParse(gatewayParam);
  if (!parsed.success) {
    return c.json({ error: `Unsupported gateway: ${gatewayParam}` }, 400);
  }

  const gateway = parsed.data;
  const rawBody = await c.req.text();
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    // URL-encoded form fallback
    body = Object.fromEntries(new URLSearchParams(rawBody));
  }

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(c.req.header())) {
    if (v) headers[k.toLowerCase()] = v;
  }

  const event = paymentRegistry.verifyAndNormalizeWebhook(gateway, headers, body, rawBody);
  console.log(`[Webhook] Gateway ${gateway} received event ${event.event} for order ${event.orderId}`);

  if (event.event === "payment.approved") {
    try {
      // 1. Update Order in PostgreSQL 18
      await db.update(orders)
        .set({ status: "paid", paymentRef: event.transactionId })
        .where(eq(orders.id, event.orderId));

      // 2. Register Outbox Event for Guaranteed Async Processing
      await db.insert(taskOutbox).values({
        type: "payment.settled",
        dedupeKey: `pay-${gateway}-${event.transactionId}`,
        payload: { orderId: event.orderId, gateway, transactionId: event.transactionId, amount: event.amount },
        status: "pending",
      });

      // 3. Sync with Frappe CRM: Record Deal as Won
      await frappe.createOrUpdateDeal({
        lead: `CRM-LEAD-${event.orderId.substring(0, 8)}`,
        deal_value: event.amount,
        currency: event.currency,
        status: "Won",
        email: event.payerEmail,
      });

      // 4. Sync with ERPNext: Create Customer and Issue Sales Invoice
      if (event.payerEmail) {
        await frappe.createCustomer({
          customer_name: event.payerEmail.split("@")[0] || "Client",
          email_id: event.payerEmail,
        });

        await frappe.createSalesInvoice({
          customer: event.payerEmail.split("@")[0] || "Client",
          currency: event.currency,
          items: [{ item_name: "AstroBranding Report", rate: event.amount, amount: event.amount, qty: 1, item_code: "ASTRO-REPORT" }],
        });
      }
    } catch (postErr) {
      console.error("[Webhook] Error in post-payment processing:", postErr);
    }
  }

  return c.json({ received: true, gateway, event: event.event });
});

// API: Frappe CRM & ERPNext Live Connection Health Probe
app.get("/api/frappe/status", async (c) => {
  const status = await frappe.checkConnection();
  return c.json(status);
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
