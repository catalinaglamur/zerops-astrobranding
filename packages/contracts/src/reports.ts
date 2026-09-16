import { z } from "zod";

/**
 * Lead Funnel & Progressive Double Opt-In Schema
 */
export const LeadOptInStep1Schema = z.object({
  phone: z.string().min(8).max(20),
  countryCode: z.string().default("+57"),
});

export const LeadOptInStep2Schema = z.object({
  phone: z.string(),
  code: z.string().length(6),
});

export const LeadOptInStep3Schema = z.object({
  phone: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
});

/**
 * Diagnostic Report Response Schemas
 */
export const DiagnosticReportTrackSchema = z.enum([
  "psychological",
  "vocational",
  "timing",
  "legal",
  "astrocartography",
]);

export type DiagnosticReportTrack = z.infer<typeof DiagnosticReportTrackSchema>;

export const StrategicDiagnosticReportSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  track: DiagnosticReportTrackSchema,
  executiveSummary: z.string(),
  strategicDirectives: z.array(z.string()),
  riskVectors: z.array(z.string()),
  tacticalRoadmap: z.array(z.object({
    phase: z.string(),
    action: z.string(),
    timingWindow: z.string().optional(),
  })),
  rawFeedRef: z.string().uuid(),
  generatedAt: z.string().datetime(),
});

export type StrategicDiagnosticReport = z.infer<typeof StrategicDiagnosticReportSchema>;
