import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "hono/bun";
import { redisConnection } from "./connection";

let aiQueueInstance: Queue | null = null;
let waQueueInstance: Queue | null = null;
let astroQueueInstance: Queue | null = null;

const isValkeyEnabled = Boolean(process.env.VALKEY_URL || process.env.ENABLE_VALKEY === "true");

export function getAiQueue(): Queue | null {
  if (!isValkeyEnabled) return null;
  if (!aiQueueInstance) {
    aiQueueInstance = new Queue("ai-inference", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return aiQueueInstance;
}

export function getWhatsAppQueue(): Queue | null {
  if (!isValkeyEnabled) return null;
  if (!waQueueInstance) {
    waQueueInstance = new Queue("whatsapp-messaging", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 200,
        removeOnFail: 1000,
      },
    });
  }
  return waQueueInstance;
}

export function getAstrologyQueue(): Queue | null {
  if (!isValkeyEnabled) return null;
  if (!astroQueueInstance) {
    astroQueueInstance = new Queue("astrology-calculations", {
      connection: redisConnection,
      defaultJobOptions: { attempts: 2, removeOnComplete: 100 },
    });
  }
  return astroQueueInstance;
}

export const bullboardServerAdapter = new HonoAdapter(serveStatic);
bullboardServerAdapter.setBasePath("/admin/queues");

if (isValkeyEnabled) {
  try {
    const aiQ = getAiQueue();
    const waQ = getWhatsAppQueue();
    const astroQ = getAstrologyQueue();
    const adapters = [];
    if (aiQ) adapters.push(new BullMQAdapter(aiQ));
    if (waQ) adapters.push(new BullMQAdapter(waQ));
    if (astroQ) adapters.push(new BullMQAdapter(astroQ));

    if (adapters.length > 0) {
      createBullBoard({
        serverAdapter: bullboardServerAdapter,
        queues: adapters,
      });
    }
  } catch (e) {
    console.warn("[BullBoard] Initialization deferred:", e);
  }
}
