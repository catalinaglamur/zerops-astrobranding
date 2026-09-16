import { z } from "zod";

/**
 * CoachStrategicProfileSchema: SSoT schema for the Coach's Clinical & Strategic Cabinet (/desk)
 * Strict separation: This is for the mentor, NOT client roleplay.
 */
export const CoachStrategicProfileSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  fullName: z.string(),
  cognitiveArchitecture: z.object({
    reasoningMode: z.enum(["inductive_intuitive", "deductive_structured", "hybrid_dialectic"]),
    pacingSpeed: z.enum(["rapid_synthesis", "step_by_step", "reflective_deliberate"]),
    abstractionThreshold: z.enum(["high_conceptual", "practical_grounded", "metaphoric_symbolic"]),
    notes: z.string(),
  }),
  nonSelfDefenses: z.array(
    z.object({
      defenseMechanism: z.string(),
      triggerPoint: z.string(),
      openCenterOrKarmicRoot: z.string(),
      manifestation: z.string(),
    })
  ),
  tacticalQuestions: z.array(
    z.object({
      objective: z.string(),
      questionPrompt: z.string(),
      expectedResistance: z.string(),
      reframeStrategy: z.string(),
    })
  ),
  leveragePoints: z.array(
    z.object({
      domain: z.enum(["security", "sovereignty", "status", "transcendence"]),
      coreDrive: z.string(),
      transformationOffer: z.string(),
      urgencyFactor: z.string(),
    })
  ),
  updatedAt: z.string().datetime(),
});

export type CoachStrategicProfile = z.infer<typeof CoachStrategicProfileSchema>;
