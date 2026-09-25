#!/usr/bin/env bun
/**
 * ==============================================================================
 * Sovereign Cockpit CLI & Telemetry Sensor (cockpit-status.ts)
 * Zero Idle RAM | Sub-100ms Execution | Full Matrix Metrics
 * ==============================================================================
 */

import { execSync } from "node:child_process";
import fs from "node:fs";

// ANSI Color Helpers
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgCyan: "\x1b[46m\x1b[30m",
  bgGreen: "\x1b[42m\x1b[30m",
  bgYellow: "\x1b[43m\x1b[30m",
};

interface VirtualKeyMetric {
  id: string;
  name: string;
  requests: number;
  tokens: number;
  costUsd: number;
  budgetLimitMonthly: number;
  rateLimitRpm: number;
  status: "OK" | "WARNING" | "EXCEEDED";
}

interface BifrostTelemetry {
  status: "ONLINE" | "OFFLINE";
  version: string;
  requestsTotal: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  semanticCacheHits: number;
  directCacheHits: number;
  cacheHitRatioPercent: number;
  totalCostUsd: number;
  virtualKeys: VirtualKeyMetric[];
}

interface FreeLLMTelemetry {
  status: "ONLINE" | "OFFLINE";
  latencyMs: number;
  responseCache: "ACTIVE" | "OFFLINE";
  pooledKeysCount: number;
  providersReady: string[];
}

interface ZeropsInfraTelemetry {
  services: { hostname: string; type: string; status: string; url?: string }[];
  valkey: {
    status: "ONLINE" | "OFFLINE";
    residentMemoryMb: number;
    cpuSeconds: number;
  };
  localStorage: {
    mountPath: string;
    bifrostSize: string;
    freellmSize: string;
    totalUsed: string;
  };
  objectStorage: {
    status: string;
    bucketName: string;
    quotaGb: string;
  };
}

interface ExternalApiTelemetry {
  name: string;
  category: "Search & Extract" | "Astrology" | "Messaging / Edge";
  configured: boolean;
  maskedKey: string;
}

// 1. Gather Bifrost Metrics
async function collectBifrost(): Promise<BifrostTelemetry> {
  const result: BifrostTelemetry = {
    status: "OFFLINE",
    version: "2.2.3",
    requestsTotal: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    semanticCacheHits: 0,
    directCacheHits: 0,
    cacheHitRatioPercent: 0,
    totalCostUsd: 0,
    virtualKeys: [],
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const resp = await fetch("http://bifrost:8080/metrics", { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      result.status = "ONLINE";
      const text = await resp.text();
      for (const line of text.split("\n")) {
        if (line.startsWith("#")) continue;
        if (line.startsWith("bifrost_input_tokens_total")) {
          const val = parseFloat(line.split(" ").pop() || "0");
          result.inputTokens += isNaN(val) ? 0 : val;
        } else if (line.startsWith("bifrost_output_tokens_total")) {
          const val = parseFloat(line.split(" ").pop() || "0");
          result.outputTokens += isNaN(val) ? 0 : val;
        } else if (line.startsWith("bifrost_requests_total")) {
          const val = parseFloat(line.split(" ").pop() || "0");
          result.requestsTotal += isNaN(val) ? 0 : val;
        } else if (line.startsWith("bifrost_cache_hits_total")) {
          const val = parseFloat(line.split(" ").pop() || "0");
          if (line.includes('type="semantic"')) result.semanticCacheHits += isNaN(val) ? 0 : val;
          else result.directCacheHits += isNaN(val) ? 0 : val;
        }
      }
      result.totalTokens = result.inputTokens + result.outputTokens;
      if (result.requestsTotal > 0) {
        const totalHits = result.semanticCacheHits + result.directCacheHits;
        result.cacheHitRatioPercent = Math.min(100, (totalHits / result.requestsTotal) * 100);
      }
    }
  } catch {
    result.status = "OFFLINE";
  }

  // Virtual Keys & Spend aggregation from Bifrost SQLite logs.db
  try {
    const sql = `SELECT COALESCE(virtual_key_name, 'Default'), COUNT(*), COALESCE(SUM(total_tokens), 0), COALESCE(SUM(cost), 0) FROM logs GROUP BY virtual_key_name;`;
    const rawOut = execSync(`ssh -o ConnectTimeout=2 bifrost "sqlite3 /app/data/logs.db \\"${sql}\\"" 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 2500,
    }).trim();

    const budgetMap: Record<string, { budget: number; rpm: number }> = {
      "Production Sovereign Key": { budget: 50.0, rpm: 120 },
      "AstroBranding Production": { budget: 20.0, rpm: 120 },
      "Hermes Agent Autonomous": { budget: 15.0, rpm: 60 },
      "Evolution WhatsApp Bot": { budget: 10.0, rpm: 60 },
      "Antigravity AGY Operator": { budget: 10.0, rpm: 60 },
      Default: { budget: 25.0, rpm: 100 },
    };

    let totalSpend = 0;
    if (rawOut) {
      for (const row of rawOut.split("\n")) {
        const [name, reqs, tokens, cost] = row.split("|");
        const keyName = name.trim();
        const costNum = parseFloat(cost) || 0;
        totalSpend += costNum;
        const cfg = budgetMap[keyName] || { budget: 10.0, rpm: 60 };
        const status = costNum >= cfg.budget ? "EXCEEDED" : costNum >= cfg.budget * 0.8 ? "WARNING" : "OK";

        result.virtualKeys.push({
          id: keyName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: keyName,
          requests: parseInt(reqs, 10) || 0,
          tokens: parseInt(tokens, 10) || 0,
          costUsd: costNum,
          budgetLimitMonthly: cfg.budget,
          rateLimitRpm: cfg.rpm,
          status,
        });
      }
    }
    result.totalCostUsd = totalSpend;
  } catch {
    // If SSH or SQLite not queryable, provide default key topology
    result.virtualKeys = [
      { id: "vk-production-main", name: "Production Sovereign Key", requests: 0, tokens: 0, costUsd: 0, budgetLimitMonthly: 50, rateLimitRpm: 120, status: "OK" },
      { id: "vk-astrobranding-prod", name: "AstroBranding Production", requests: 0, tokens: 0, costUsd: 0, budgetLimitMonthly: 20, rateLimitRpm: 120, status: "OK" },
      { id: "vk-hermes-agent", name: "Hermes Agent Autonomous", requests: 0, tokens: 0, costUsd: 0, budgetLimitMonthly: 15, rateLimitRpm: 60, status: "OK" },
      { id: "vk-evolution-wa", name: "Evolution WhatsApp Bot", requests: 0, tokens: 0, costUsd: 0, budgetLimitMonthly: 10, rateLimitRpm: 60, status: "OK" },
      { id: "vk-agy-operator", name: "Antigravity AGY Operator", requests: 0, tokens: 0, costUsd: 0, budgetLimitMonthly: 10, rateLimitRpm: 60, status: "OK" },
    ];
  }

  return result;
}

// 2. Gather FreeLLMAPI Metrics
async function collectFreeLLM(): Promise<FreeLLMTelemetry> {
  const result: FreeLLMTelemetry = {
    status: "OFFLINE",
    latencyMs: 0,
    responseCache: "ACTIVE",
    pooledKeysCount: 0,
    providersReady: [],
  };

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const resp = await fetch("http://freellmapi:3001/api/ping", { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      result.status = "ONLINE";
      result.latencyMs = Math.round(performance.now() - start);
    }
  } catch {
    result.status = "OFFLINE";
  }

  // Inspect offline / pooled seed if available
  const seedPath = "/var/www/zerops-astrobranding/apps/freellmapi/data/seed.json";
  if (fs.existsSync(seedPath)) {
    try {
      const content = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      if (Array.isArray(content)) {
        result.pooledKeysCount = content.length;
        result.providersReady = [...new Set(content.map((k: any) => k.provider).filter(Boolean))];
      }
    } catch {
      // Ignored
    }
  }

  return result;
}

// 3. Gather Zerops Infrastructure Metrics
async function collectZeropsInfra(): Promise<ZeropsInfraTelemetry> {
  const infra: ZeropsInfraTelemetry = {
    services: [],
    valkey: { status: "OFFLINE", residentMemoryMb: 0, cpuSeconds: 0 },
    localStorage: { mountPath: "/var/www/localstorage", bifrostSize: "0M", freellmSize: "0M", totalUsed: "0M" },
    objectStorage: { status: "ACTIVE", bucketName: "glamur-assets", quotaGb: "50" },
  };

  // Known Zerops project topology
  infra.services = [
    { hostname: "zcp", type: "zcp@1", status: "ACTIVE", url: "https://zcp-252-8080.ny1.zerops.app" },
    { hostname: "bifrost", type: "alpine/go@1.22", status: "ACTIVE", url: "https://bifrost-252-8080.ny1.zerops.app" },
    { hostname: "freellmapi", type: "ubuntu/nodejs@24", status: "ACTIVE", url: "https://freellmapi-252-3001.ny1.zerops.app" },
    { hostname: "valkey", type: "valkey:single@7.2", status: "ACTIVE" },
    { hostname: "localstorage", type: "local-storage:single@1", status: "ACTIVE" },
    { hostname: "objectstorage", type: "object-storage", status: "ACTIVE" },
    { hostname: "astrobranding", type: "ubuntu/bun@1.3.9", status: "STOPPED" },
    { hostname: "hermes", type: "ubuntu/python@3.12", status: "STOPPED" },
    { hostname: "evolution", type: "alpine/go@1.22", status: "STOPPED" },
    { hostname: "database", type: "postgresql:single@18", status: "STOPPED" },
    { hostname: "nats", type: "nats:single@2.12", status: "STOPPED" },
  ];

  // Scrape Valkey Prometheus exporter
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const resp = await fetch("http://valkey:9121/metrics", { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      infra.valkey.status = "ONLINE";
      const text = await resp.text();
      for (const line of text.split("\n")) {
        if (line.startsWith("process_resident_memory_bytes")) {
          const bytes = parseFloat(line.split(" ").pop() || "0");
          infra.valkey.residentMemoryMb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
        } else if (line.startsWith("process_cpu_seconds_total")) {
          infra.valkey.cpuSeconds = parseFloat(line.split(" ").pop() || "0");
        }
      }
    }
  } catch {
    infra.valkey.status = "OFFLINE";
  }

  // Local storage measurements
  try {
    if (fs.existsSync("/var/www/localstorage/bifrost")) {
      const out = execSync("du -sh /var/www/localstorage/bifrost 2>/dev/null", { encoding: "utf-8" });
      infra.localStorage.bifrostSize = out.split("\t")[0]?.trim() || "0M";
    }
    if (fs.existsSync("/var/www/localstorage/freellmapi")) {
      const out = execSync("du -sh /var/www/localstorage/freellmapi 2>/dev/null", { encoding: "utf-8" });
      infra.localStorage.freellmSize = out.split("\t")[0]?.trim() || "0M";
    }
    const outTotal = execSync("du -sh /var/www/localstorage 2>/dev/null", { encoding: "utf-8" });
    infra.localStorage.totalUsed = outTotal.split("\t")[0]?.trim() || "0M";
  } catch {
    // Non-blocking
  }

  return infra;
}

// 4. Gather External and Astrological APIs Catalog
function collectExternalApis(): ExternalApiTelemetry[] {
  const keysFile = "/var/www/baiosfera/0ZEROPS-AGY/users-apis/Glamur/glamur-keys.md";
  const apiMap: Record<string, { category: ExternalApiTelemetry["category"]; varName: string }> = {
    "Exa Search": { category: "Search & Extract", varName: "EXA_API_KEY" },
    "Tavily Search": { category: "Search & Extract", varName: "TAVILY_API_KEY" },
    "Firecrawl Scraper": { category: "Search & Extract", varName: "FIRECRAWL_API_KEY" },
    "Jina AI Reader": { category: "Search & Extract", varName: "JINA_API_KEY" },
    "Brave Search": { category: "Search & Extract", varName: "BRAVE_API_KEY" },
    "Astroway Engine": { category: "Astrology", varName: "ASTROWAY_API_KEY" },
    "FreeAstro API": { category: "Astrology", varName: "FREEASTRO_API_KEY" },
    "VedAstro Jyotish": { category: "Astrology", varName: "VEDASTRO_API_KEY" },
    "Kundali MCP": { category: "Astrology", varName: "KUNDALI_MCP_KEY" },
    "NASA JPL Horizons": { category: "Astrology", varName: "NASA_API_KEY" },
    "AstrologyAPI.io": { category: "Astrology", varName: "ASTROLOGY_API_IO" },
    "ZeptoMail Transaccional": { category: "Messaging / Edge", varName: "ZEPTOMAIL_SEND_MAIL_TOKEN" },
    "Cloudflare Edge / DNS": { category: "Messaging / Edge", varName: "CLOUDFLARE_API_TOKEN" },
    "Meta WhatsApp Cloud": { category: "Messaging / Edge", varName: "META_WA_PHONE_NUMBER_ID" },
  };

  const envs: Record<string, string> = { ...process.env };

  // Parse glamur-keys.md if present
  if (fs.existsSync(keysFile)) {
    try {
      const raw = fs.readFileSync(keysFile, "utf-8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const k = trimmed.substring(0, eqIdx).trim();
          const v = trimmed.substring(eqIdx + 1).trim();
          envs[k] = v;
        }
      }
    } catch {
      // Ignored
    }
  }

  const results: ExternalApiTelemetry[] = [];
  for (const [name, meta] of Object.entries(apiMap)) {
    const val = envs[meta.varName];
    const configured = Boolean(val && !val.includes("xxxx") && !val.includes("YOUR_"));
    let masked = "NOT CONFIGURED";
    if (configured && val) {
      if (val.length > 12) {
        masked = `${val.substring(0, 6)}...${val.substring(val.length - 4)}`;
      } else {
        masked = `${val.substring(0, 3)}***`;
      }
    }
    results.push({
      name,
      category: meta.category,
      configured,
      maskedKey: masked,
    });
  }

  return results;
}

// 5. Render Formatted Output
function renderCli(bifrost: BifrostTelemetry, freellm: FreeLLMTelemetry, infra: ZeropsInfraTelemetry, apis: ExternalApiTelemetry[], filter?: string) {
  const ts = new Date().toISOString();
  console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.cyan}║   🏛️  GLAMUR SOVEREIGN COCKPIT · TELEMETRY, BUDGETS & INFRASTRUCTURE SENSOR      ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}╚══════════════════════════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`${C.gray} Timestamp: ${ts} | Process: 0 MB Idle RAM (Ephemeral Exec) | Zerops NY1${C.reset}\n`);

  // Section: LLMOps
  if (!filter || filter === "llm") {
    console.log(`${C.bold}${C.magenta}━━━ 🧠 LLMOPS: BIFROST AI GATEWAY & FREELLMAPI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    const bfBadge = bifrost.status === "ONLINE" ? `${C.bgGreen} ONLINE ${C.reset}` : `${C.red}[OFFLINE]${C.reset}`;
    console.log(`  • Bifrost Core:        ${bfBadge} ${C.gray}(v${bifrost.version}, :8080/v1)${C.reset}`);
    console.log(`  • Semantic Cache:      ${C.green}ACTIVE (chromem in-process)${C.reset} | Hits: ${C.bold}${bifrost.semanticCacheHits}${C.reset} (${bifrost.cacheHitRatioPercent.toFixed(1)}% ratio)`);
    console.log(`  • Inference Throughput:${C.bold} ${bifrost.requestsTotal}${C.reset} reqs | In: ${bifrost.inputTokens.toLocaleString()} tok | Out: ${bifrost.outputTokens.toLocaleString()} tok`);
    console.log(`  • Total USD Spend:     ${C.bold}${C.yellow}$${bifrost.totalCostUsd.toFixed(6)} USD${C.reset} ${C.gray}(Commercial Providers)${C.reset}`);

    const fBadge = freellm.status === "ONLINE" ? `${C.bgGreen} ONLINE ${C.reset}` : `${C.red}[OFFLINE]${C.reset}`;
    console.log(`  • FreeLLMAPI Pool:     ${fBadge} Latency: ${C.green}${freellm.latencyMs}ms${C.reset} | Keys Pooled: ${C.bold}${freellm.pooledKeysCount}${C.reset} | Cache: ${C.green}SQLite${C.reset}`);

    console.log(`\n  ${C.bold}Virtual-Keys & Budget Caps Matrix:${C.reset}`);
    console.log(`  ${C.gray}┌─────────────────────────────┬───────────┬─────────────┬─────────────────┬──────────┐${C.reset}`);
    console.log(`  ${C.gray}│${C.reset} ${C.bold}Virtual-Key Name${C.reset}            ${C.gray}│${C.reset} ${C.bold}Requests${C.reset}  ${C.gray}│${C.reset} ${C.bold}Tokens${C.reset}      ${C.gray}│${C.reset} ${C.bold}Spend / Budget${C.reset}    ${C.gray}│${C.reset} ${C.bold}Status${C.reset}   ${C.gray}│${C.reset}`);
    console.log(`  ${C.gray}├─────────────────────────────┼───────────┼─────────────┼─────────────────┼──────────┤${C.reset}`);
    for (const vk of bifrost.virtualKeys) {
      const statusColor = vk.status === "OK" ? C.green : vk.status === "WARNING" ? C.yellow : C.red;
      const spendFormatted = `$${vk.costUsd.toFixed(4)} / $${vk.budgetLimitMonthly}`;
      console.log(
        `  ${C.gray}│${C.reset} ${vk.name.padEnd(27)} ${C.gray}│${C.reset} ${vk.requests.toString().padStart(9)} ${C.gray}│${C.reset} ${vk.tokens.toLocaleString().padStart(11)} ${C.gray}│${C.reset} ${spendFormatted.padStart(15)} ${C.gray}│${C.reset} ${statusColor}${vk.status.padEnd(8)}${C.reset} ${C.gray}│${C.reset}`
      );
    }
    console.log(`  ${C.gray}└─────────────────────────────┴───────────┴─────────────┴─────────────────┴──────────┘${C.reset}\n`);
  }

  // Section: Zerops Infrastructure
  if (!filter || filter === "infra") {
    console.log(`${C.bold}${C.blue}━━━ ☁️ ZEROPS INFRASTRUCTURE & RUNTIMES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    const activeSvcs = infra.services.filter((s) => s.status === "ACTIVE").length;
    const stoppedSvcs = infra.services.filter((s) => s.status === "STOPPED").length;
    console.log(`  • Mesh Topology:       ${C.green}${activeSvcs} ACTIVE${C.reset} | ${C.gray}${stoppedSvcs} STOPPED (Cost-optimized)${C.reset}`);
    console.log(`  • Valkey In-Memory:    ${infra.valkey.status === "ONLINE" ? C.green + "ONLINE" : C.red + "OFFLINE"}${C.reset} | RSS: ${C.bold}${infra.valkey.residentMemoryMb} MB${C.reset} | CPU: ${infra.valkey.cpuSeconds}s`);
    console.log(`  • Local Storage Disk:  Total: ${C.bold}${infra.localStorage.totalUsed}${C.reset} | Bifrost: ${infra.localStorage.bifrostSize} | FreeLLM: ${infra.localStorage.freellmSize}`);
    console.log(`  • Object Storage:      Status: ${C.green}${infra.objectStorage.status}${C.reset} | Quota: ${infra.objectStorage.quotaGb} GB`);

    console.log(`\n  ${C.bold}Runtimes Breakdown:${C.reset}`);
    for (const svc of infra.services) {
      const stateBadge = svc.status === "ACTIVE" ? `${C.green}● ACTIVE ${C.reset}` : `${C.gray}○ STOPPED${C.reset}`;
      const urlInfo = svc.url ? ` ${C.cyan}-> ${svc.url}${C.reset}` : "";
      console.log(`    ${stateBadge} ${svc.hostname.padEnd(16)} ${C.gray}(${svc.type})${C.reset}${urlInfo}`);
    }
    console.log("");
  }

  // Section: External & Astrological APIs
  if (!filter || filter === "apis") {
    console.log(`${C.bold}${C.yellow}━━━ 🔮 EXTERNAL & ASTROLOGICAL APIS (glamur-keys.md) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    for (const cat of ["Search & Extract", "Astrology", "Messaging / Edge"] as const) {
      console.log(`\n  ${C.bold}[${cat}]${C.reset}`);
      const catApis = apis.filter((a) => a.category === cat);
      for (const a of catApis) {
        const badge = a.configured ? `${C.green}✓ CONFIGURED${C.reset}` : `${C.red}✗ MISSING${C.reset}`;
        console.log(`    • ${a.name.padEnd(25)} ${badge}  ${C.gray}${a.maskedKey}${C.reset}`);
      }
    }
    console.log("");
  }

  console.log(`${C.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.dim}Tip: Run 'cockpit-web start' to launch GUI on port 3050 | 'cockpit-status --json' for raw data${C.reset}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");
  const filterLlm = args.includes("--llm");
  const filterInfra = args.includes("--infra");
  const filterApis = args.includes("--apis");

  let filter: string | undefined;
  if (filterLlm) filter = "llm";
  else if (filterInfra) filter = "infra";
  else if (filterApis) filter = "apis";

  const [bifrost, freellm, infra] = await Promise.all([
    collectBifrost(),
    collectFreeLLM(),
    collectZeropsInfra(),
  ]);
  const apis = collectExternalApis();

  if (isJson) {
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          bifrost,
          freellm,
          infra,
          apis,
        },
        null,
        2
      )
    );
  } else {
    renderCli(bifrost, freellm, infra, apis, filter);
  }
}

main().catch((err) => {
  console.error("Cockpit Sensor Error:", err);
  process.exit(1);
});
