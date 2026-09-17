import React, { useState, useMemo } from "react";

// Perceptual APCA-inspired Lightness Contrast Score calculation
function calculateEstimatedLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const sRGB = [r, g, b].map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function calculateApcaContrast(textHex: string, bgHex: string): number {
  const yTxt = calculateEstimatedLuminance(textHex);
  const yBg = calculateEstimatedLuminance(bgHex);
  const deltaY = Math.abs(yBg - yTxt);
  // Simplified SAPc/APCA approximation: Lc = (deltaY ^ 0.56) * 100
  const score = Math.round(Math.pow(deltaY, 0.56) * 106);
  return Math.min(108, Math.max(0, score));
}

const COLOR_ECOSYSTEMS = [
  {
    id: "obsidian_gold",
    name: "Obsidian & Celestial Gold",
    bg: "#09090b",
    surface: "#18181b",
    accent: "#f59e0b",
    secondary: "#fbbf24",
    text: "#fafafa",
    muted: "#a1a1aa",
    archetype: "El Soberano / Liderazgo Solar",
  },
  {
    id: "emerald_alchemical",
    name: "Alchemical Emerald & Silver",
    bg: "#022c22",
    surface: "#064e3b",
    accent: "#10b981",
    secondary: "#34d399",
    text: "#f0fdf4",
    muted: "#6ee7b7",
    archetype: "El Sanador / Prosperidad Venusina",
  },
  {
    id: "deep_void_cyan",
    name: "Deep Void & Ethereal Cyan",
    bg: "#030712",
    surface: "#111827",
    accent: "#06b6d4",
    secondary: "#38bdf8",
    text: "#f9fafb",
    muted: "#9ca3af",
    archetype: "El Visionario / Urano & Mercurio",
  },
];

const SACRED_GEOMETRIES = [
  { id: "seed_of_life", name: "Seed of Life (Génesis)", circles: 7 },
  { id: "metatron_cube", name: "Metatron's Cube (Matriz)", circles: 13 },
  { id: "golden_spiral", name: "Golden Ratio Spiral (Phi)", circles: 5 },
  { id: "monogram_lockup", name: "Monogram Shield (Soberanía)", circles: 4 },
];

const TYPOGRAPHY_PAIRS = [
  { primary: "Cinzel / Cormorant", secondary: "Plus Jakarta Sans", mood: "Noble, Arquetípico, Alta Autoridad" },
  { primary: "Syne / Unbounded", secondary: "Inter", mood: "Vanguardista, Futurista, Web3" },
  { primary: "Cabinet Grotesk", secondary: "Space Grotesk", mood: "Sistemas, Arquitectura, Precisión" },
];

export function BrandStudioApp() {
  const [selectedEcosystem, setSelectedEcosystem] = useState(COLOR_ECOSYSTEMS[0]);
  const [selectedGeometry, setSelectedGeometry] = useState(SACRED_GEOMETRIES[0]);
  const [selectedPair, setSelectedPair] = useState(TYPOGRAPHY_PAIRS[0]);
  const [brandName, setBrandName] = useState("ASTROBRANDING");
  const [brandInitials, setBrandInitials] = useState("AB");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:5">("1:1");
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "tokens" | "apca" | "typography">("canvas");

  // APCA Score for Accent on Background
  const apcaScore = useMemo(() => {
    return calculateApcaContrast(selectedEcosystem.accent, selectedEcosystem.bg);
  }, [selectedEcosystem]);

  // W3C DTCG Token Specification Tree
  const dtcgTokensJson = useMemo(() => {
    return JSON.stringify(
      {
        $schema: "https://design-tokens.github.io/community-group/format/",
        brand: {
          name: { $value: brandName, $type: "string" },
          archetype: { $value: selectedEcosystem.archetype, $type: "string" },
        },
        color: {
          background: { $value: selectedEcosystem.bg, $type: "color" },
          surface: { $value: selectedEcosystem.surface, $type: "color" },
          accent: { $value: selectedEcosystem.accent, $type: "color" },
          secondary: { $value: selectedEcosystem.secondary, $type: "color" },
          text: { $value: selectedEcosystem.text, $type: "color" },
          muted: { $value: selectedEcosystem.muted, $type: "color" },
        },
        typography: {
          display: {
            fontFamily: { $value: selectedPair.primary, $type: "fontFamily" },
            lineHeight: { $value: "1.1", $type: "number" },
          },
          body: {
            fontFamily: { $value: selectedPair.secondary, $type: "fontFamily" },
            lineHeight: { $value: "1.5", $type: "number" },
          },
        },
        geometry: {
          symbol: { $value: selectedGeometry.id, $type: "string" },
          strokeWidth: { $value: `${strokeWidth}px`, $type: "dimension" },
          rotation: { $value: `${rotationAngle}deg`, $type: "angle" },
        },
      },
      null,
      2
    );
  }, [brandName, selectedEcosystem, selectedPair, selectedGeometry, strokeWidth, rotationAngle]);

  const handleDownloadTokens = () => {
    const blob = new Blob([dtcgTokensJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "_")}_dtcg_tokens.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      {/* Top Bar Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-neutral-950 font-black text-sm">
            {brandInitials.substring(0, 2)}
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">BRAND IDENTITY PREVIEW STUDIO</h1>
            <p className="text-xs text-neutral-400">Estudio Soberano de Geometría Sagrada, OKLCH & Tokens W3C DTCG</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/desk"
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-600 transition"
          >
            ← Volver a Gabinete
          </a>
          <a
            href="/fase0"
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-600 transition"
          >
            Fase 0 Dossier
          </a>
          <button
            onClick={handleDownloadTokens}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
          >
            Exportar Tokens DTCG (.json)
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Sidebar: Controls & Customization (4 cols) */}
        <aside className="lg:col-span-4 border-r border-neutral-800 bg-neutral-900/40 p-6 overflow-y-auto space-y-6">
          {/* Brand Identity Inputs */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Identidad de Marca</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value.toUpperCase())}
                placeholder="NOMBRE"
                className="col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="text"
                value={brandInitials}
                maxLength={3}
                onChange={(e) => setBrandInitials(e.target.value.toUpperCase())}
                placeholder="AB"
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Color Ecosystem Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ecosistema Cromático OKLCH</label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">3 Ecosistemas</span>
            </div>
            <div className="space-y-2">
              {COLOR_ECOSYSTEMS.map((eco) => (
                <button
                  key={eco.id}
                  onClick={() => setSelectedEcosystem(eco)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xs flex items-center justify-between ${
                    selectedEcosystem.id === eco.id
                      ? "border-amber-500 bg-amber-500/10 text-white"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{eco.name}</div>
                    <div className="text-[11px] text-neutral-400">{eco.archetype}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-700" style={{ backgroundColor: eco.bg }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: eco.accent }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: eco.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sacred Geometry Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Arquetipo Geométrico Sagrado</label>
            <div className="grid grid-cols-2 gap-2">
              {SACRED_GEOMETRIES.map((geo) => (
                <button
                  key={geo.id}
                  onClick={() => setSelectedGeometry(geo)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    selectedGeometry.id === geo.id
                      ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {geo.name}
                </button>
              ))}
            </div>
          </div>

          {/* Geometry Parameters */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Grosor de Trazo ({strokeWidth}px)</span>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="w-28 accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Rotación Armónica ({rotationAngle}°)</span>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(parseInt(e.target.value, 10))}
                className="w-28 accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Malla Áurea / Grid</span>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-1 rounded text-xs transition ${
                  showGrid ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {showGrid ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Typography Pairings */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Matriz Tipográfica</label>
            <div className="space-y-2">
              {TYPOGRAPHY_PAIRS.map((pair) => (
                <button
                  key={pair.primary}
                  onClick={() => setSelectedPair(pair)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                    selectedPair.primary === pair.primary
                      ? "border-amber-500 bg-amber-500/10 text-white"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="font-bold text-neutral-200">{pair.primary} + {pair.secondary}</div>
                  <div className="text-[10px] text-neutral-500">{pair.mood}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Area: Interactive Canvas & Inspector (8 cols) */}
        <main className="lg:col-span-8 flex flex-col bg-neutral-950 overflow-y-auto">
          {/* Mode Tabs */}
          <div className="border-b border-neutral-800 px-6 py-2 flex items-center gap-4 bg-neutral-900/30">
            <button
              onClick={() => setActiveTab("canvas")}
              className={`text-xs py-2 px-1 font-semibold border-b-2 transition ${
                activeTab === "canvas" ? "border-amber-500 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Canvas Interactivo
            </button>
            <button
              onClick={() => setActiveTab("apca")}
              className={`text-xs py-2 px-1 font-semibold border-b-2 transition ${
                activeTab === "apca" ? "border-amber-500 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Auditoría APCA (Lc {apcaScore})
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`text-xs py-2 px-1 font-semibold border-b-2 transition ${
                activeTab === "tokens" ? "border-amber-500 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Tokens DTCG W3C
            </button>
          </div>

          {/* Canvas View */}
          {activeTab === "canvas" && (
            <div
              className="flex-1 flex flex-col items-center justify-center p-8 transition-colors"
              style={{ backgroundColor: selectedEcosystem.bg }}
            >
              {/* Aspect Ratio Selector Controls */}
              <div className="mb-4 flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-full text-xs">
                <span className="text-neutral-500 font-mono">Aspecto:</span>
                {(["1:1", "16:9", "4:5"] as const).map((ar) => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={`px-2 py-0.5 rounded transition ${
                      aspectRatio === ar ? "bg-amber-500 text-neutral-950 font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>

              {/* The SVG Artwork */}
              <div
                className={`relative border border-neutral-800/80 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 transition-all overflow-hidden ${
                  aspectRatio === "1:1"
                    ? "w-80 h-80 sm:w-96 sm:h-96"
                    : aspectRatio === "16:9"
                    ? "w-full max-w-xl h-72 sm:h-80"
                    : "w-80 h-[400px]"
                }`}
                style={{ backgroundColor: selectedEcosystem.surface }}
              >
                {/* Background Grid Pattern */}
                {showGrid && (
                  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                    <defs>
                      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke={selectedEcosystem.accent} strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                )}

                {/* Generative Sacred Geometry Symbol */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-44 h-44 sm:w-52 sm:h-52 transition-transform duration-500"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  {/* Outer Sacred Boundary Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={selectedEcosystem.accent}
                    strokeWidth={strokeWidth}
                    opacity="0.8"
                  />

                  {/* Metatron or Seed of Life Geometry */}
                  {selectedGeometry.id === "seed_of_life" && (
                    <>
                      {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
                        const rad = (angle * Math.PI) / 180;
                        const cx = 100 + 44 * Math.cos(rad);
                        const cy = 100 + 44 * Math.sin(rad);
                        return (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="44"
                            fill="none"
                            stroke={selectedEcosystem.secondary}
                            strokeWidth={strokeWidth}
                            opacity="0.75"
                          />
                        );
                      })}
                      <circle
                        cx="100"
                        cy="100"
                        r="44"
                        fill="none"
                        stroke={selectedEcosystem.accent}
                        strokeWidth={strokeWidth}
                      />
                    </>
                  )}

                  {selectedGeometry.id === "golden_spiral" && (
                    <path
                      d="M 100,100 A 10,10 0 0,1 110,100 A 20,20 0 0,1 90,100 A 40,40 0 0,1 130,100 A 70,70 0 0,1 60,100"
                      fill="none"
                      stroke={selectedEcosystem.accent}
                      strokeWidth={strokeWidth + 1}
                    />
                  )}

                  {selectedGeometry.id === "monogram_lockup" && (
                    <>
                      <polygon
                        points="100,20 170,60 170,140 100,180 30,140 30,60"
                        fill="none"
                        stroke={selectedEcosystem.secondary}
                        strokeWidth={strokeWidth}
                      />
                      <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        fill={selectedEcosystem.accent}
                        fontSize="44"
                        fontWeight="bold"
                        fontFamily="Cinzel, serif"
                        letterSpacing="2"
                      >
                        {brandInitials}
                      </text>
                    </>
                  )}

                  {selectedGeometry.id === "metatron_cube" && (
                    <>
                      <circle cx="100" cy="100" r="30" fill="none" stroke={selectedEcosystem.accent} strokeWidth={strokeWidth} />
                      <polygon
                        points="100,25 165,137 35,137"
                        fill="none"
                        stroke={selectedEcosystem.secondary}
                        strokeWidth={strokeWidth}
                      />
                      <polygon
                        points="100,175 35,63 165,63"
                        fill="none"
                        stroke={selectedEcosystem.accent}
                        strokeWidth={strokeWidth}
                      />
                    </>
                  )}
                </svg>

                {/* Typography Lockup Label */}
                <div className="mt-4 text-center z-10">
                  <div
                    className="font-bold tracking-widest text-lg sm:text-xl transition-all"
                    style={{ color: selectedEcosystem.text, fontFamily: selectedPair.primary }}
                  >
                    {brandName}
                  </div>
                  <div
                    className="text-[10px] tracking-wider uppercase font-semibold mt-0.5"
                    style={{ color: selectedEcosystem.muted, fontFamily: selectedPair.secondary }}
                  >
                    {selectedEcosystem.archetype}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APCA Contrast Tab */}
          {activeTab === "apca" && (
            <div className="p-8 space-y-6 max-w-2xl">
              <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Advanced Perceptual Contrast Algorithm (APCA)</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      apcaScore >= 75
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : apcaScore >= 60
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    Lc {apcaScore} — {apcaScore >= 75 ? "Óptimo para Texto y Geometría" : "Aceptable"}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  A diferencia de WCAG 2.1 (que solo evalúa un ratio matemático plano de 4.5:1), APCA calcula la respuesta
                  neurológica del ojo humano a la luz percibida (SAPc). Garantiza legibilidad en fondos oscuros absolutos.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[11px] text-neutral-500">Color Acento (Primer Plano)</div>
                    <div className="text-sm font-mono font-bold mt-1" style={{ color: selectedEcosystem.accent }}>
                      {selectedEcosystem.accent}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[11px] text-neutral-500">Fondo Soberano</div>
                    <div className="text-sm font-mono font-bold mt-1 text-neutral-300">
                      {selectedEcosystem.bg}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tokens DTCG Tab */}
          {activeTab === "tokens" && (
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Árbol de Design Tokens (W3C DTCG Standard)</h3>
                  <p className="text-xs text-neutral-400">Tokens consumibles directamente por Style Dictionary v4 y Tailwind CSS v4</p>
                </div>
                <button
                  onClick={handleDownloadTokens}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Descargar JSON
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-300 overflow-x-auto max-h-[500px]">
                {dtcgTokensJson}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
