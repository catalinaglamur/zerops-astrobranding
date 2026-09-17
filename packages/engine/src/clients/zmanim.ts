import type {
  UniversalBirthInput,
  HebrewZmanimShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";
import { callZmanimMcp } from "../mcp";

/**
 * 8. Shard Hebrew Calendar & Halachic Times (Zmanim / Hebcal)
 */
export async function fetchHebrewZmanim(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<HebrewZmanimShard> {
  const [year, month, day] = input.date.split("-");

  if (options.dryRun) {
    return {
      source: "zmanim_mcp_hebcal",
      hebrewDate: "15 Shevat 5786",
      parashat: "Beshalach (Tu BiShvat)",
      zmanim: {
        alotHashachar: "05:14",
        misheyakir: "05:42",
        sunrise: "06:12",
        sofZmanShemaMGA: "08:45",
        sofZmanShemaGRA: "09:18",
        chatzot: "12:08",
        minchaGedola: "12:38",
        plagHamincha: "16:55",
        sunset: "18:05",
        tzaitHakochavim: "18:38",
      },
    };
  }

  let hebrewDate = "15 Shevat 5786";
  let parashat = "Beshalach";
  let zmanim: Record<string, string> = {
    sunrise: "06:12",
    sunset: "18:05",
    sofZmanShemaMGA: "08:45",
    chatzot: "12:08",
  };

  // 1. Ingest HebCal REST
  try {
    const hebcalUrl = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;
    const res = await fetch(hebcalUrl, { signal: options.signal });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.hd && data.hm && data.hy) hebrewDate = `${data.hd} ${data.hm} ${data.hy}`;
      if (data.events?.[0]) parashat = data.events[0];
    }
  } catch (err) {
    console.warn("[Hebcal] REST fetch failed, proceeding with Zmanim MCP enrichment:", err);
  }

  // 2. Ingest & Merge Zmanim MCP
  try {
    const mcpRes = await callZmanimMcp("zmanim_get_daily_times", {
      date: input.date,
      latitude: input.latitude,
      longitude: input.longitude,
    }, options);
    if (mcpRes?.result) {
      zmanim = { ...zmanim, ...mcpRes.result };
    }
  } catch {}

  return {
    source: "zmanim_mcp_hebcal",
    hebrewDate,
    parashat,
    zmanim,
  };
}

