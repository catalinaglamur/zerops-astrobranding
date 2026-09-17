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

// Shard 1: Western Tropical (FreeAstroAPI / Astrology-API.io / AstroWay)
export const WesternTropicalShardSchema = z.object({
  source: z.string().default("multi_provider_tropical"),
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
  svgChartWheel: z.string().optional(),
  royalStars: z.array(z.any()).optional(),
  psychologicalThemes: z.record(z.string(), z.any()).optional(),
});

// Shard 2: Western Sidereal (Astrology-API.io / FreeAstroAPI / AstroWay)
export const WesternSiderealShardSchema = z.object({
  source: z.string().default("multi_provider_sidereal"),
  zodiac: z.literal("sidereal"),
  ayanamsa: z.string().default("fagan_bradley"),
  houseSystem: z.string().default("campanus"),
  planets: z.record(z.string(), z.object({
    longitude: z.number(),
    sign: z.string(),
    degree: z.number(),
    house: z.number(),
  })),
  mundoscopeHouses: z.record(z.string(), z.number()).optional(),
  fixedStars: z.array(z.any()).optional(),
  campanusCusps: z.array(z.number()).optional(),
});

// Shard 3: Vedic Jyotish (VedAstro PRO / AstroWay / FreeAstro KP / Astrology-API / Kundali MCP)
export const VedicJyotishShardSchema = z.object({
  source: z.string().default("multi_provider_vedic"),
  lagna: z.object({
    sign: z.string(),
    degree: z.number(),
    nakshatra: z.string(),
    pada: z.number(),
  }),
  shodashavarga: z.record(z.string(), z.record(z.string(), z.any())).optional(), // D1 - D60 from AstroWay/VedAstro
  shadbala: z.record(z.string(), z.number()).optional(), // 6 factors from AstroWay/VedAstro
  yogas: z.array(z.object({
    name: z.string(),
    description: z.string(),
    verbatimCitation: z.string().optional(),
  })).optional(),
  kpSignificators: z.record(z.string(), z.any()).optional(), // FreeAstroAPI KP V2
  drikBala: z.record(z.string(), z.any()).optional(), // Astrology-API.io
  grahaDrishti: z.record(z.string(), z.any()).optional(), // Astrology-API.io
  panchang: z.record(z.string(), z.any()).optional(), // Kundali MCP
});

// Shard 4: Vedic Dashas (AstroWay / VedAstro PRO / Kundali MCP)
export const VedicDashasShardSchema = z.object({
  source: z.string().default("multi_provider_dashas"),
  system: z.string().default("vimshottari"),
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
  systemsAvailable: z.array(z.string()).optional(),
});

// Shard 5: BaZi Metaphysics (AstroWay / FreeAstroAPI / BaZi-Lunar MCP)
export const BaziMetaphysicsShardSchema = z.object({
  source: z.string().default("multi_provider_bazi"),
  timeStandard: z.string().default("true_solar"),
  fourPillars: z.object({
    year: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
    month: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
    day: z.object({ stem: z.string(), branch: z.string(), element: z.string() }), // Day Master
    hour: z.object({ stem: z.string(), branch: z.string(), element: z.string() }),
  }),
  dayMaster: z.string(),
  dayMasterStrength: z.number().optional(), // FreeAstroAPI score 0-100
  wuXingPercentages: z.record(z.string(), z.number()),
  yongShen: z.object({ primary: z.string(), secondary: z.string().optional() }).optional(), // Useful God
  daYunFlow: z.array(z.any()).optional(), // 10-year luck pillars from FreeAstroAPI
  shenSha: z.array(z.string()).optional(), // Symbolic stars
  tenGods: z.record(z.string(), z.string()).optional(),
  favorableElements: z.array(z.string()).optional(),
  auspiciousHours: z.array(z.string()).optional(), // BaZi MCP
});

// Shard 6: ZiWei Dou Shu & Feng Shui (AstroWay / BaZi MCP)
export const ZiweiFengshuiShardSchema = z.object({
  source: z.string().default("astroway_bazi_mcp"),
  mingPalace: z.string().optional(),
  twelvePalaces: z.record(z.string(), z.any()).optional(),
  flyingStarsPeriod9: z.record(z.string(), z.any()).optional(),
  fourTransformations: z.record(z.string(), z.string()).optional(), // Lu, Quan, Ke, Ji
});

// Shard 7: Kabbalah & Gematria (Astrology-API.io / FreeAstroAPI / Local Tikkun)
export const KabbalahGematriaShardSchema = z.object({
  source: z.string().default("multi_provider_kabbalah_numerology"),
  tikkun: z.object({
    sign: z.string(),
    northNodeHouse: z.number(),
    coreCorrection: z.string(),
    rectorTheme: z.string(),
    bergPrescription: z.string(),
  }),
  gematria: z.record(z.string(), z.number()).optional(), // Ragil, Siduri, Katan, Kolel
  coreNumbers5Pillars: z.record(z.string(), z.any()).optional(), // Astrology-API.io (Life Path, Soul Urge, etc)
  fourInOneNumerology: z.record(z.string(), z.any()).optional(), // FreeAstroAPI (Pythagorean, Chaldean, Kabbalah, Vedic)
  sefirotPath: z.string().optional(),
});

// Shard 8: Hebrew Calendar & Zmanim (Zmanim MCP / HebCal)
export const HebrewZmanimShardSchema = z.object({
  source: z.string().default("hebcal_zmanim_mcp"),
  hebrewDate: z.string(),
  parashat: z.string().optional(),
  zmanim: z.record(z.string(), z.string()).optional(), // sunrise, sunset, shema, etc.
});

// Shard 9: Human Design (AstroWay)
export const HumanDesignShardSchema = z.object({
  source: z.string().default("astroway_hd"),
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
  source: z.string().default("astroway_uranian"),
  dial90Degrees: z.record(z.string(), z.any()).optional(),
  criticalMidpoints: z.array(z.object({
    combination: z.string(),
    position: z.number(),
    interpretation: z.string().optional(),
  })).optional(),
});

// Shard 11: NASA Horizons Ephemerides (NASA JPL Horizons)
export const NasaEphemeridesShardSchema = z.object({
  source: z.string().default("nasa_jpl_horizons"),
  asteroids: z.record(z.string(), z.object({
    id: z.string(),
    name: z.string(),
    distanceAu: z.number().optional(),
    velocityKmS: z.number().optional(),
  })).optional(),
});

// Shard 12: Astrocartography ACG (FreeAstroAPI / AstroWay / Astrology-API.io)
export const AstrocartographyAcgShardSchema = z.object({
  source: z.string().default("multi_provider_acg"),
  majorLines: z.array(z.object({
    planet: z.string(),
    lineType: z.enum(["MC", "IC", "ASC", "DSC"]),
    geoJsonCoordinates: z.array(z.array(z.number())).optional(),
  })),
  localSpaceAzimuths: z.record(z.string(), z.number()).optional(),
  bestPlacesRanking: z.array(z.any()).optional(), // AstroWay 34k cities
  parans: z.array(z.any()).optional(),
  relocationReport: z.record(z.string(), z.any()).optional(),
});

// Shard 13: Business BG5 Penta (AstroWay / FreeAstroAPI)
export const BusinessPentaOrgShardSchema = z.object({
  source: z.string().default("astroway_freeastro_business"),
  pentaGates: z.array(z.number()).optional(),
  functionalGaps: z.array(z.string()).optional(),
  alphaLeadershipScore: z.number().optional(),
});

// Shard 14: Partner Synastry & Compatibility (FreeAstroAPI / VedAstro PRO / Kundali MCP / BaZi MCP)
export const PartnerSynastryShardSchema = z.object({
  source: z.string().default("multi_provider_synastry"),
  ashtakootaGunas: z.object({
    totalScore: z.number().min(0).max(36),
    verdict: z.string(),
    breakdown: z.record(z.string(), z.number()).optional(),
  }).optional(),
  baziWuXingSynergy: z.string().optional(),
});

// Shard 15: Predictive & Business Electional (Astrology-API.io / AstroWay / FreeAstroAPI / Kundali MCP)
export const PredictiveElectionalShardSchema = z.object({
  source: z.string().default("multi_provider_electional"),
  hellenisticTimeline: z.record(z.string(), z.any()).optional(), // Astrology-API.io timeline
  zodiacalReleasingL1L4: z.array(z.any()).optional(), // AstroWay
  electionalSearches: z.record(z.string(), z.any()).optional(), // FreeAstroAPI searches
  muhurat: z.record(z.string(), z.any()).optional(), // Kundali MCP
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

export type WesternTropicalShard = z.infer<typeof WesternTropicalShardSchema>;
export type WesternSiderealShard = z.infer<typeof WesternSiderealShardSchema>;
export type VedicJyotishShard = z.infer<typeof VedicJyotishShardSchema>;
export type VedicDashasShard = z.infer<typeof VedicDashasShardSchema>;
export type BaziMetaphysicsShard = z.infer<typeof BaziMetaphysicsShardSchema>;
export type ZiweiFengshuiShard = z.infer<typeof ZiweiFengshuiShardSchema>;
export type KabbalahGematriaShard = z.infer<typeof KabbalahGematriaShardSchema>;
export type HebrewZmanimShard = z.infer<typeof HebrewZmanimShardSchema>;
export type HumanDesignShard = z.infer<typeof HumanDesignShardSchema>;
export type CosmobiologyMidpointsShard = z.infer<typeof CosmobiologyMidpointsShardSchema>;
export type NasaEphemeridesShard = z.infer<typeof NasaEphemeridesShardSchema>;
export type AstrocartographyAcgShard = z.infer<typeof AstrocartographyAcgShardSchema>;
export type BusinessPentaOrgShard = z.infer<typeof BusinessPentaOrgShardSchema>;
export type PartnerSynastryShard = z.infer<typeof PartnerSynastryShardSchema>;
export type PredictiveElectionalShard = z.infer<typeof PredictiveElectionalShardSchema>;

