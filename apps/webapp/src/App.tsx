import React, { useState, useEffect } from "react";

interface MeshStatus {
  status: string;
  mesh: {
    database: string;
    bifrost: string;
    freellmapi: string;
    evolution: string;
  };
}

export function App() {
  const [meshStatus, setMeshStatus] = useState<MeshStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cockpit" | "astrology" | "ai" | "whatsapp">("cockpit");

  useEffect(() => {
    fetch("/health")
      .then((res) => res.json())
      .then((data) => {
        setMeshStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", backgroundColor: "#161b22", borderRight: "1px solid #30363d", padding: "1.5rem 1rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#58a6ff", margin: "0 0 2rem 0" }}>AstroBranding</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("cockpit")}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              borderRadius: "6px",
              border: "none",
              background: activeTab === "cockpit" ? "#21262d" : "transparent",
              color: activeTab === "cockpit" ? "#fff" : "#8b949e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("astrology")}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              borderRadius: "6px",
              border: "none",
              background: activeTab === "astrology" ? "#21262d" : "transparent",
              color: activeTab === "astrology" ? "#fff" : "#8b949e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Diagnóstico Astrológico
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              borderRadius: "6px",
              border: "none",
              background: activeTab === "ai" ? "#21262d" : "transparent",
              color: activeTab === "ai" ? "#fff" : "#8b949e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Bifrost AI Mesh
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              borderRadius: "6px",
              border: "none",
              background: activeTab === "whatsapp" ? "#21262d" : "transparent",
              color: activeTab === "whatsapp" ? "#fff" : "#8b949e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            WhatsApp Gateway
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem" }}>
        <header style={{ marginBottom: "2rem", borderBottom: "1px solid #30363d", paddingBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Cockpit Soberano</h1>
          <p style={{ color: "#8b949e", margin: "0.5rem 0 0 0" }}>Control de Malla, Diagnósticos y Operaciones</p>
        </header>

        {activeTab === "cockpit" && (
          <div>
            <h3>Estado de la Malla en Zerops</h3>
            {loading ? (
              <p>Consultando liveness de servicios...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {meshStatus?.mesh ? (
                  Object.entries(meshStatus.mesh).map(([svc, st]) => (
                    <div key={svc} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1rem" }}>
                      <div style={{ color: "#8b949e", fontSize: "0.85rem", textTransform: "uppercase" }}>{svc}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: st === "healthy" || st === "connected" ? "#3fb950" : "#d29922", marginTop: "0.5rem" }}>
                        {st}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#8b949e" }}>Servidor local activo</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "astrology" && (
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.5rem" }}>
            <h3>Carta Natal y Posicionamiento de Marca</h3>
            <p style={{ color: "#8b949e" }}>Genera el mapa arquetípico para la estrategia de comunicación.</p>
          </div>
        )}

        {activeTab === "ai" && (
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.5rem" }}>
            <h3>Inferencia en Malla: Maxim AI Bifrost</h3>
            <p style={{ color: "#8b949e" }}>Enrutamiento CEL con failover automático a FreeLLMAPI.</p>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.5rem" }}>
            <h3>EvolutionGo Engine</h3>
            <p style={{ color: "#8b949e" }}>Disparo de OTP, double opt-in y webhooks desacoplados con NATS JetStream.</p>
          </div>
        )}
      </main>
    </div>
  );
}
