import { db, clientDumps, clientFeeds, eq, type ClientDumps } from "@astrobranding/database";
import type { UniversalBirthInput } from "@astrobranding/contracts";
import {
  fetchWesternTropical,
  fetchWesternSidereal,
  fetchVedicJyotish,
  fetchVedicDashas,
  fetchBaZiMetaphysics,
  fetchZiWeiFengShui,
  fetchKabbalahGematria,
  fetchHebrewZmanim,
  fetchHumanDesign,
  fetchCosmobiologyMidpoints,
  fetchNasaEphemerides,
  fetchAstrocartographyAcg,
  fetchBusinessPentaOrg,
  fetchPartnerSynastry,
  fetchPredictiveElectional,
  type ClientRequestOptions,
} from "./clients";
import { generateAllGoldFeeds } from "./feeds";

export interface ExtractionOptions extends ClientRequestOptions {
  forceRefresh?: boolean;
}

/**
 * Universal 15-Shard Extraction Orchestrator
 * Fulfills omni_shards_master_manifest.md SSoT specifications
 * 
 * Safe by default: dryRun: true prevents any API credit consumption during dev/test.
 * Idempotent by default: Checks PostgreSQL 18 before making ANY external API or MCP call.
 */
export async function executeUniversalExtraction(
  input: UniversalBirthInput,
  options: ExtractionOptions = { dryRun: true }
): Promise<{
  dumps: ClientDumps;
  feedsCount: number;
  cached?: boolean;
}> {
  // 1. Idempotency & Cache Guard: If client was already extracted, return existing dump immediately
  if (!options.forceRefresh) {
    const existingDumps = await db
      .select()
      .from(clientDumps)
      .where(eq(clientDumps.clientId, input.clientId))
      .limit(1);

    if (existingDumps.length > 0) {
      console.log(`[Cache Hit] Client ${input.clientId} already has completed extraction dump. Zero API credits consumed.`);
      const existingFeeds = await db
        .select()
        .from(clientFeeds)
        .where(eq(clientFeeds.clientId, input.clientId));

      return {
        dumps: existingDumps[0],
        feedsCount: existingFeeds.length,
        cached: true,
      };
    }
  }

  // Parallel structured ingestion across all 15 shards with zero-cost dryRun safety
  const [
    shardWesternTropical,
    shardWesternSidereal,
    shardVedicJyotish,
    shardVedicDashas,
    shardBaziMetaphysics,
    shardZiweiFengshui,
    shardKabbalahGematria,
    shardHebrewZmanim,
    shardHumanDesign,
    shardCosmobiologyMidpoints,
    shardNasaEphemerides,
    shardAstrocartographyAcg,
    shardBusinessPentaOrg,
    shardPartnerSynastry,
    shardPredictiveElectional,
  ] = await Promise.all([
    fetchWesternTropical(input, options),
    fetchWesternSidereal(input, options),
    fetchVedicJyotish(input, options),
    fetchVedicDashas(input, options),
    fetchBaZiMetaphysics(input, options),
    fetchZiWeiFengShui(input, options),
    fetchKabbalahGematria(input, options),
    fetchHebrewZmanim(input, options),
    fetchHumanDesign(input, options),
    fetchCosmobiologyMidpoints(input, options),
    fetchNasaEphemerides(input, options),
    fetchAstrocartographyAcg(input, options),
    fetchBusinessPentaOrg(input, options),
    fetchPartnerSynastry(input, options),
    fetchPredictiveElectional(input, options),
  ]);

  // Persist atomically to PostgreSQL 18 (client_dumps)
  const [insertedDump] = await db
    .insert(clientDumps)
    .values({
      clientId: input.clientId,
      birthMetadata: input,
      shardWesternTropical,
      shardWesternSidereal,
      shardVedicJyotish,
      shardVedicDashas,
      shardBaziMetaphysics,
      shardZiweiFengshui,
      shardKabbalahGematria,
      shardHebrewZmanim,
      shardHumanDesign,
      shardCosmobiologyMidpoints,
      shardNasaEphemerides,
      shardAstrocartographyAcg,
      shardBusinessPentaOrg,
      shardPartnerSynastry,
      shardPredictiveElectional,
    })
    .returning();

  // Generate and persist the 17 Gold Feeds (Fase 0 + Fases 1-9 + Coach + Semiotics + Diag A-E)
  const generatedFeeds = generateAllGoldFeeds(insertedDump);
  for (const feed of generatedFeeds) {
    await db.insert(clientFeeds).values({
      clientId: input.clientId,
      feedType: feed.feedType,
      xmlPayload: feed.xmlPayload,
      tokenEstimate: feed.tokenEstimate,
    });
  }

  return {
    dumps: insertedDump,
    feedsCount: generatedFeeds.length,
  };
}
