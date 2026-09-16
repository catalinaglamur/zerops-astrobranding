import { Worker, type Job } from "bullmq";
import { redisConnection } from "../queues/connection";
import { bifrost, freellmapi } from "@astrobranding/engine";
import type { ChatCompletionRequest } from "@astrobranding/contracts";

export function createAiWorker() {
  const worker = new Worker(
    "ai-inference",
    async (job: Job<{ request: ChatCompletionRequest }>) => {
      console.log(`[Worker:AI] Processing job ${job.id}`);
      try {
        const response = await bifrost.createChatCompletion(job.data.request);
        return response;
      } catch (err) {
        console.warn(`[Worker:AI] Bifrost failed for job ${job.id}, falling back to FreeLLMAPI:`, err);
        return await freellmapi.complete(job.data.request);
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker:AI] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker:AI] Job ${job?.id} failed:`, err);
  });

  return worker;
}
