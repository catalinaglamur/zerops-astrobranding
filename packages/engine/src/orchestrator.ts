import { db, clientDumps, clientFeeds, type ClientDumps } from "@astrobranding/database";
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

export interface ExtractionOptions extends ClientRequestOptions {}

/**
 * Universal 15-Shard Extraction Orchestrator
 * Fulfills omni_shards_master_manifest.md SSoT specifications
 * 
 * Safe by default: dryRun: true prevents any API credit consumption during dev/test.
 */
export async function executeUniversalExtraction(
  input: UniversalBirthInput,
  options: ExtractionOptions = { dryRun: true }
): Promise<{
  dumps: ClientDumps;
  feedsCount: number;
}> {
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
