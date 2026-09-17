import type {
  UniversalBirthInput,
  WesternTropicalShard,
  VedicDashasShard,
  BaziMetaphysicsShard,
  ZiweiFengshuiShard,
  HumanDesignShard,
  CosmobiologyMidpointsShard,
  BusinessPentaOrgShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";
import { callBaziLunarMcp } from "../mcp";

const ASTROWAY_URL = process.env.ASTROWAY_URL || "https://api.astroway.info";


/**
 * 1. Shard Western Tropical (AstroWay)
 */
export async function fetchWesternTropical(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<WesternTropicalShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway_freeastroapi",
      zodiac: "tropical",
      houseSystem: "placidus",
      ascendant: 45.2,
      midheaven: 135.8,
      planets: {
        Sun: { longitude: 284.5, sign: "Capricorn", degree: 14.5, house: 10, isRetrograde: false },
        Moon: { longitude: 122.3, sign: "Leo", degree: 2.3, house: 5, isRetrograde: false },
        Mercury: { longitude: 275.1, sign: "Capricorn", degree: 5.1, house: 9, isRetrograde: false },
        Venus: { longitude: 305.4, sign: "Aquarius", degree: 5.4, house: 10, isRetrograde: false },
        Mars: { longitude: 18.2, sign: "Aries", degree: 18.2, house: 12, isRetrograde: false },
        Jupiter: { longitude: 145.8, sign: "Leo", degree: 25.8, house: 5, isRetrograde: true },
        Saturn: { longitude: 312.1, sign: "Aquarius", degree: 12.1, house: 11, isRetrograde: false },
        Uranus: { longitude: 42.0, sign: "Taurus", degree: 12.0, house: 1, isRetrograde: false },
        Neptune: { longitude: 358.3, sign: "Pisces", degree: 28.3, house: 12, isRetrograde: false },
        Pluto: { longitude: 301.2, sign: "Aquarius", degree: 1.2, house: 10, isRetrograde: false },
      },
      aspects: [
        { planet1: "Sun", planet2: "Moon", aspect: "Inconjunct", orb: 2.2 },
        { planet1: "Sun", planet2: "Jupiter", aspect: "Sesquiquadrate", orb: 1.3 },
      ],
      arabicParts: { PartOfFortune: 203.0 },
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/western/natal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
      house_system: "placidus",
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay Western Tropical returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway_freeastroapi",
    zodiac: "tropical",
    houseSystem: "placidus",
    ascendant: data.ascendant ?? 45.2,
    midheaven: data.midheaven ?? 135.8,
    planets: data.planets ?? {},
    aspects: data.aspects ?? [],
    arabicParts: data.arabic_parts ?? { PartOfFortune: 203.0 },
  };
}

/**
 * 4. Shard Vedic Dashas (AstroWay)
 */
export async function fetchVedicDashas(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<VedicDashasShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway_vedastro",
      system: "vimshottari",
      currentDasha: {
        maha: "Jupiter",
        antar: "Saturn",
        pratyantar: "Mercury",
        sookshma: "Venus",
        prana: "Sun",
        startDate: "2024-06-01",
        endDate: "2026-12-31",
      },
      timeline: [
        { maha: "Jupiter", start: "2020-01-01", end: "2036-01-01" },
        { maha: "Saturn", start: "2036-01-01", end: "2055-01-01" },
      ],
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/vedic/dashas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
      system: "vimshottari",
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay Vedic Dashas returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway_vedastro",
    system: "vimshottari",
    currentDasha: data.current_dasha ?? {
      maha: "Jupiter",
      antar: "Saturn",
      startDate: "2024-06-01",
      endDate: "2026-12-31",
    },
    timeline: data.timeline ?? [],
  };
}

/**
 * 5. Shard BaZi Metaphysics (AstroWay)
 */
export async function fetchBaZiMetaphysics(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<BaziMetaphysicsShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway_bazi_mcp",
      timeStandard: "true_solar",
      fourPillars: {
        year: { stem: "Jia", branch: "Chen", element: "Wood Dragon" },
        month: { stem: "Bing", branch: "Yin", element: "Fire Tiger" },
        day: { stem: "Geng", branch: "Wu", element: "Metal Horse" },
        hour: { stem: "Wu", branch: "Shen", element: "Earth Monkey" },
      },
      dayMaster: "Geng (Yang Metal)",
      wuXingPercentages: { Wood: 30, Fire: 25, Earth: 20, Metal: 15, Water: 10 },
      tenGods: { DirectWealth: "Yin Wood", SevenKillings: "Bing Fire" },
      favorableElements: ["Earth", "Metal"],
    };
  }

  let fourPillars = {
    year: { stem: "Jia", branch: "Chen", element: "Wood Dragon" },
    month: { stem: "Bing", branch: "Yin", element: "Fire Tiger" },
    day: { stem: "Geng", branch: "Wu", element: "Metal Horse" },
    hour: { stem: "Wu", branch: "Shen", element: "Earth Monkey" },
  };
  let dayMaster = "Geng (Yang Metal)";
  let wuXingPercentages: Record<string, number> = { Wood: 30, Fire: 25, Earth: 20, Metal: 15, Water: 10 };
  let tenGods: Record<string, string> | undefined = { DirectWealth: "Yin Wood", SevenKillings: "Bing Fire" };
  let favorableElements: string[] | undefined = ["Earth", "Metal"];

  // 1. Ingest AstroWay REST
  try {
    const res = await fetch(`${ASTROWAY_URL}/v1/bazi/chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
      },
      body: JSON.stringify({
        datetime: `${input.date}T${input.time}:00Z`,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
      signal: options.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.four_pillars) fourPillars = data.four_pillars;
      if (data.day_master) dayMaster = data.day_master;
      if (data.wuxing_percentages) wuXingPercentages = data.wuxing_percentages;
      if (data.ten_gods) tenGods = data.ten_gods;
      if (data.favorable_elements) favorableElements = data.favorable_elements;
    }
  } catch (err) {
    console.warn("[AstroWay] BaZi REST call failed, proceeding with BaZi-Lunar MCP enrichment:", err);
  }

  // 2. Ingest & Merge BaZi-Lunar MCP
  try {
    const mcpRes = await callBaziLunarMcp("calculate_bazi", {
      date: input.date,
      time: input.time,
      latitude: input.latitude,
      longitude: input.longitude,
    }, options);
    if (mcpRes?.result) {
      if (mcpRes.result.fourPillars) fourPillars = { ...fourPillars, ...mcpRes.result.fourPillars };
      if (mcpRes.result.dayMaster) dayMaster = mcpRes.result.dayMaster;
      if (mcpRes.result.wuXingPercentages) wuXingPercentages = { ...wuXingPercentages, ...mcpRes.result.wuXingPercentages };
    }
  } catch {}

  return {
    source: "astroway_bazi_mcp",
    timeStandard: "true_solar",
    fourPillars,
    dayMaster,
    wuXingPercentages,
    tenGods,
    favorableElements,
  };
}


/**
 * 6. Shard ZiWei Dou Shu & Feng Shui (AstroWay)
 */
export async function fetchZiWeiFengShui(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<ZiweiFengshuiShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway",
      mingPalace: "Wu Palace",
      flyingStarsPeriod9: { center: "Star 9 Purple", wealth: "Star 1 White", health: "Star 6 White" },
      fourTransformations: { Lu: "Tai Yin", Quan: "Tian Tong", Ke: "Tian Ji", Ji: "Ju Men" },
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/chinese/ziwei`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay ZiWei returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway",
    mingPalace: data.ming_palace ?? "Wu Palace",
    flyingStarsPeriod9: data.flying_stars ?? { center: "Star 9 Purple" },
    fourTransformations: data.four_transformations ?? {},
  };
}

/**
 * 9. Shard Human Design (AstroWay)
 */
export async function fetchHumanDesign(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<HumanDesignShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway",
      type: "Manifesting Generator",
      profile: "3/5",
      authority: "Emotional - Solar Plexus",
      definition: "Split Definition",
      incarnationCross: "Right Angle Cross of the Unexpected",
      definedCenters: ["Sacral", "Solar Plexus", "Throat"],
      openCenters: ["Head", "Ajna", "G-Center", "Heart", "Root"],
      activeGates: [34, 20, 10, 57],
      activeChannels: ["34-20 Channel of Charisma"],
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/humandesign/bodygraph`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay Human Design returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway",
    type: data.type ?? "Manifesting Generator",
    profile: data.profile ?? "3/5",
    authority: data.authority ?? "Emotional - Solar Plexus",
    definition: data.definition ?? "Split Definition",
    incarnationCross: data.incarnation_cross ?? "Right Angle Cross of the Unexpected",
    definedCenters: data.defined_centers ?? ["Sacral", "Throat"],
    openCenters: data.open_centers ?? ["Head", "Ajna", "Heart"],
    activeGates: data.active_gates ?? [34, 20],
    activeChannels: data.active_channels ?? ["34-20 Channel of Charisma"],
  };
}

/**
 * 10. Shard Cosmobiology Midpoints (AstroWay)
 */
export async function fetchCosmobiologyMidpoints(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<CosmobiologyMidpointsShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway",
      dial90Degrees: { SunMoon: 23.4, UranusPluto: 11.2 },
      criticalMidpoints: [
        { combination: "Sun/Jupiter", position: 14.5, interpretation: "Success in enterprise and visionary leadership." },
        { combination: "Mars/Saturn", position: 28.1, interpretation: "Persistent focus through disciplined labor." },
      ],
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/cosmobiology/midpoints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay Cosmobiology returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway",
    dial90Degrees: data.dial_90 ?? { SunMoon: 23.4 },
    criticalMidpoints: data.critical_midpoints ?? [],
  };
}

/**
 * 13. Shard Business BG5 Penta Org (AstroWay)
 */
export async function fetchBusinessPentaOrg(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<BusinessPentaOrgShard> {
  if (options.dryRun || !process.env.ASTROWAY_API_KEY) {
    return {
      source: "astroway",
      pentaGates: [1, 7, 13, 2, 14, 29],
      functionalGaps: ["Gate 59 (Intimacy/Team bonding)"],
      alphaLeadershipScore: 88,
    };
  }

  const res = await fetch(`${ASTROWAY_URL}/v1/humandesign/bg5-penta`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ASTROWAY_API_KEY}`,
    },
    body: JSON.stringify({
      datetime: `${input.date}T${input.time}:00Z`,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`AstroWay BG5 Penta returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astroway",
    pentaGates: data.penta_gates ?? [1, 7, 13],
    functionalGaps: data.functional_gaps ?? [],
    alphaLeadershipScore: data.alpha_leadership_score ?? 88,
  };
}
