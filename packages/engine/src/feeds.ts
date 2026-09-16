import type { ClientDumps } from "@astrobranding/database";

export interface GeneratedFeed {
  feedType: "diag_a_psy" | "diag_b_voc" | "diag_c_mkt" | "diag_d_leg" | "diag_e_geo";
  xmlPayload: string;
  tokenEstimate: number;
}

function estimateTokens(str: string): number {
  return Math.ceil(str.length / 4);
}

/**
 * Feed 1: Diag-A Psicológico & Arquetípico
 * Tropical + Sideral + Aspectos mayores + Eje Nodal / Tikkun
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
  <tikkun sign="${kab.tikkun?.sign || ""}" mission="${kab.tikkun?.soulMission || ""}" inertia="${kab.tikkun?.karmicInertia || ""}"/>
</feed_diag_a_psy>`.trim();

  return {
    feedType: "diag_a_psy",
    xmlPayload: xml,
    tokenEstimate: estimateTokens(xml),
  };
}

/**
 * Feed 2: Diag-B Vocacional & Artha
 * Casas Artha (2/6/10), Dasamsa D10, BaZi Day Master, 10 Dioses del Dinero
 */
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

  return {
    feedType: "diag_b_voc",
    xmlPayload: xml,
    tokenEstimate: estimateTokens(xml),
  };
}

/**
 * Feed 3: Diag-C Timing & Lanzamientos Comerciales
 * Profecciones, Dashas, Time-Lords, Zodiacal Releasing
 */
export function generateFeedDiagCMkt(dumps: ClientDumps): GeneratedFeed {
  const dashas = dumps.shardVedicDashas as Record<string, any>;
  const pred = dumps.shardPredictiveElectional as Record<string, any>;

  const xml = `<feed_diag_c_mkt client="${dumps.clientId}">
  <vimshottari_current maha="${dashas.currentDasha?.maha || ""}" antar="${dashas.currentDasha?.antar || ""}" end="${dashas.currentDasha?.endDate || ""}"/>
  <election_windows count="${pred.recommendedElectionWindows?.length || 0}">
    ${(pred.recommendedElectionWindows || []).slice(0, 2).map((w: any) => `<window start="${w.startUtc}" score="${w.score}" suit="${w.suitability}"/>`).join("\n    ")}
  </election_windows>
</feed_diag_c_mkt>`.trim();

  return {
    feedType: "diag_c_mkt",
    xmlPayload: xml,
    tokenEstimate: estimateTokens(xml),
  };
}

/**
 * Feed 4: Diag-D Blindaje Legal & Alianzas
 * Casas de Conflicto (6/8/12), 36 Gunas Ashtakoota, Choques BaZi
 */
export function generateFeedDiagDLeg(dumps: ClientDumps): GeneratedFeed {
  const syn = dumps.shardPartnerSynastry as Record<string, any>;
  const bazi = dumps.shardBaziMetaphysics as Record<string, any>;

  const xml = `<feed_diag_d_leg client="${dumps.clientId}">
  <partnership_ashtakoota score="${syn.ashtakootaGunas?.totalScore || 0}" verdict="${syn.ashtakootaGunas?.verdict || "Standard"}"/>
  <bazi_synergy status="${syn.baziWuXingSynergy || "Neutral"}" dm="${bazi.dayMaster || ""}"/>
</feed_diag_d_leg>`.trim();

  return {
    feedType: "diag_d_leg",
    xmlPayload: xml,
    tokenEstimate: estimateTokens(xml),
  };
}

/**
 * Feed 5: Diag-E Astrocartografía & Ciudades de Poder
 * Líneas Angulares Mayores (MC/DSC), Cruces Parans, Espacio Local
 */
export function generateFeedDiagEGeo(dumps: ClientDumps): GeneratedFeed {
  const acg = dumps.shardAstrocartographyAcg as Record<string, any>;

  const xml = `<feed_diag_e_geo client="${dumps.clientId}">
  <major_lines>
    ${(acg.majorLines || []).slice(0, 4).map((l: any) => `<line planet="${l.planet}" type="${l.lineType}"/>`).join("\n    ")}
  </major_lines>
</feed_diag_e_geo>`.trim();

  return {
    feedType: "diag_e_geo",
    xmlPayload: xml,
    tokenEstimate: estimateTokens(xml),
  };
}

export function generateAllGoldFeeds(dumps: ClientDumps): GeneratedFeed[] {
  return [
    generateFeedDiagAPsy(dumps),
    generateFeedDiagBVoc(dumps),
    generateFeedDiagCMkt(dumps),
    generateFeedDiagDLeg(dumps),
    generateFeedDiagEGeo(dumps),
  ];
}
