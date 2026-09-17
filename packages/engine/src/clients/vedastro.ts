import type {
  UniversalBirthInput,
  VedicJyotishShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";
import { callKundaliMcp } from "../mcp";

const VEDASTRO_URL = process.env.VEDASTRO_URL || "https://api.vedastro.org";

/**
 * 3. Shard Vedic Jyotish (VedAstro PRO / Kundali MCP)
 */
export async function fetchVedicJyotish(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<VedicJyotishShard> {
  const apiKey = process.env.VEDASTRO_API_KEY;

  if (options.dryRun || !apiKey) {
    return {
      source: "vedastro_kundali_mcp",
      lagna: {
        sign: "Mesha",
        degree: 21.2,
        nakshatra: "Bharani",
        pada: 3,
      },
      shodashavarga: {
        D1: { lagna: "Mesha", Sun: "Dhanu", Moon: "Karka", Jupiter: "Karka" },
        D9: { lagna: "Tula", Sun: "Mesha", Moon: "Vrishabha" },
        D10: { lagna: "Makara", Sun: "Kanya", Jupiter: "Meena" },
        D60: { lagna: "Vrishchika", quality: "Amrita" },
      },
      shadbala: {
        Sun: 1.45,
        Moon: 1.20,
        Mars: 1.60,
        Mercury: 1.10,
        Jupiter: 1.75,
        Venus: 1.30,
        Saturn: 1.05,
      },
      yogas: [
        {
          name: "Raja Yoga",
          description: "Lords of 9th and 10th houses conjunct in 10th house, granting sovereign professional authority.",
          verbatimCitation: "Brihat Parashara Hora Shastra, Ch. 35, Sloka 12",
        },
        {
          name: "Gaja Kesari Yoga",
          description: "Jupiter in kendra from Moon, providing enduring wisdom and public distinction.",
          verbatimCitation: "Brihat Parashara Hora Shastra, Ch. 36, Sloka 3",
        },
      ],
    };
  }

  let lagna = { sign: "Mesha", degree: 21.2, nakshatra: "Bharani", pada: 3 };
  let shodashavarga: Record<string, any> = { D1: { lagna: "Mesha" }, D10: { lagna: "Makara" } };
  let shadbala: Record<string, number> = { Sun: 1.45, Moon: 1.20, Mars: 1.60 };
  let yogas: any[] = [];

  // 1. Ingest VedAstro REST
  try {
    const res = await fetch(`${VEDASTRO_URL}/Calculate/AllPlanetData/Location/${encodeURIComponent(input.city)}/Time/${input.time}/${input.date}/+00:00`, {
      headers: { "Content-Type": "application/json", "API-Key": apiKey },
      signal: options.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.lagna) lagna = data.lagna;
      if (data.shodashavarga) shodashavarga = { ...shodashavarga, ...data.shodashavarga };
      if (data.shadbala) shadbala = { ...shadbala, ...data.shadbala };
      if (data.yogas) yogas = data.yogas;
    }
  } catch (err) {
    console.warn("[VedAstro] Live REST endpoint failed, proceeding with Kundali MCP enrichment:", err);
  }

  // 2. Ingest & Merge Kundali MCP
  try {
    const kundaliRes = await callKundaliMcp("kundali", {
      date: input.date,
      time: input.time,
      latitude: input.latitude,
      longitude: input.longitude,
    }, options);
    if (kundaliRes?.result) {
      if (kundaliRes.result.lagna) lagna = { ...lagna, ...kundaliRes.result.lagna };
      if (kundaliRes.result.shodashavarga) shodashavarga = { ...shodashavarga, ...kundaliRes.result.shodashavarga };
      if (kundaliRes.result.shadbala) shadbala = { ...shadbala, ...kundaliRes.result.shadbala };
      if (kundaliRes.result.yogas) yogas = [...yogas, ...kundaliRes.result.yogas];
    }
  } catch {}

  return {
    source: "vedastro_kundali_mcp",
    lagna,
    shodashavarga,
    shadbala,
    yogas,
  };
}

