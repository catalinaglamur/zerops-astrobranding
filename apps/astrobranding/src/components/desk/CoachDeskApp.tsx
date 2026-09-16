import React, { useState } from "react";
import type { CoachStrategicProfile } from "@astrobranding/contracts";

const MOCK_PROFILE: CoachStrategicProfile = {
  id: "018d9f10-1234-7000-8000-000000000001",
  clientId: "018d9f10-1234-7000-8000-000000000002",
  fullName: "Consultante Estratégico Demo",
  cognitiveArchitecture: {
    reasoningMode: "inductive_intuitive",
    pacingSpeed: "rapid_synthesis",
    abstractionThreshold: "high_conceptual",
    notes: "Procesa mejor a partir de visiones holísticas antes de descender al detalle procedural. Si se le satura con pasos mecánicos se desconecta.",
  },
  nonSelfDefenses: [
    {
      defenseMechanism: "Sobreadaptación por complacencia",
      triggerPoint: "Pánico a la confrontación o a parecer inflexible",
      openCenterOrKarmicRoot: "Centro del Plexo Solar completamente abierto",
      manifestation: "Acepta condiciones comerciales desfavorables para evitar tensión relacional.",
    },
    {
      defenseMechanism: "Hiperintelectualización de la acción",
      triggerPoint: "Miedo a errar en el lanzamiento público",
      openCenterOrKarmicRoot: "Centro de la Cabeza/Ajna indefinido",
      manifestation: "Acumula certificaciones y pospone salir al mercado con su oferta principal.",
    },
  ],
  tacticalQuestions: [
    {
      objective: "Desarmar la justificación de falta de preparación",
      questionPrompt: "¿Qué evidencia factual te falta que no tengas ya resuelta con tu experiencia de los últimos 3 años?",
      expectedResistance: "Argumentará que necesita validar un nicho más seguro.",
      reframeStrategy: "Mostrarle que la seguridad es una ilusión de control de su mente condicionada.",
    },
  ],
  leveragePoints: [
    {
      domain: "sovereignty",
      coreDrive: "Autonomía de decisión sin rendir cuentas a mandos intermedios",
      transformationOffer: "Estructuración de firma boutique de consultoría con pricing de alto valor",
      urgencyFactor: "Agotamiento psicofísico acumulado en su empleo actual",
    },
  ],
  updatedAt: new Date().toISOString(),
};

export function CoachDeskApp() {
  const [profile] = useState<CoachStrategicProfile>(MOCK_PROFILE);
  const [activeSection, setActiveSection] = useState<"cognitive" | "defenses" | "questions" | "leverage">("cognitive");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-mono">
      <header className="max-w-6xl mx-auto mb-8 pb-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Cockpit Clínico del Coach (Privado)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-neutral-100">{profile.fullName}</h1>
          <p className="text-neutral-400 text-xs mt-1">
            Gabinete de decodificación ontológica, mapa de defensas y protocolo de facilitación 1:1.
          </p>
        </div>

        <div className="flex gap-1.5 bg-neutral-900 p-1 rounded-md border border-neutral-800">
          <button
            onClick={() => setActiveSection("cognitive")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeSection === "cognitive" ? "bg-neutral-800 text-emerald-300 border border-neutral-700" : "text-neutral-400"
            }`}
          >
            1. Arquitectura Cognitiva
          </button>
          <button
            onClick={() => setActiveSection("defenses")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeSection === "defenses" ? "bg-neutral-800 text-amber-300 border border-neutral-700" : "text-neutral-400"
            }`}
          >
            2. Mapeo de Defensas
          </button>
          <button
            onClick={() => setActiveSection("questions")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeSection === "questions" ? "bg-neutral-800 text-cyan-300 border border-neutral-700" : "text-neutral-400"
            }`}
          >
            3. Preguntas Tácticas
          </button>
          <button
            onClick={() => setActiveSection("leverage")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              activeSection === "leverage" ? "bg-neutral-800 text-rose-300 border border-neutral-700" : "text-neutral-400"
            }`}
          >
            4. Puntos de Apalancamiento
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {activeSection === "cognitive" && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
            <h2 className="text-sm uppercase tracking-wider text-emerald-400 font-bold">Patrón de Procesamiento del Consultante</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 uppercase block mb-1">Modo de Razonamiento</span>
                <span className="text-emerald-300 font-bold text-sm">{profile.cognitiveArchitecture.reasoningMode}</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 uppercase block mb-1">Velocidad de Pacing</span>
                <span className="text-emerald-300 font-bold text-sm">{profile.cognitiveArchitecture.pacingSpeed}</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 uppercase block mb-1">Umbral de Abstracción</span>
                <span className="text-emerald-300 font-bold text-sm">{profile.cognitiveArchitecture.abstractionThreshold}</span>
              </div>
            </div>
            <div className="p-4 bg-neutral-950/70 border-l-2 border-emerald-500 rounded text-xs text-neutral-300 leading-relaxed">
              <strong>Instrucción para el Mentor:</strong> {profile.cognitiveArchitecture.notes}
            </div>
          </section>
        )}

        {activeSection === "defenses" && (
          <section className="space-y-4">
            {profile.nonSelfDefenses.map((def, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Mecanismo #{idx + 1}: {def.defenseMechanism}</span>
                  <span className="text-xs bg-amber-950/60 text-amber-300 px-2.5 py-1 rounded border border-amber-800/40">
                    {def.openCenterOrKarmicRoot}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
                  <div className="bg-neutral-950 p-3 rounded border border-neutral-800/80">
                    <span className="text-neutral-500 block mb-1">Gatillo Detonante:</span>
                    <span className="text-neutral-200">{def.triggerPoint}</span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded border border-neutral-800/80">
                    <span className="text-neutral-500 block mb-1">Manifestación Física / Comercial:</span>
                    <span className="text-neutral-200">{def.manifestation}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeSection === "questions" && (
          <section className="space-y-4">
            {profile.tacticalQuestions.map((q, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Objetivo: {q.objective}</span>
                <blockquote className="text-sm font-semibold text-neutral-100 bg-neutral-950 p-4 rounded border-l-4 border-cyan-500">
                  "{q.questionPrompt}"
                </blockquote>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block mb-1">Resistencia Esperada:</span>
                    <p className="text-neutral-300">{q.expectedResistance}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Estrategia de Reencuadre:</span>
                    <p className="text-cyan-300">{q.reframeStrategy}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeSection === "leverage" && (
          <section className="space-y-4">
            {profile.leveragePoints.map((lev, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Dominio: {lev.domain}</span>
                  <span className="text-xs bg-rose-950/60 text-rose-300 px-2.5 py-1 rounded border border-rose-800/40">
                    Urgencia: {lev.urgencyFactor}
                  </span>
                </div>
                <p className="text-sm font-bold text-neutral-100">{lev.coreDrive}</p>
                <div className="bg-neutral-950 p-3 rounded text-xs border border-neutral-800">
                  <span className="text-neutral-500 block mb-1">Propuesta de Transformación de Alto Valor:</span>
                  <p className="text-rose-200">{lev.transformationOffer}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
