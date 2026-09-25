#!/usr/bin/env bun
/**
 * ==============================================================================
 * Sovereign Cockpit Web GUI Server (cockpit-server.ts)
 * On-Demand Micro Dashboard | Bun.serve | Tailwind Dark Mode | Auto-Shutdown
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
      timeout: 3000,
    });
    return JSON.parse(raw);
  } catch (err: any) {
    return { error: err.message };
  }
}

// Generate the Modern Tailwind Dashboard HTML
function renderHtml(metrics: any): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glamur · Sovereign Cockpit</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
            darkbg: '#0B0F19',
            cardbg: '#111827',
            bordercol: '#1F2937'
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #0B0F19; color: #F3F4F6; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="p-4 md:p-8 font-sans antialiased selection:bg-indigo-500 selection:text-white">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Top Header -->
    <header class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-800 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏛️</span>
          <h1 class="text-2xl font-bold tracking-tight text-white">GLAMUR SOVEREIGN COCKPIT</h1>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live Sensor</span>
        </div>
        <p class="text-sm text-gray-400 mt-1">Autonomous Telemetry, Virtual-Keys, Budget Caps & Zerops Infrastructure</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500 font-mono" id="last-updated">Updated: ${new Date().toLocaleTimeString()}</span>
        <button onclick="refreshData()" class="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh
        </button>
        <button onclick="stopServer()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-red-950/40 text-gray-300 hover:text-red-400 border border-gray-700 transition">
          Turn Off
        </button>
      </div>
    </header>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-gray-400">Total Spend (USD)</span>
          <span class="text-emerald-400 text-xs font-mono font-bold">Monthly</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-white">$${(metrics.bifrost?.totalCostUsd || 0).toFixed(4)}</span>
          <span class="text-xs text-gray-400">USD</span>
        </div>
        <div class="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Active Virtual Keys: ${metrics.bifrost?.virtualKeys?.length || 0}
        </div>
      </div>

      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-gray-400">Semantic Cache</span>
          <span class="text-indigo-400 text-xs font-mono">chromem</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-indigo-400">${metrics.bifrost?.semanticCacheHits || 0}</span>
          <span class="text-xs text-gray-400">Hits (${(metrics.bifrost?.cacheHitRatioPercent || 0).toFixed(1)}%)</span>
        </div>
        <div class="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span> In-process 0ms Latency
        </div>
      </div>

      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-gray-400">FreeLLMAPI Pool</span>
          <span class="text-cyan-400 text-xs font-mono">${metrics.freellm?.latencyMs || 0}ms</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-cyan-400">${metrics.freellm?.pooledKeysCount || 0}</span>
          <span class="text-xs text-gray-400">Keys pooled</span>
        </div>
        <div class="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span> Response Cache: SQLite
        </div>
      </div>

      <div class="glass-card rounded-xl p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-gray-400">Local Storage</span>
          <span class="text-amber-400 text-xs font-mono">POSIX</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold font-mono text-amber-400">${metrics.infra?.localStorage?.totalUsed || '0M'}</span>
          <span class="text-xs text-gray-400">Disk Used</span>
        </div>
        <div class="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span> Object Storage: ${metrics.infra?.objectStorage?.quotaGb || 50} GB
        </div>
      </div>
    </div>

    <!-- Main Grid: Virtual Keys & Zerops Runtimes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Virtual-Keys Table (2 cols) -->
      <div class="glass-card rounded-xl p-6 lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <span>🔑</span> Virtual-Keys & Budget Caps Matrix
          </h2>
          <span class="text-xs text-gray-400">Enforced by Bifrost Core</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-xs uppercase bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th class="px-4 py-3">Virtual-Key</th>
                <th class="px-4 py-3 text-right">Requests</th>
                <th class="px-4 py-3 text-right">Tokens</th>
                <th class="px-4 py-3 text-right">Spend / Cap</th>
                <th class="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60 font-mono text-xs">
              ${(metrics.bifrost?.virtualKeys || []).map((vk: any) => `
                <tr class="hover:bg-gray-800/30 transition">
                  <td class="px-4 py-3 font-sans font-medium text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${vk.status === 'OK' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                    ${vk.name}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-300">${vk.requests}</td>
                  <td class="px-4 py-3 text-right text-gray-300">${vk.tokens.toLocaleString()}</td>
                  <td class="px-4 py-3 text-right text-white font-bold">$${vk.costUsd.toFixed(4)} <span class="text-gray-500 font-normal">/ $${vk.budgetLimitMonthly}</span></td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${vk.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                      ${vk.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Zerops Services Status (1 col) -->
      <div class="glass-card rounded-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <span>☁️</span> Zerops Runtimes
          </h2>
          <span class="text-xs text-gray-400">Project Glamur</span>
        </div>
        <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          ${(metrics.infra?.services || []).map((s: any) => `
            <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-800/80 flex items-center justify-between text-xs">
              <div>
                <div class="font-medium text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}"></span>
                  ${s.hostname}
                </div>
                <div class="text-[11px] text-gray-400 font-mono mt-0.5">${s.type}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}">
                ${s.status}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- External & Astrological APIs Grid -->
    <div class="glass-card rounded-xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span>🔮</span> External & Astrological APIs (glamur-keys.md)
        </h2>
        <span class="text-xs text-gray-400">Zero Credential Exposure Standard</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        ${(metrics.apis || []).map((a: any) => `
          <div class="p-3 rounded-lg bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between">
            <div class="flex items-start justify-between">
              <span class="text-xs font-medium text-white">${a.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono ${a.configured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                ${a.configured ? 'ACTIVE' : 'MISSING'}
              </span>
            </div>
            <div class="mt-2 text-[11px] text-gray-500 font-mono truncate">${a.maskedKey}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer -->
    <footer class="pt-6 border-t border-gray-800/60 text-center text-xs text-gray-500">
      <p>Sovereign Cockpit · Zerops Control Plane Engine · Auto-shutdown active (30m idle threshold)</p>
    </footer>

  </div>

  <script>
    async function refreshData() {
      window.location.reload();
    }

    async function stopServer() {
      if (confirm('¿Deseas apagar el servidor web del Cockpit para liberar memoria RAM?')) {
        await fetch('/api/stop', { method: 'POST' });
        document.body.innerHTML = '<div class="flex items-center justify-center min-h-screen text-center"><div class="space-y-2"><h1 class="text-2xl font-bold text-white">Cockpit Web Apagado</h1><p class="text-gray-400 text-sm">La memoria RAM ha sido liberada (0 MB idle). Puedes volver a encenderlo con: <code>cockpit-web start</code>.</p></div></div>';
      }
    }

    setTimeout(() => {
      window.location.reload();
    }, 15000);
  </script>
</body>
</html>`;
}

// Start Bun HTTP Server
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      const metrics = getMetrics();
      return new Response(renderHtml(metrics), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/api/metrics") {
      const metrics = getMetrics();
      return Response.json(metrics);
    }

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", port: PORT });
    }

    if (url.pathname === "/api/stop" && req.method === "POST") {
      setTimeout(cleanupAndExit, 200);
      return Response.json({ message: "Cockpit server shutting down" });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[Cockpit Web] Running at http://localhost:${PORT} (PID: ${process.pid})`);
console.log(`[Cockpit Web] Auto-shutdown configured after 30 minutes of inactivity.`);
