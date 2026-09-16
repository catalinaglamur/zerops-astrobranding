import { Worker, type Job } from "bullmq";
import { redisConnection } from "../queues/connection";
import { evolution } from "@astrobranding/engine";
import type { WhatsAppSendOtpInput } from "@astrobranding/contracts";

export function createWhatsAppWorker() {
  const worker = new Worker(
    "whatsapp-messaging",
    async (job: Job<{ otpRequest: WhatsAppSendOtpInput }>) => {
      console.log(`[Worker:WhatsApp] Dispatching message for job ${job.id}`);
      const result = await evolution.sendOtp(job.data.otpRequest);
      if (!result.success) {
        throw new Error(result.error || "Failed to dispatch WhatsApp message");
      }
      return result;
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker:WhatsApp] Message sent for job ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker:WhatsApp] Job ${job?.id} failed:`, err);
  });

  return worker;
}
