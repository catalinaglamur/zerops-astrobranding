import { createAiWorker } from "./aiWorker";
import { createWhatsAppWorker } from "./whatsappWorker";
import { createAstrologyWorker } from "./astrologyWorker";

export function initWorkers() {
  // Only initialize background workers when Valkey is configured
  if (process.env.VALKEY_URL || process.env.ENABLE_WORKERS === "true") {
    try {
      console.log("[Workers] Initializing BullMQ background workers...");
      const aiWorker = createAiWorker();
      const waWorker = createWhatsAppWorker();
      const astroWorker = createAstrologyWorker();
      return { aiWorker, waWorker, astroWorker };
    } catch (err) {
      console.warn("[Workers] Valkey not available, running in sync fallback mode:", err);
      return null;
    }
  }
  return null;
}
