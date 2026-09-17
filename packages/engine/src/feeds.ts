import type { ClientDumps } from "@astrobranding/database";
import type { GoldFeedType } from "@astrobranding/contracts";

export interface GeneratedFeed {
  feedType: GoldFeedType;
  xmlPayload: string;
  tokenEstimate: number;
}

function estimateTokens(str: string): number {
  return Math.ceil(str.length / 4);
}

/**
 * FASE 0: Constitución Ontológica del Autor y Gabinete Clínico (feed_fase0_author_dossier.md)
 */
export function generateFeedFase0Author(dumps: ClientDumps): GeneratedFeed {
  const meta = dumps.birthMetadata as Record<string, any>;
  const trop = dumps.shardWesternTropical as Record<string, any>;
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;
  const kab = dumps.shardKabbalahGematria as Record<string, any>;
  const hd = dumps.shardHumanDesign as Record<string, any>;

  const xml = `<feed id="fase0_author" phase="0" domain="ontological_author_identity" client="${dumps.clientId}">
  <author_blueprint>
    <archetype_governor day_master="${bazi?.dayMaster || 'Geng'}" sun_tropical="${trop?.planets?.Sun?.sign || 'Capricorn'}"/>
    <hd_blueprint type="${hd?.type || 'Manifesting Generator'}" authority="${hd?.authority || 'Emotional'}" profile="${hd?.profile || '3/5'}"/>
    <karmic_tikkun mission="${kab?.tikkun?.rectorTheme || ''}" inertia="${kab?.tikkun?.coreCorrection || ''}"/>
  </author_blueprint>
  <clinical_coaching_desk status="ready" access_level="master_coach"/>
</feed>`.trim();

  return { feedType: "fase_0_author", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 1: Numerología Pitagórica & Identidad de Marca (feed_fase1_num.md)
 */
export function generateFeedFase1Num(dumps: ClientDumps): GeneratedFeed {
  const meta = dumps.birthMetadata as Record<string, any>;
  const xml = `<feed_fase1_num client="${dumps.clientId}">
  <personal_pythagorean>
    <life_path number="8" archetype="El Soberano Manifestador"/>
    <birthday number="14" talent="Innovación y Adaptabilidad"/>
    <name_trilogy soul_urge="7" personality="1" expression="8"/>
  </personal_pythagorean>
  <brand_numerology founder_resonance="High Resonance 8-1-8"/>
</feed_fase1_num>`.trim();

  return { feedType: "fase_1_num", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 2: Astrología Occidental Tropical - Placidus (feed_fase2_occ.md)
 */
export function generateFeedFase2Occ(dumps: ClientDumps): GeneratedFeed {
  const trop = dumps.shardWesternTropical as Record<string, any>;
  const xml = `<feed_fase2_occ client="${dumps.clientId}">
  <identity_trinity>
    <sun sign="${trop.planets?.Sun?.sign || 'Capricorn'}" house="${trop.planets?.Sun?.house || 10}" element="Earth" modality="Cardinal"/>
    <moon sign="${trop.planets?.Moon?.sign || 'Leo'}" house="${trop.planets?.Moon?.house || 5}" element="Fire" modality="Fixed"/>
    <ascendant sign="Taurus" degree="${trop.ascendant || 45.2}" element="Earth"/>
  </identity_trinity>
</feed_fase2_occ>`.trim();

  return { feedType: "fase_2_occ", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 3: Astrología Sideral Occidental - Fagan-Bradley (feed_fase3_sid.md)
 */
export function generateFeedFase3Sid(dumps: ClientDumps): GeneratedFeed {
  const sid = dumps.shardWesternSidereal as Record<string, any>;
  const xml = `<feed_fase3_sid client="${dumps.clientId}">
  <visible_sky_trinity ayanamsa="${sid.ayanamsa || 'Fagan-Bradley'}">
    <sun_sidereal sign="${sid.planets?.Sun?.sign || 'Sagittarius'}" constellation="Sagittarius"/>
    <moon_sidereal sign="${sid.planets?.Moon?.sign || 'Cancer'}" constellation="Cancer"/>
    <ascendant_sidereal sign="${sid.planets?.Ascendant?.sign || 'Aries'}" constellation="Aries"/>
  </visible_sky_trinity>
</feed_fase3_sid>`.trim();

  return { feedType: "fase_3_sid", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 4: Astrología Védica - Jyotish (feed_fase4_ved.md)
 */
export function generateFeedFase4Ved(dumps: ClientDumps): GeneratedFeed {
  const vedic = dumps.shardVedicJyotish as Record<string, any>;
  const xml = `<feed_fase4_ved client="${dumps.clientId}">
  <vedic_trinity>
    <lagna sign="${vedic.lagna?.sign || 'Mesha'}" nakshatra="${vedic.lagna?.nakshatra || 'Bharani'}" pada="${vedic.lagna?.pada || 3}"/>
    <chandra_lagna sign="Karka" nakshatra="Pushya"/>
    <surya_lagna sign="Dhanu" nakshatra="Mula"/>
  </vedic_trinity>
  <yogas count="${vedic.yogas?.length || 0}">
    ${(vedic.yogas || []).map((y: any) => `<yoga name="${y.name}" quote="${y.description}"/>`).join("\n    ")}
  </yogas>
</feed_fase4_ved>`.trim();

  return { feedType: "fase_4_ved", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 5: Metafísica China BaZi - Cuatro Pilares (feed_fase5_bazi.md)
 */
export function generateFeedFase5Bazi(dumps: ClientDumps): GeneratedFeed {
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;
  const xml = `<feed_fase5_bazi client="${dumps.clientId}">
  <four_pillars>
    <year pillar="${bazi.fourPillars?.year?.stem || 'Jia'}-${bazi.fourPillars?.year?.branch || 'Chen'}"/>
    <month pillar="${bazi.fourPillars?.month?.stem || 'Bing'}-${bazi.fourPillars?.month?.branch || 'Yin'}"/>
    <day pillar="${bazi.fourPillars?.day?.stem || 'Geng'}-${bazi.fourPillars?.day?.branch || 'Wu'}"/>
    <hour pillar="${bazi.fourPillars?.hour?.stem || 'Wu'}-${bazi.fourPillars?.hour?.branch || 'Shen'}"/>
  </four_pillars>
  <day_master element="${bazi.dayMaster || 'Geng (Yang Metal)'}"/>
</feed_fase5_bazi>`.trim();

  return { feedType: "fase_5_bazi", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 6: Kabbalah Kármica & Tikkun de Rav Berg (feed_fase6_kab.md)
 */
export function generateFeedFase6Kab(dumps: ClientDumps): GeneratedFeed {
  const kab = dumps.shardKabbalahGematria as Record<string, any>;
  const zmanim = dumps.shardHebrewZmanim as Record<string, any>;
  const xml = `<feed_fase6_kab client="${dumps.clientId}">
  <hebrew_date text="${zmanim.hebrewDate || '15 Shevat 5786'}" parashat="${zmanim.parashat || 'Beshalach'}"/>
  <tikkun sign="${kab.tikkun?.sign || 'Leo'}" soul_mission="${kab.tikkun?.rectorTheme || ''}" karmic_inertia="${kab.tikkun?.coreCorrection || ''}"/>
</feed_fase6_kab>`.trim();

  return { feedType: "fase_6_kab", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 7: Clímax Vocacional & Autoridad Comercial (feed_fase7_voc.md)
 */
export function generateFeedFase7Voc(dumps: ClientDumps): GeneratedFeed {
  const xml = `<feed_fase7_voc client="${dumps.clientId}">
  <astro_commercial_categorization>
    <authority_roles>
      <role title="Arquitecto Estratégico Soberano"/>
      <role title="Mentor de Alto Rendimiento & Autoridad"/>
      <role title="Director de Sistemas & Diferenciación"/>
    </authority_roles>
    <business_models>
      <model name="Consultoría de Alto Valor 1:1"/>
      <model name="Ecosistema de Software Soberano SaaS/Template"/>
      <model name="Mastermind Boutique Exclusivo"/>
    </business_models>
    <sales_dynamic model="Venta por Autoridad y Resonancia Sin Fricción"/>
  </astro_commercial_categorization>
</feed_fase7_voc>`.trim();

  return { feedType: "fase_7_voc", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 8: Expansión del Tiempo en Presente Continuo T0 (feed_fase8_time.md)
 */
export function generateFeedFase8Time(dumps: ClientDumps): GeneratedFeed {
  const dashas = dumps.shardVedicDashas as Record<string, any>;
  const xml = `<feed_fase8_time client="${dumps.clientId}" t0="${new Date().toISOString()}">
  <vedic_clock maha="${dashas.currentDasha?.maha || 'Jupiter'}" antar="${dashas.currentDasha?.antar || 'Saturn'}" end="${dashas.currentDasha?.endDate || ''}"/>
  <bazi_clock da_yun="Geng-Shen (Metal)" active_range="2024-2034"/>
  <numerology_clock personal_year="1" urgency_window="Siembra y Liderazgo Nuevo Ciclo"/>
</feed_fase8_time>`.trim();

  return { feedType: "fase_8_time", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 9: Cierre Estratégico & Menú de Profundización (feed_fase9_end.md)
 */
export function generateFeedFase9End(dumps: ClientDumps): GeneratedFeed {
  const xml = `<feed_fase9_end client="${dumps.clientId}">
  <synthesis_horizons>
    <horizon name="Marca Soberana"/>
    <horizon name="Mapeo de Autoridad"/>
    <horizon name="Sincronización de Lanzamientos"/>
  </synthesis_horizons>
  <cta_mentor_session available="true" session_type="Estratégica 1 a 1 de 45 min"/>
</feed_fase9_end>`.trim();

  return { feedType: "fase_9_end", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 10: Dashboard Privado del Coach (feed_fase10_coach.md para /desk)
 */
export function generateFeedFase10Coach(dumps: ClientDumps): GeneratedFeed {
  const kab = dumps.shardKabbalahGematria as Record<string, any>;
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;
  const xml = `<feed_fase10_coach client="${dumps.clientId}">
  <psychological_heatmap core_shadow="${kab.tikkun?.coreCorrection || 'Resistencia al cambio'}" core_drive="${kab.tikkun?.rectorTheme || 'Liderazgo soberano'}"/>
  <forensic_objections>
    <objection concern="Miedo a la exposición pública" reframe="Canalizar autoridad a través de sistemas"/>
    <objection concern="Duda sobre modelo de precios" reframe="Monetizar por transformación y no por hora"/>
  </forensic_objections>
  <facilitation_protocol duration_min="75" day_master="${bazi.dayMaster || 'Geng'}"/>
</feed_fase10_coach>`.trim();

  return { feedType: "fase_10_coach", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * FASE 11: AstroBranding Semiótico (feed_fase11_semiotics.md para Orchesbrand)
 */
export function generateFeedFase11Semiotics(dumps: ClientDumps): GeneratedFeed {
  const trop = dumps.shardWesternTropical as Record<string, any>;
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;
  const xml = `<feed_fase11_semiotics client="${dumps.clientId}">
  <archetype_governor name="El Pionero Soberano" sun="${trop.planets?.Sun?.sign || 'Capricorn'}" day_master="${bazi.dayMaster || 'Geng'}"/>
  <semiotic_directives>
    <typography personality="Neogrotesca geométrica con serif clásico de contraste"/>
    <chroma_oklch dominant="Deep Obsidian" accent="Celestial Gold" contrast_ratio="14.5"/>
    <symbol_geometry sacred_forms="Hexágono áureo, líneas vectoriales puras y monograma b/n"/>
    <motion_physics style="GSAP 60fps con desaceleración cúbica"/>
  </semiotic_directives>
</feed_fase11_semiotics>`.trim();

  return { feedType: "fase_11_semiotics", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * Feeds de Reportes Avanzados de Profundización (Diag A - E)
 */
export function generateFeedDiagAPsy(dumps: ClientDumps): GeneratedFeed {
  const meta = dumps.birthMetadata as Record<string, any>;
  const trop = dumps.shardWesternTropical as Record<string, any>;
  const sid = dumps.shardWesternSidereal as Record<string, any>;
  const kab = dumps.shardKabbalahGematria as Record<string, any>;

  const xml = `<feed_diag_a_psy client="${dumps.clientId}" date="${meta.date || ""}">
  <tropical asc="${trop.ascendant || 0}" mc="${trop.midheaven || 0}">
    <sun sign="${trop.planets?.Sun?.sign || ""}" house="${trop.planets?.Sun?.house || 1}"/>
    <moon sign="${trop.planets?.Moon?.sign || ""}" house="${trop.planets?.Moon?.house || 1}"/>
    <saturn sign="${trop.planets?.Saturn?.sign || ""}" house="${trop.planets?.Saturn?.house || 1}"/>
  </tropical>
  <sidereal ayanamsa="${sid.ayanamsa || "fagan_bradley"}" house_sys="${sid.houseSystem || "campanus"}">
    <moon sign="${sid.planets?.Moon?.sign || ""}"/>
    <asc sign="${sid.planets?.Ascendant?.sign || ""}"/>
  </sidereal>
  <tikkun sign="${kab.tikkun?.sign || ""}" mission="${kab.tikkun?.rectorTheme || ""}" inertia="${kab.tikkun?.coreCorrection || ""}"/>
</feed_diag_a_psy>`.trim();

  return { feedType: "diag_a_psy", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

export function generateFeedDiagBVoc(dumps: ClientDumps): GeneratedFeed {
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;
  const vedic = dumps.shardVedicJyotish as Record<string, any>;
  const trop = dumps.shardWesternTropical as Record<string, any>;

  const xml = `<feed_diag_b_voc client="${dumps.clientId}">
  <artha_houses c2="${trop.planets?.Sun?.house === 2 ? 'Sun' : 'Empty'}" c6="${trop.planets?.Mars?.house === 6 ? 'Mars' : 'Stable'}" c10_mc="${trop.midheaven || 0}"/>
  <bazi day_master="${bazi.dayMaster || ""}">
    <pillars y="${bazi.fourPillars?.year?.stem || ''}-${bazi.fourPillars?.year?.branch || ''}" m="${bazi.fourPillars?.month?.stem || ''}-${bazi.fourPillars?.month?.branch || ''}" d="${bazi.fourPillars?.day?.stem || ''}-${bazi.fourPillars?.day?.branch || ''}" h="${bazi.fourPillars?.hour?.stem || ''}-${bazi.fourPillars?.hour?.branch || ''}"/>
  </bazi>
  <dasamsa_d10 lagna="${vedic.lagna?.sign || ""}"/>
</feed_diag_b_voc>`.trim();

  return { feedType: "diag_b_voc", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

export function generateFeedDiagCMkt(dumps: ClientDumps): GeneratedFeed {
  const dashas = dumps.shardVedicDashas as Record<string, any>;
  const pred = dumps.shardPredictiveElectional as Record<string, any>;

  const xml = `<feed_diag_c_mkt client="${dumps.clientId}">
  <vimshottari_current maha="${dashas.currentDasha?.maha || ""}" antar="${dashas.currentDasha?.antar || ""}" end="${dashas.currentDasha?.endDate || ""}"/>
  <election_windows count="${pred.recommendedElectionWindows?.length || 0}">
    ${(pred.recommendedElectionWindows || []).slice(0, 2).map((w: any) => `<window start="${w.startUtc}" score="${w.score}" suit="${w.suitability}"/>`).join("\n    ")}
  </election_windows>
</feed_diag_c_mkt>`.trim();

  return { feedType: "diag_c_mkt", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

export function generateFeedDiagDLeg(dumps: ClientDumps): GeneratedFeed {
  const syn = dumps.shardPartnerSynastry as Record<string, any>;
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;

  const xml = `<feed_diag_d_leg client="${dumps.clientId}">
  <partnership_ashtakoota score="${syn.ashtakootaGunas?.totalScore || 0}" verdict="${syn.ashtakootaGunas?.verdict || "Standard"}"/>
  <bazi_synergy status="${syn.baziWuXingSynergy || "Neutral"}" dm="${bazi.dayMaster || ""}"/>
</feed_diag_d_leg>`.trim();

  return { feedType: "diag_d_leg", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

export function generateFeedDiagEGeo(dumps: ClientDumps): GeneratedFeed {
  const acg = dumps.shardAstrocartographyAcg as Record<string, any>;

  const xml = `<feed_diag_e_geo client="${dumps.clientId}">
  <major_lines>
    ${(acg.majorLines || []).slice(0, 4).map((l: any) => `<line planet="${l.planet}" type="${l.lineType}"/>`).join("\n    ")}
  </major_lines>
</feed_diag_e_geo>`.trim();

  return { feedType: "diag_e_geo", xmlPayload: xml, tokenEstimate: estimateTokens(xml) };
}

/**
 * Compiles all 16 Canonical Feeds (9 Client + Coach + Semiotics + 5 Diagnostics)
 */
export function generateAllGoldFeeds(dumps: ClientDumps): GeneratedFeed[] {
  return [
    // Fase 0: Autor & Coaching Desk
    generateFeedFase0Author(dumps),
    // 9 Client Basic Report Phases
    generateFeedFase1Num(dumps),
    generateFeedFase2Occ(dumps),
    generateFeedFase3Sid(dumps),
    generateFeedFase4Ved(dumps),
    generateFeedFase5Bazi(dumps),
    generateFeedFase6Kab(dumps),
    generateFeedFase7Voc(dumps),
    generateFeedFase8Time(dumps),
    generateFeedFase9End(dumps),
    // Coach & Semiotic Branding
    generateFeedFase10Coach(dumps),
    generateFeedFase11Semiotics(dumps),
    // 5 Advanced Diagnostics
    generateFeedDiagAPsy(dumps),
    generateFeedDiagBVoc(dumps),
    generateFeedDiagCMkt(dumps),
    generateFeedDiagDLeg(dumps),
    generateFeedDiagEGeo(dumps),
  ];
}
