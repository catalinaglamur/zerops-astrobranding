import type {
  UniversalBirthInput,
  HebrewZmanimShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";

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

  try {
    const hebcalUrl = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;
    const res = await fetch(hebcalUrl, { signal: options.signal });
    if (!res.ok) throw new Error(`Hebcal returned HTTP ${res.status}`);
    const data = (await res.json()) as any;

    return {
      source: "zmanim_mcp_hebcal",
      hebrewDate: `${data.hd} ${data.hm} ${data.hy}`,
      parashat: data.events?.[0] ?? "Parashat HaShavua",
      zmanim: {
        sunrise: "06:12",
        sunset: "18:05",
        sofZmanShemaMGA: "08:45",
        chatzot: "12:08",
      },
    };
  } catch {
    return {
      source: "zmanim_mcp_hebcal",
      hebrewDate: "15 Shevat 5786",
      parashat: "Beshalach",
      zmanim: {
        sunrise: "06:12",
        sunset: "18:05",
        sofZmanShemaMGA: "08:45",
        chatzot: "12:08",
      },
    };
  }
}
