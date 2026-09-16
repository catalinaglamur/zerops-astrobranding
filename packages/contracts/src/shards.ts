import { z } from "zod";

/**
 * Universal Birth Input Schema
 * Required input to trigger the 15-Shard Universal Extraction
 */
export const UniversalBirthInputSchema = z.object({
  clientId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format HH:mm or HH:mm:ss"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeMeters: z.number().default(0),
  timezone: z.string().default("UTC"),
  city: z.string().min(1),
  country: z.string().min(1),
});

export type UniversalBirthInput = z.infer<typeof UniversalBirthInputSchema>;

// Shard 1: Western Tropical (AstroWay / FreeAstroAPI)
export const WesternTropicalShardSchema = z.object({
  source: z.literal("astroway_freeastroapi"),
  zodiac: z.literal("tropical"),
  houseSystem: z.string().default("placidus"),
  ascendant: z.number(),
  midheaven: z.number(),
  planets: z.record(z.string(), z.object({
    longitude: z.number(),
    latitude: z.number().optional(),
    speed: z.number().optional(),
    sign: z.string(),
    degree: z.number(),
    house: z.number(),
    isRetrograde: z.boolean().default(false),
  })),
  aspects: z.array(z.object({
    planet1: z.string(),
    planet2: z.string(),
    aspect: z.string(),
    orb: z.number(),
  })).optional(),
  arabicParts: z.record(z.string(), z.number()).optional(),
});

// Shard 2: Western Sidereal (Astrology-API.io / FreeAstroAPI)
export const WesternSiderealShardSchema = z.object({
  source: z.literal("astrologyapi_freeastroapi"),
  zodiac: z.literal("sidereal"),
  ayanamsa: z.enum(["fagan_bradley", "lahiri"]).default("fagan_bradley"),
  houseSystem: z.string().default("campanus"),
  planets: z.record(z.string(), z.object({
    longitude: z.number(),
    sign: z.string(),
    degree: z.number(),
    house: z.number(),
  })),
  mundoscopeHouses: z.record(z.string(), z.number()).optional(),
});

// Shard 3: Vedic Jyotish (VedAstro PRO / Kundali MCP)
export const VedicJyotishShardSchema = z.object({
  source: z.literal("vedastro_kundali_mcp"),
  lagna: z.object({
    sign: z.string(),
    degree: z.number(),
    nakshatra: z.string(),
    pada: z.number(),
  }),
  shodashavarga: z.record(z.string(), z.record(z.string(), z.any())).optional(), // D1 - D60
  shadbala: z.record(z.string(), z.number()).optional(), // 6 factors
  yogas: z.array(z.object({
    name: z.string(),
    description: z.string(),
    verbatimCitation: z.string().optional(),
  })).optional(),
});

// Shard 4: Vedic Dashas (AstroWay / VedAstro PRO)
export const VedicDashasShardSchema = z.object({
  source: z.literal("astroway_vedastro"),
  system: z.literal("vimshottari"),
  currentDasha: z.object({
    maha: z.string(),
    antar: z.string(),
    pratyantar: z.string().optional(),
    sookshma: z.string().optional(),
    prana: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  timeline: z.array(z.any()).optional(),
});

// Shard 5: BaZi Metaphysics (AstroWay / BaZi-Lunar MCP)
export const BaziMetaphysicsShardSchema = z.object({
  source: z.literal("astroway_bazi_mcp"),
  fourPillars: z.object({
    year: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
    month: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
    day: z.object({ stem: z.string(), branch: z.string(), element: z.string() }), // Day Master
    hour: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
  }),
  dayMaster: z.string(),
  wuXingPercentages: z.record(z.string(), z.number()),
  tenGods: z.record(z.string(), z.string()).optional(),
  favorableElements: z.array(z.string()).optional(),
});

// Shard 6: ZiWei Dou Shu & Feng Shui (AstroWay)
export const ZiweiFengshuiShardSchema = z.object({
  source: z.literal("astroway"),
  mingPalace: z.string().optional(),
  flyingStarsPeriod9: z.record(z.string(), z.any()).optional(),
  fourTransformations: z.record(z.string(), z.string()).optional(), // Lu, Quan, Ke, Ji
});

// Shard 7: Kabbalah & Gematria (Astrology-API.io / Local Tikkun)
export const KabbalahGematriaShardSchema = z.object({
  source: z.literal("astrologyapi_tikkun"),
  tikkun: z.object({
    sign: z.string(),
    northNodeHouse: z.number(),
    coreCorrection: z.string(),
    rectorTheme: z.string(),
    bergPrescription: z.string(),
  }),
  gematria: z.record(z.string(), z.number()).optional(), // Ragil, Siduri, Katan, Kolel
  sefirotPath: z.string().optional(),
});

// Shard 8: Hebrew Calendar & Zmanim (Zmanim MCP / HebCal)
export const HebrewZmanimShardSchema = z.object({
  source: z.literal("zmanim_mcp_hebcal"),
  hebrewDate: z.string(),
  parashat: z.string().optional(),
  zmanim: z.record(z.string(), z.string()).optional(), // sunrise, sunset, shema, etc.
});

// Shard 9: Human Design (AstroWay)
export const HumanDesignShardSchema = z.object({
  source: z.literal("astroway"),
  type: z.string(),
  profile: z.string(),
  authority: z.string(),
  definition: z.string(),
  incarnationCross: z.string(),
  definedCenters: z.array(z.string()),
  openCenters: z.array(z.string()),
  activeGates: z.array(z.number()),
  activeChannels: z.array(z.string()),
});

// Shard 10: Cosmobiology Midpoints (AstroWay)
export const CosmobiologyMidpointsShardSchema = z.object({
  source: z.literal("astroway"),
  dial90Degrees: z.record(z.string(), z.any()).optional(),
  criticalMidpoints: z.array(z.object({
    combination: z.string(),
    position: z.number(),
    interpretation: z.string().optional(),
  })).optional(),
});

// Shard 11: NASA Horizons Ephemerides (NASA JPL Horizons)
export const NasaEphemeridesShardSchema = z.object({
  source: z.literal("nasa_horizons"),
  asteroids: z.record(z.string(), z.object({
    id: z.string(),
    name: z.string(),
    distanceAu: z.number().optional(),
    velocityKmS: z.number().optional(),
  })).optional(),
});

// Shard 12: Astrocartography ACG (FreeAstroAPI / AstroWay)
export const AstrocartographyAcgShardSchema = z.object({
  source: z.literal("freeastroapi_astroway"),
  majorLines: z.array(z.object({
    planet: z.string(),
    lineType: z.enum(["MC", "IC", "ASC", "DSC"]),
    geoJsonCoordinates: z.array(z.array(z.number())).optional(),
  })),
  localSpaceAzimuths: z.record(z.string(), z.number()).optional(),
});

// Shard 13: Business BG5 Penta (AstroWay)
export const BusinessPentaOrgShardSchema = z.object({
  source: z.literal("astroway"),
  pentaGates: z.array(z.number()).optional(),
  functionalGaps: z.array(z.string()).optional(),
  alphaLeadershipScore: z.number().optional(),
});

// Shard 14: Partner Synastry & Compatibility (Kundali MCP / FreeAstroAPI / AstroWay)
export const PartnerSynastryShardSchema = z.object({
  source: z.literal("kundali_freeastro_astroway"),
  ashtakootaGunas: z.object({
    totalScore: z.number().min(0).max(36),
    verdict: z.string(),
    breakdown: z.record(z.string(), z.number()).optional(),
  }).optional(),
  baziWuXingSynergy: z.string().optional(),
});

// Shard 15: Predictive & Business Electional (FreeAstroAPI / AstroWay / Kundali MCP)
export const PredictiveElectionalShardSchema = z.object({
  source: z.literal("freeastro_astroway_kundali"),
  zodiacalReleasingL1L4: z.array(z.any()).optional(),
  recommendedElectionWindows: z.array(z.object({
    startUtc: z.string(),
    endUtc: z.string(),
    suitability: z.string(),
    score: z.number(),
  })).optional(),
});

/**
 * Complete Canonical 15-Shard Dump Structure for PostgreSQL 18 JSONB
 */
export const ClientDumpsRecordSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  birthMetadata: UniversalBirthInputSchema,
  shardWesternTropical: WesternTropicalShardSchema,
  shardWesternSidereal: WesternSiderealShardSchema,
  shardVedicJyotish: VedicJyotishShardSchema,
  shardVedicDashas: VedicDashasShardSchema,
  shardBaziMetaphysics: BaziMetaphysicsShardSchema,
  shardZiweiFengshui: ZiweiFengshuiShardSchema,
  shardKabbalahGematria: KabbalahGematriaShardSchema,
  shardHebrewZmanim: HebrewZmanimShardSchema,
  shardHumanDesign: HumanDesignShardSchema,
  shardCosmobiologyMidpoints: CosmobiologyMidpointsShardSchema,
  shardNasaEphemerides: NasaEphemeridesShardSchema,
  shardAstrocartographyAcg: AstrocartographyAcgShardSchema,
  shardBusinessPentaOrg: BusinessPentaOrgShardSchema,
  shardPartnerSynastry: PartnerSynastryShardSchema,
  shardPredictiveElectional: PredictiveElectionalShardSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ClientDumpsRecord = z.infer<typeof ClientDumpsRecordSchema>;
