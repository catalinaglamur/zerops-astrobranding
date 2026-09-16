import { z } from "zod";

/**
 * 5 Canonical Gold Feeds Projections (< 1.5 KB XML each)
 * Structured strictly to feed sub-oracles without LLM context pollution.
 */
export const GoldFeedTypeSchema = z.enum([
  "diag_a_psy", // Psychological & Archetypal (Tropical/Sidereal + Hard Aspects + Nodes)
  "diag_b_voc", // Vocational & Artha (Houses 2/6/10, D10 Dasamsa, BaZi Day Master)
  "diag_c_mkt", // Timing & Launch (Profections, Dashas, Time-Lords, Zodiacal Releasing)
  "diag_d_leg", // Legal Safeguard & Partnerships (Houses 6/8/12, 36 Gunas, BaZi Clashes)
  "diag_e_geo", // Astrocartography & Power Cities (ACG Angular Lines, Parans, Local Space)
]);

export type GoldFeedType = z.infer<typeof GoldFeedTypeSchema>;

export const GoldFeedRecordSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  feedType: GoldFeedTypeSchema,
  xmlPayload: z.string().max(3000), // Enforced ultra-compact size
  tokenEstimate: z.number().int().max(600), // Maximum ~600 tokens
  createdAt: z.string().datetime(),
});

export type GoldFeedRecord = z.infer<typeof GoldFeedRecordSchema>;
