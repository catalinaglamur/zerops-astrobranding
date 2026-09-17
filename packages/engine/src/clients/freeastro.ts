import type {
  UniversalBirthInput,
  AstrocartographyAcgShard,
  PartnerSynastryShard,
  PredictiveElectionalShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";
import { callKundaliMcp } from "../mcp";

const FREEASTRO_URL = process.env.FREEASTRO_URL || "https://api.freeastroapi.com";


/**
 * 12. Shard Astrocartography ACG (FreeAstroAPI / AstroWay)
 */
export async function fetchAstrocartographyAcg(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<AstrocartographyAcgShard> {
  const apiKey = process.env.FREEASTRO_API_KEY;

  if (options.dryRun || !apiKey) {
    return {
      source: "freeastroapi_astroway",
      majorLines: [
        { planet: "Jupiter", lineType: "MC", geoJsonCoordinates: [[-74.0, 40.7], [-73.5, 42.0]] },
        { planet: "Sun", lineType: "ASC", geoJsonCoordinates: [[-0.1, 51.5], [2.3, 48.8]] },
        { planet: "Venus", lineType: "DSC", geoJsonCoordinates: [[139.6, 35.6], [140.0, 37.0]] },
        { planet: "Mercury", lineType: "MC", geoJsonCoordinates: [[-43.1, -22.9], [-46.6, -23.5]] },
      ],
      localSpaceAzimuths: {
        Jupiter: 135.0,
        Sun: 90.0,
        Venus: 215.4,
        Mars: 310.2,
      },
    };
  }

  const res = await fetch(`${FREEASTRO_URL}/api/v1/relocation/lines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      date: input.date,
      time: input.time,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`FreeAstroAPI ACG returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "freeastroapi_astroway",
    majorLines: data.major_lines ?? [
      { planet: "Jupiter", lineType: "MC" },
      { planet: "Sun", lineType: "ASC" },
    ],
    localSpaceAzimuths: data.local_space_azimuths ?? {},
  };
}

/**
 * 14. Shard Partner Synastry & Compatibility (FreeAstroAPI / Kundali MCP)
 */
export async function fetchPartnerSynastry(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<PartnerSynastryShard> {
  const apiKey = process.env.FREEASTRO_API_KEY;

  if (options.dryRun || !apiKey) {
    return {
      source: "kundali_freeastro_astroway",
      ashtakootaGunas: {
        totalScore: 28,
        verdict: "Highly Auspicious (Above 18/36)",
        breakdown: {
          Varna: 1,
          Vashya: 2,
          Tara: 3,
          Yoni: 4,
          GrahaMaitri: 5,
          Gana: 5,
          Bhakoot: 7,
          Nadi: 1,
        },
      },
      baziWuXingSynergy: "Complementary Fire/Metal generative cycle with mutual balance.",
    };
  }

  let ashtakootaGunas = {
    totalScore: 28,
    verdict: "Highly Auspicious (Above 18/36)",
    breakdown: { Varna: 1, Vashya: 2, Tara: 3, Yoni: 4, GrahaMaitri: 5, Gana: 5, Bhakoot: 7, Nadi: 1 },
  };
  let baziWuXingSynergy = "Complementary Fire/Metal generative cycle with mutual balance.";

  // 1. Ingest FreeAstro REST
  try {
    const res = await fetch(`${FREEASTRO_URL}/api/v1/synastry/aspects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ chart1: { date: input.date, time: input.time, lat: input.latitude, lon: input.longitude } }),
      signal: options.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.ashtakoota) ashtakootaGunas = data.ashtakoota;
      if (data.bazi_synergy) baziWuXingSynergy = data.bazi_synergy;
    }
  } catch (err) {
    console.warn("[FreeAstro] Synastry REST call failed, proceeding with Kundali MCP enrichment:", err);
  }

  // 2. Ingest & Merge Kundali MCP (kundali_milan)
  try {
    const mcpRes = await callKundaliMcp("kundali_milan", {
      date: input.date,
      time: input.time,
      latitude: input.latitude,
      longitude: input.longitude,
    }, options);
    if (mcpRes?.result?.ashtakoota) {
      ashtakootaGunas = { ...ashtakootaGunas, ...mcpRes.result.ashtakoota };
    }
  } catch {}

  return {
    source: "kundali_freeastro_astroway",
    ashtakootaGunas,
    baziWuXingSynergy,
  };
}

/**
 * 15. Shard Predictive & Business Electional (FreeAstroAPI / AstroWay / Kundali MCP)
 */
export async function fetchPredictiveElectional(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<PredictiveElectionalShard> {
  const apiKey = process.env.FREEASTRO_API_KEY;

  if (options.dryRun || !apiKey) {
    return {
      source: "freeastro_astroway_kundali",
      zodiacalReleasingL1L4: [
        { level: "L1", sign: "Aries", ruler: "Mars", start: "2024-01-01", end: "2039-01-01", peak: true },
        { level: "L2", sign: "Leo", ruler: "Sun", start: "2026-03-01", end: "2027-02-01", peak: true },
      ],
      recommendedElectionWindows: [
        {
          startUtc: "2026-10-04T14:30:00Z",
          endUtc: "2026-10-04T16:00:00Z",
          suitability: "Optimal Brand Launch — Sun on MC with benefic Jupiter trine.",
          score: 94,
        },
        {
          startUtc: "2026-11-12T09:15:00Z",
          endUtc: "2026-11-12T11:00:00Z",
          suitability: "Contract Signing & Corporate Incorporation — Venus exalted in 10th.",
          score: 89,
        },
      ],
    };
  }

  let zodiacalReleasingL1L4: any[] = [];
  let recommendedElectionWindows: any[] = [];

  // 1. Ingest FreeAstro REST
  try {
    const res = await fetch(`${FREEASTRO_URL}/api/v1/electional/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ targetDate: input.date, latitude: input.latitude, longitude: input.longitude }),
      signal: options.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.zodiacal_releasing) zodiacalReleasingL1L4 = data.zodiacal_releasing;
      if (data.election_windows) recommendedElectionWindows = data.election_windows;
    }
  } catch (err) {
    console.warn("[FreeAstro] Electional REST call failed, proceeding with Kundali Muhurat MCP enrichment:", err);
  }

  // 2. Ingest & Merge Kundali MCP (muhurat)
  try {
    const mcpRes = await callKundaliMcp("muhurat", {
      date: input.date,
      latitude: input.latitude,
      longitude: input.longitude,
    }, options);
    if (mcpRes?.result?.recommendedElectionWindows) {
      recommendedElectionWindows = [...recommendedElectionWindows, ...mcpRes.result.recommendedElectionWindows];
    }
  } catch {}

  return {
    source: "freeastro_astroway_kundali",
    zodiacalReleasingL1L4,
    recommendedElectionWindows,
  };
}

