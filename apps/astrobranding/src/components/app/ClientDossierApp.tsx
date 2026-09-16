import React, { useState } from "react";

export function ClientDossierApp() {
  const [activeTab, setActiveTab] = useState<"natal" | "vocational" | "timing">("natal");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <header className="max-w-5xl mx-auto mb-10 pb-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Dossier Interactivo</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Tu Huella Arquetípica de Marca</h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-xl">
            Exploración vivencial y visual de tu configuración ontológica para alinear tu mensaje con tu verdad esencial.
          </p>
        </div>
        <div className="flex gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab("natal")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "natal" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Carta Natal
          </button>
          <button
            onClick={() => setActiveTab("vocational")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "vocational" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Vocación & Artha
          </button>
          <button
            onClick={() => setActiveTab("timing")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "timing" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Timing & Ciclos
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-200 mb-4">Mandala Arquetípico Vectorial</h2>
            <div className="aspect-square w-full max-w-md mx-auto relative flex items-center justify-center border border-dashed border-neutral-800 rounded-full p-4 bg-neutral-950/50">
              {/* SVG Wheel Placeholder */}
              <svg viewBox="0 0 300 300" className="w-full h-full animate-spin-slow">
                <circle cx="150" cy="150" r="140" fill="none" stroke="#312e81" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="100" fill="none" stroke="#4338ca" strokeWidth="1" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="#6366f1" strokeWidth="1" />
                <line x1="150" y1="10" x2="150" y2="290" stroke="#312e81" strokeWidth="1" />
                <line x1="10" y1="150" x2="290" y2="150" stroke="#312e81" strokeWidth="1" />
                <circle cx="150" cy="50" r="8" fill="#818cf8" />
                <circle cx="230" cy="190" r="6" fill="#a78bfa" />
                <circle cx="80" cy="200" r="7" fill="#f43f5e" />
              </svg>
              <div className="absolute text-center pointer-events-none">
                <span className="text-xs text-neutral-500 uppercase tracking-widest block">Ascendente</span>
                <span className="text-base font-bold text-indigo-300">Escorpio 14°</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-3">Claves de Posicionamiento</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Tu configuración activa una autoridad intuitiva y magnética. Las audiencias resuenan con tu capacidad de ver lo oculto y transformarlo en estructura concreta. Evita discursos superficiales; tu diferencial es la profundidad implacable y el rigor técnico.
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-4">Vectores Ontológicos</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Sol Tropical</span>
                <span className="font-semibold text-neutral-200">Acuario 22°</span>
              </li>
              <li className="flex justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Luna Sideral</span>
                <span className="font-semibold text-neutral-200">Rohini (Tauro)</span>
              </li>
              <li className="flex justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Diseño Humano</span>
                <span className="font-semibold text-neutral-200">Proyector 5/1</span>
              </li>
              <li className="flex justify-between py-2">
                <span className="text-neutral-400">BaZi Maestro Día</span>
                <span className="font-semibold text-neutral-200">Ren Fuego Yang</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 to-neutral-900 border border-indigo-900/40 rounded-xl p-6">
            <h4 className="font-semibold text-sm text-indigo-200">Doble Opt-In Activo</h4>
            <p className="text-xs text-neutral-400 mt-2">
              Tus reportes y análisis predictivos se actualizan automáticamente en tu canal de WhatsApp encriptado.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
