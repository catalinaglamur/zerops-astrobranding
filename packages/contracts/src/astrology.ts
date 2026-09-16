import { z } from "zod";

export const NatalChartInputSchema = z.object({
  clientId: z.string().uuid(),
  ayanamsha: z.enum(["tropical", "lahiri", "fagan_bradley"]).default("tropical"),
  houseSystem: z.enum(["placidus", "whole_sign", "koch", "equal"]).default("placidus"),
});

export type NatalChartInput = z.infer<typeof NatalChartInputSchema>;

export const AstrologicalPointSchema = z.object({
  name: z.string(),
  sign: z.string(),
  degree: z.number().min(0).max(30),
  minute: z.number().min(0).max(60),
  house: z.number().int().min(1).max(12),
  isRetrograde: z.boolean().default(false),
});

export type AstrologicalPoint = z.infer<typeof AstrologicalPointSchema>;

export const ChartAnalysisResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  points: z.array(AstrologicalPointSchema),
  archetype: z.string(),
  strategicSummary: z.string(),
  brandingRecommendations: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export type ChartAnalysisResponse = z.infer<typeof ChartAnalysisResponseSchema>;

export const SemanticSearchSchema = z.object({
  query: z.string().min(3),
  limit: z.number().int().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.75),
});

export type SemanticSearchInput = z.infer<typeof SemanticSearchSchema>;
