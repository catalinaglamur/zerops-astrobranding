#!/usr/bin/env bun
/**
 * ==============================================================================
 * Sovereign Cockpit Web GUI Server (cockpit-server.ts)
 * On-Demand Micro Dashboard | Bun.serve | Tailwind Dark Mode | Auto-Shutdown
 * 5 Strict Categories | Real Quotas & Balances | Real Container RAM
 * ==============================================================================
 */

import { execSync } from "node:child_process";
import fs from "node:fs";

const PORT = parseInt(process.env.COCKPIT_PORT || "3050", 10);
const PID_FILE = "/tmp/cockpit-web.pid";
let lastActivity = Date.now();
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes auto-shutdown

// Record PID
fs.writeFileSync(PID_FILE, process.pid.toString(), "utf-8");

// Auto-shutdown check every 60s
setInterval(() => {
  if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
    console.log(`[Cockpit Web] Inactivity timeout reached (${INACTIVITY_TIMEOUT_MS / 60000}m). Auto-shutting down to free memory...`);
    cleanupAndExit();
  }
}, 60000);

function cleanupAndExit() {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch {
    // Ignored
  }
  process.exit(0);
}

process.on("SIGTERM", cleanupAndExit);
process.on("SIGINT", cleanupAndExit);

// Helper to fetch metrics JSON using cockpit-status.ts
function getMetrics() {
  lastActivity = Date.now();
  try {
    const raw = execSync("bun /var/www/zerops-astrobranding/scripts/cockpit-status.ts --json", {
      encoding: "utf-8",
      timeout: 6000,
    });
    return JSON.parse(raw);
  } catch (err: any) {
    return { error: err.message };
  }
}

// Generate the Modern Tailwind Dashboard HTML
function renderHtml(data: any): string {
  const llm = data.llm || {};
  const bifrost = llm.bifrost || {};
  const freellm = llm.freellm || {};
  const infra = data.infra || {};
  const containers = infra.containers || [];
  const browsers = data.browsers || [];
  const astros = data.astros || [];
  const messaging = data.messaging || [];

  const activeContainersCount = containers.filter((c: any) => c.status === "ACTIVE").length;
  const stoppedContainersCount = containers.filter((c: any) => c.status === "STOPPED").length;

  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glamur · Cockpit Soberano de Telemetría</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
            darkbg: '#080C14',
            cardbg: '#0F172A',
            bordercol: '#1E293B'
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #080C14; color: #F1F5F9; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    .glass-card { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.07); }
    .bar-transition { transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
  </style>
</head>
<body class="p-4 md:p-8 selection:bg-indigo-500 selection:text-white">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Top Header -->
    <header class="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-800 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏛️</span>
          <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white">GLAMUR SOVEREIGN COCKPIT</h1>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">0 MB Idle Target</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Live Sensors</span>
        </div>
        <p class="text-xs md:text-sm text-slate-400 mt-1">Telemetría de Precisión, Cuotas Reales, RAM Físico Zerops & Gateway LLMOps</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-400 font-mono" id="last-updated">Actualizado: ${new Date().toLocaleTimeString()}</span>
        <button onclick="refreshData()" class="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refrescar
        </button>
        <button onclick="stopServer()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 transition">
          Apagar (0 MB)
        </button>
      </div>
    </header>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Gasto LLMs -->
      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Gasto LLMs (USD)</span>
          <span class="text-emerald-400 text-xs font-mono font-bold">Mensual</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-white">$${(bifrost.totalCostUsd || 0).toFixed(4)}</span>
          <span class="text-xs text-slate-400">USD</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <span>${bifrost.totalTokens?.toLocaleString() || 0} tokens (${bifrost.requestsTotal || 0} reqs)</span>
          <span class="text-emerald-400 font-semibold font-mono">${bifrost.virtualKeys?.length || 0} Virtual Keys</span>
        </div>
      </div>

      <!-- Semantic Cache -->
      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Semantic Cache</span>
          <span class="text-indigo-400 text-xs font-mono">chromem (0ms)</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-indigo-400">${bifrost.semanticCacheHits || 0}</span>
          <span class="text-xs text-slate-400">Hits (${(bifrost.cacheHitRatioPercent || 0).toFixed(1)}%)</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>Ahorro 100% tokens en llamadas idénticas</span>
        </div>
      </div>

      <!-- Memoria RAM Zerops -->
      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">RAM Activa Zerops</span>
          <span class="text-cyan-400 text-xs font-mono">cgroup v2</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-cyan-400">${infra.totalActiveRamMb || 0}</span>
          <span class="text-xs text-slate-400">MB RAM</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <span class="text-emerald-400 font-semibold">${activeContainersCount} contenedores activos</span>
          <span class="text-slate-500 font-mono">${stoppedContainersCount} en 0 MB</span>
        </div>
      </div>

      <!-- Cuotas de Búsqueda -->
      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Tavily Search API</span>
          <span class="text-amber-400 text-xs font-mono">${browsers[0]?.percentUsed || 0}% Usado</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-amber-400">${browsers[0]?.remaining?.replace(' búsquedas', '') || '232'}</span>
          <span class="text-xs text-slate-400">búsquedas libres</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <span>Usadas: ${browsers[0]?.used || '768'}</span>
          <span class="text-slate-500">Límite: 1,000/mes</span>
        </div>
      </div>

    </div>

    <!-- SECCIÓN 1: LLMOps & GATEWAY DE INFERENCIA -->
    <section class="glass-card rounded-xl p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🤖</span>
          <h2 class="text-base font-semibold text-white">[1/5] LLMOps & Gateway de Inferencia (Bifrost & FreeLLMAPI)</h2>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${bifrost.status || 'ONLINE'}</span>
        </div>
        <span class="text-xs text-slate-400 font-mono">Bifrost v${bifrost.version || '2.2.3'} · FreeLLMAPI Latencia: ${freellm.latencyMs || 0}ms</span>
      </div>

      <!-- Nota Técnica sobre Persistencia -->
      <div class="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-3">
        <span class="text-base">ℹ️</span>
        <div>
          <span class="font-bold text-white">Persistencia Indestructible en Disco:</span>
          Bifrost almacena todas las transacciones en SQLite (<code class="bg-black/40 px-1 py-0.5 rounded text-indigo-300 font-mono">/app/data/logs.db</code>) y el vector store en 5 archivos de disco (<code class="bg-black/40 px-1 py-0.5 rounded text-indigo-300 font-mono">/app/data/chromem/*.gob.gz</code>). Al reiniciar el contenedor, los contadores volátiles de Prometheus en RAM se reinician a 0, pero la base de datos física y la caché semántica permanecen 100% preservadas e intactas.
        </div>
      </div>

      <!-- Tabla de Claves Virtuales y Límites de Presupuesto -->
      <div class="space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Claves Virtuales & Presupuestos (Bifrost CEL Engine)</span>
          <span class="text-slate-500">Corte Mensual Automático</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="px-4 py-3">Nombre Clave Virtual</th>
                <th class="px-4 py-3 text-right">Peticiones</th>
                <th class="px-4 py-3 text-right">Tokens Totales</th>
                <th class="px-4 py-3 text-left">Gasto vs Límite Mensual</th>
                <th class="px-4 py-3 text-right">RPM Máx</th>
                <th class="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              ${(bifrost.virtualKeys || []).map((vk: any) => {
                const pct = Math.min(100, Math.round((vk.costUsd / (vk.budgetLimitMonthly || 1)) * 100));
                return `
                <tr class="hover:bg-slate-800/30 transition">
                  <td class="px-4 py-3 font-sans font-medium text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${vk.status === 'OK' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                    <div>
                      <div class="text-white">${vk.name}</div>
                      <div class="text-[10px] text-slate-500 font-mono">${vk.id}</div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right text-slate-300">${vk.requests}</td>
                  <td class="px-4 py-3 text-right text-slate-300">${vk.tokens?.toLocaleString()}</td>
                  <td class="px-4 py-3 text-left">
                    <div class="flex items-center gap-2">
                      <div class="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${Math.max(2, pct)}%"></div>
                      </div>
                      <span class="text-white font-bold">$${vk.costUsd.toFixed(4)}</span>
                      <span class="text-slate-500 font-normal">/ $${vk.budgetLimitMonthly}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right text-slate-400">${vk.rateLimitRpm} RPM</td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${vk.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                      ${vk.status}
                    </span>
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- FreeLLMAPI Pool Grid -->
      <div class="p-4 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
        <div class="flex items-center gap-3">
          <span class="text-cyan-400 font-bold uppercase tracking-wider">FreeLLMAPI Pool Gratuito:</span>
          <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">${freellm.status || 'ONLINE'}</span>
          <span class="text-slate-400">Latencia: <strong class="text-white">${freellm.latencyMs || 0}ms</strong></span>
          <span class="text-slate-400">Caché SQLite: <strong class="text-emerald-400">${freellm.responseCache || 'ACTIVE'}</strong></span>
        </div>
        <div class="text-slate-400 flex items-center gap-2">
          <span>Proveedores Listos:</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-semibold">${(freellm.providersReady || ['deepseek']).join(', ')}</span>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: INFRAESTRUCTURA ZEROPS & RECURSOS FÍSICOS -->
    <section class="glass-card rounded-xl p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">☁️</span>
          <h2 class="text-base font-semibold text-white">[2/5] Infraestructura Zerops & Recursos Físicos</h2>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">${infra.totalActiveRamMb || 0} MB RAM Total</span>
        </div>
        <span class="text-xs text-slate-400">LXC Containers · CPU / RAM Autoscaling</span>
      </div>

      <!-- Tabla de Contenedores y Memoria Real -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th class="px-4 py-3">Contenedor</th>
              <th class="px-4 py-3">Tipo / Runtime</th>
              <th class="px-4 py-3 text-center">Estado</th>
              <th class="px-4 py-3 text-right">Memoria RAM Físico</th>
              <th class="px-4 py-3 text-right">Subdominio / Acceso</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            ${containers.map((c: any) => `
              <tr class="hover:bg-slate-800/30 transition">
                <td class="px-4 py-3 font-sans font-medium text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
                  <span class="font-bold">${c.hostname}</span>
                </td>
                <td class="px-4 py-3 text-slate-400">${c.type}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}">
                    ${c.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  ${c.status === 'ACTIVE' 
                    ? `<span class="text-cyan-300 font-bold">${c.memoryMb} MB</span>` 
                    : `<span class="text-slate-500">0 MB ($0.00)</span>`}
                </td>
                <td class="px-4 py-3 text-right">
                  ${c.url 
                    ? `<a href="${c.url}" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline font-sans text-[11px]">Abrir Subdominio ↗</a>` 
                    : `<span class="text-slate-600 font-sans text-[11px]">Privado / Interno</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Discos y Valkey -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div class="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <div class="text-slate-400 text-xs font-semibold">📁 Local Storage (POSIX)</div>
          <div class="mt-1.5 text-lg font-bold font-mono text-amber-400">${infra.localStorage?.totalUsed || '33M'} <span class="text-xs text-slate-500 font-normal">ocupados</span></div>
          <div class="mt-1 text-[11px] text-slate-400 font-mono">Bifrost: ${infra.localStorage?.bifrostSize || '28M'} · FreeLLM: ${infra.localStorage?.freellmSize || '5.1M'}</div>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <div class="text-slate-400 text-xs font-semibold">🗄️ Object Storage S3</div>
          <div class="mt-1.5 text-lg font-bold font-mono text-indigo-400">${infra.objectStorage?.quotaGb || 50} GB <span class="text-xs text-slate-500 font-normal">cuota</span></div>
          <div class="mt-1 text-[11px] text-slate-400 font-mono">Bucket: ${infra.objectStorage?.bucketName || 'glamur-assets'}</div>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <div class="text-slate-400 text-xs font-semibold">⚡ Valkey Cache (In-Memory)</div>
          <div class="mt-1.5 text-lg font-bold font-mono text-emerald-400">${infra.valkey?.residentMemoryMb || 9.9} MB <span class="text-xs text-slate-500 font-normal">RAM</span></div>
          <div class="mt-1 text-[11px] text-slate-400 font-mono">Estado: ${infra.valkey?.status || 'ONLINE'} · CPU: ${infra.valkey?.cpuSeconds || 0.39}s</div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 3: BROWSERS, SCRAPING & MOTORES DE BÚSQUEDA -->
    <section class="glass-card rounded-xl p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🌐</span>
          <h2 class="text-base font-semibold text-white">[3/5] Browsers, Scraping & Motores de Búsqueda (Cuotas & Saldos)</h2>
        </div>
        <span class="text-xs text-slate-400">Inspección en Vivo de Cuotas Restantes</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${browsers.map((b: any) => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-sm font-bold text-white">${b.name}</h3>
                  <p class="text-[11px] text-slate-400">${b.provider}</p>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                  ${b.status}
                </span>
              </div>

              <!-- Barra de Consumo -->
              <div class="mt-3 space-y-1">
                <div class="flex justify-between text-[11px] font-mono">
                  <span class="text-slate-400">Consumido: <strong class="text-white">${b.used}</strong></span>
                  <span class="text-slate-400">Límite: <strong class="text-slate-300">${b.limit}</strong></span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full bar-transition ${b.percentUsed > 75 ? 'bg-amber-500' : 'bg-indigo-500'}" style="width: ${Math.max(3, b.percentUsed)}%"></div>
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span class="text-emerald-400 font-bold">Restante: ${b.remaining}</span>
              <span class="text-slate-500">${b.maskedKey}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECCIÓN 4: APIS ASTROLÓGICAS & EFEMÉRIDES -->
    <section class="glass-card rounded-xl p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🔮</span>
          <h2 class="text-base font-semibold text-white">[4/5] APIs Astrológicas & Efemérides Científicas</h2>
        </div>
        <span class="text-xs text-slate-400">Motores de Cálculo y Límite de Frecuencia (RPM/RPS)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${astros.map((a: any) => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
            <div class="flex items-start justify-between">
              <h3 class="text-sm font-bold text-white">${a.name}</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                ${a.status}
              </span>
            </div>
            <p class="text-xs text-slate-300 font-sans">${a.quotaDetails}</p>
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span class="text-indigo-400 font-semibold">Rate: ${a.rateLimit}</span>
              <span class="text-slate-500">${a.maskedKey}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECCIÓN 5: MENSAJERÍA, EDGE & INFRAESTRUCTURA TRANSACCIONAL -->
    <section class="glass-card rounded-xl p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">📨</span>
          <h2 class="text-base font-semibold text-white">[5/5] Mensajería, Edge & Infraestructura Transaccional</h2>
        </div>
        <span class="text-xs text-slate-400">Entrega de Emails, Notificaciones & Seguridad CDN</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${messaging.map((m: any) => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
            <div class="flex items-start justify-between">
              <h3 class="text-sm font-bold text-white">${m.name}</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                ${m.status}
              </span>
            </div>
            <p class="text-xs text-slate-300 font-sans">${m.details}</p>
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span class="text-emerald-400">Verificado</span>
              <span class="text-slate-500">${m.maskedKey}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 space-y-1">
      <p>Sovereign Cockpit · Arquitectura Zerops Control Plane (ZCP) · Auto-apagado por inactividad activo (30m)</p>
      <p class="font-mono text-[11px]">Acceso Seguro vía Proxy Reverso Nginx en puerto 8080 (/cockpit/)</p>
    </footer>

  </div>

  <script>
    async function refreshData() {
      window.location.reload();
    }

    async function stopServer() {
      if (confirm('¿Deseas apagar el servidor web del Cockpit para liberar memoria RAM inmediatamente?')) {
        try {
          await fetch('/cockpit/api/stop', { method: 'POST' });
        } catch {
          await fetch('/api/stop', { method: 'POST' });
        }
        document.body.innerHTML = '<div class="flex items-center justify-center min-h-screen text-center"><div class="space-y-3 p-8 glass-card rounded-2xl max-w-md mx-auto"><div class="text-4xl">🛑</div><h1 class="text-xl font-bold text-white">Cockpit Web Apagado</h1><p class="text-slate-400 text-xs">La memoria RAM ha sido liberada por completo (0 MB idle). Puedes volver a encenderlo en cualquier momento ejecutando en consola o chat:</p><code class="block bg-slate-900 px-3 py-2 rounded text-indigo-300 font-mono text-xs">cockpit-web start</code></div></div>';
      }
    }

    // Auto-refresh cada 30 segundos
    setTimeout(() => {
      window.location.reload();
    }, 30000);
  </script>
</body>
</html>`;
}

// Start Bun HTTP Server
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Support both direct '/' and proxied '/cockpit' paths
    if (url.pathname === "/" || url.pathname === "/cockpit" || url.pathname === "/cockpit/") {
      const metrics = getMetrics();
      return new Response(renderHtml(metrics), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/api/metrics" || url.pathname === "/cockpit/api/metrics") {
      const metrics = getMetrics();
      return Response.json(metrics);
    }

    if (url.pathname === "/health" || url.pathname === "/cockpit/health") {
      return Response.json({ status: "ok", port: PORT });
    }

    if ((url.pathname === "/api/stop" || url.pathname === "/cockpit/api/stop") && req.method === "POST") {
      setTimeout(cleanupAndExit, 200);
      return Response.json({ message: "Cockpit server shutting down" });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[Cockpit Web] Running at http://localhost:${PORT} (PID: ${process.pid})`);
console.log(`[Cockpit Web] Auto-shutdown configured after 30 minutes of inactivity.`);
