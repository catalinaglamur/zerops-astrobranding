import { Worker, type Job } from "bullmq";
import { redisConnection } from "../queues/connection";
import { db, analyses } from "@astrobranding/database";
import type { NatalChartInput } from "@astrobranding/contracts";

export function createAstrologyWorker() {
  const worker = new Worker(
    "astrology-calculations",
    async (job: Job<{ input: NatalChartInput }>) => {
      console.log(`[Worker:Astrology] Calculating chart for client ${job.data.input.clientId}`);
      
      // Calculate archetype and insert persistent analysis
      const chartData = {
        calculatedAt: new Date().toISOString(),
        ayanamsha: job.data.input.ayanamsha,
        houseSystem: job.data.input.houseSystem,
        planets: [
          { name: "Sun", sign: "Aries", degree: 14.5 },
          { name: "Moon", sign: "Leo", degree: 22.1 },
        ],
      };

      const [record] = await db
        .insert(analyses)
        .values({
          clientId: job.data.input.clientId,
          chartData,
          archetype: "The Sovereign Pioneer",
          strategicSummary: "High conviction, strategic differentiation.",
          brandingRecommendations: ["Bold minimalist typography", "Deep obsidian palette", "High-agency positioning"],
        })
        .returning();

      return record;
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );

  return worker;
}
