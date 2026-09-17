import { z } from "zod";

/**
 * Complete Canonical Gold Feeds Projections (< 1.5 KB XML each)
 * 1. Fases 1 a 9: Reporte Básico del Cliente (SSoT /var/www/.agents/skills/oraculo/references/phases.md)
 * 2. Fase 10: Dashboard Privado del Coach (/desk)
 * 3. Fase 11: AstroBranding Semiótico (Puente hacia Orchesbrand)
 * 4. Diag A-E: Reportes Avanzados de Profundización
 */
export const GoldFeedTypeSchema = z.enum([
  // Autor y Constitución Ontológica (Fase 0)
  "fase_0_author", // Constitución Ontológica del Autor y Gabinete Clínico
  // Reporte Básico del Cliente (Fases 1 a 9)
  "fase_1_num", // Numerología Pitagórica & Identidad de Marca
  "fase_2_occ", // Astrología Occidental Tropical (Placidus)
  "fase_3_sid", // Astrología Sideral Occidental (Fagan-Bradley)
  "fase_4_ved", // Astrología Védica (Jyotish)
  "fase_5_bazi", // Metafísica China BaZi (Cuatro Pilares)
  "fase_6_kab", // Kabbalah Kármica & Tikkun de Rav Berg
  "fase_7_voc", // Clímax Vocacional & Autoridad Comercial
  "fase_8_time", // Expansión del Tiempo en Presente Continuo (T0)
  "fase_9_end", // Cierre Estratégico & Menú de Profundización
  // Coach & Branding Especializados
  "fase_10_coach", // Dashboard Privado del Coach (Estrategia, Objeciones y Facilitación 1:1)
  "fase_11_semiotics", // AstroBranding Semiótico (Directivas de Arquetipo para Orchesbrand)
  // Reportes Avanzados de Profundización (Upsells / Sub-Oráculos)
  "diag_a_psy", // Diagnóstico Psicológico Profundo & Dinámica de Sombras
  "diag_b_voc", // Ingeniería Vocacional de Élite & Dasamsa D-10
  "diag_c_mkt", // Timing Estratégico de Mercado & Elecciones Comerciales
  "diag_d_leg", // Blindaje Legal Corporativo & Protección Patrimonial
  "diag_e_geo", // Mapeo Astrocartográfico & Ciudades de Prosperidad
]);

export type GoldFeedType = z.infer<typeof GoldFeedTypeSchema>;

export const GoldFeedRecordSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  feedType: GoldFeedTypeSchema,
  xmlPayload: z.string().max(4000), // Enforced ultra-compact size
  tokenEstimate: z.number().int().max(800), // Maximum tokens
  createdAt: z.string().datetime(),
});

export type GoldFeedRecord = z.infer<typeof GoldFeedRecordSchema>;
