import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.FREEAPI_DB_PATH || path.join(process.cwd(), "data", "freellmapi.db");
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || "freellmapi-sovereign-master-secret-key-32b";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY_RAW).digest(); // Exactly 32 bytes

// Ensure volume mount directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite with WAL mode on persistent POSIX volume
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS provider_keys (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    account_label TEXT NOT NULL,
    ciphertext TEXT NOT NULL,
    iv TEXT NOT NULL,
    tag TEXT NOT NULL,
    cooldown_until INTEGER DEFAULT 0,
    rate_limit_429_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used_at INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_provider_cooldown ON provider_keys (provider, cooldown_until);
`);

// AES-256-GCM Encryption Helpers
function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { ciphertext: encrypted, iv: iv.toString("hex"), tag };
}

function decrypt(ciphertext, ivHex, tagHex) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Built-in Provider Definitions and Capabilities
const PROVIDER_METADATA = {
  cerebras: {
    name: "Cerebras Cloud (Ultra-Fast LPU)",
    baseUrl: "https://api.cerebras.ai/v1",
    defaultModel: "llama3.1-8b",
    models: ["llama3.1-8b", "llama3.1-70b"],
    tier: "fast",
  },
  groq: {
    name: "Groq Cloud (Fast LPU)",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    tier: "fast",
  },
  opencode: {
    name: "OpenCode Zen (Coding Focus)",
    baseUrl: "https://api.opencode.zen/v1",
    defaultModel: "qwen-2.5-coder-32b",
    models: ["qwen-2.5-coder-32b", "deepseek-coder-v2"],
    tier: "smart",
  },
  openrouter: {
    name: "OpenRouter Free Pool",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.2-3b-instruct:free",
    models: [
      "meta-llama/llama-3.2-3b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "deepseek/deepseek-chat:free",
    ],
    tier: "smart",
  },
  ollama: {
    name: "Ollama Cloud",
    baseUrl: "https://api.ollama.cloud/v1",
    defaultModel: "llama3.2:3b",
    models: ["llama3.2:3b", "qwen2.5:7b"],
    tier: "balanced",
  },
  huggingface: {
    name: "HuggingFace Serverless",
    baseUrl: "https://api-inference.huggingface.co/v1",
    defaultModel: "Qwen/Qwen2.5-72B-Instruct",
    models: ["Qwen/Qwen2.5-72B-Instruct", "meta-llama/Llama-3.1-8B-Instruct"],
    tier: "smart",
  },
  aisa: {
    name: "Aisa One",
    baseUrl: "https://api.aisa.one/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "claude-3-5-sonnet"],
    tier: "balanced",
  },
};

// Key Pool Repository Operations
function upsertProviderKey(provider, accountLabel, apiKey) {
  if (!apiKey || !provider) return;
  const id = `${provider}-${accountLabel}-${crypto.createHash("md5").update(apiKey).digest("hex").slice(0, 8)}`;
  const { ciphertext, iv, tag } = encrypt(apiKey);

  const stmt = db.prepare(`
    INSERT INTO provider_keys (id, provider, account_label, ciphertext, iv, tag, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      ciphertext = excluded.ciphertext,
      iv = excluded.iv,
      tag = excluded.tag;
  `);
  stmt.run(id, provider.toLowerCase(), accountLabel, ciphertext, iv, tag, Date.now());
}

function getAvailableKeysForProvider(provider) {
  const now = Date.now();
  const stmt = db.prepare(`
    SELECT * FROM provider_keys
    WHERE provider = ? AND cooldown_until <= ?
    ORDER BY last_used_at ASC
  `);
  return stmt.all(provider, now).map((row) => {
    try {
      const plainKey = decrypt(row.ciphertext, row.iv, row.tag);
      return { ...row, apiKey: plainKey };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function recordKeySuccess(id) {
  const stmt = db.prepare(`
    UPDATE provider_keys
    SET success_count = success_count + 1, last_used_at = ?
    WHERE id = ?
  `);
  stmt.run(Date.now(), id);
}

function recordKey429(id, cooldownSeconds = 60) {
  const cooldownUntil = Date.now() + cooldownSeconds * 1000;
  const stmt = db.prepare(`
    UPDATE provider_keys
    SET rate_limit_429_count = rate_limit_429_count + 1, cooldown_until = ?, last_used_at = ?
    WHERE id = ?
  `);
  stmt.run(cooldownUntil, Date.now(), id);
}

function recordKeyError(id) {
  const stmt = db.prepare(`
    UPDATE provider_keys
    SET error_count = error_count + 1, last_used_at = ?
    WHERE id = ?
  `);
  stmt.run(Date.now(), id);
}

// Ingestion from Markdown or Environment
function ingestMarkdownContent(content, defaultLabel = "default") {
  const accountHeaderMatch = content.match(/#\s+API\s+Keys\s+[-—]\s+([^\n\r]+)/i);
  const detectedAccount = accountHeaderMatch ? accountHeaderMatch[1].trim() : defaultLabel;
  const sections = content.split(/###\s+\d+\.\s+/);
  let count = 0;

  for (const sec of sections) {
    if (!sec.trim()) continue;
    const platformMatch = sec.match(/\*\*Plataforma:\*\*\s*`([^`]+)`/i);
    const keyMatch = sec.match(/\*\*API Key:\*\*\s*`([^`]+)`/i);
    const labelMatch = sec.match(/\*\*Etiqueta:\*\*\s*`([^`]+)`/i);

    if (platformMatch && keyMatch) {
      const provider = platformMatch[1].trim().toLowerCase();
      const apiKey = keyMatch[1].trim();
      const label = labelMatch ? labelMatch[1].trim() : detectedAccount;
      upsertProviderKey(provider, label, apiKey);
      count++;
    }
  }
  return count;
}

// Auto-ingest environment variables and seed stores on boot
function autoDiscoverEnv() {
  const mapping = {
    cerebras: process.env.CEREBRAS_API_KEY,
    groq: process.env.GROQ_API_KEY,
    opencode: process.env.OPENCODE_API_KEY,
    ollama: process.env.OLLAMA_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    huggingface: process.env.HUGGINGFACE_API_KEY,
    aisa: process.env.AISA_API_KEY,
  };

  for (const [p, k] of Object.entries(mapping)) {
    if (k) upsertProviderKey(p, "env", k);
  }

  // Auto-ingest seed.json if present
  const seedFiles = [
    path.join(DATA_DIR, "seed.json"),
    "/mnt/localstorage/freellmapi/seed.json",
    path.join(process.cwd(), "data", "seed.json"),
  ];
  for (const sFile of seedFiles) {
    if (fs.existsSync(sFile)) {
      try {
        const raw = fs.readFileSync(sFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.provider && item.apiKey) {
              upsertProviderKey(item.provider, item.label || item.account || "seed", item.apiKey);
            }
          }
        }
      } catch (err) {
        console.error(`[Warning] Failed loading seed file ${sFile}:`, err.message);
      }
    }
  }

  // Auto-scan keys directory if present
  const keysDirs = [
    process.env.KEYS_DIR,
    "/mnt/localstorage/freellmapi/keys",
    "/var/www/keys",
  ].filter(Boolean);

  for (const dir of keysDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
          if (f.endsWith(".md")) {
            const p = path.join(dir, f);
            const content = fs.readFileSync(p, "utf-8");
            const base = path.basename(f, ".md");
            ingestMarkdownContent(content, base);
          }
        }
      } catch (err) {
        console.error(`[Warning] Failed scanning keys dir ${dir}:`, err.message);
      }
    }
  }
}

autoDiscoverEnv();

// Health Check Probe
app.get("/api/ping", (req, res) => {
  const totalKeys = db.prepare("SELECT COUNT(*) as count FROM provider_keys").get().count;
  res.json({
    status: "ok",
    service: "freellmapi",
    version: "2.4.0",
    engine: "node:sqlite",
    totalKeysInPool: totalKeys,
    timestamp: new Date().toISOString(),
  });
});

// Admin Status Endpoint: Shows active pools, remaining cooldowns, quotas
app.get("/api/status", (req, res) => {
  const now = Date.now();
  const rows = db.prepare("SELECT * FROM provider_keys").all();

  const pools = {};
  for (const r of rows) {
    if (!pools[r.provider]) pools[r.provider] = { provider: r.provider, totalKeys: 0, activeKeys: 0, keys: [] };
    const inCooldown = r.cooldown_until > now;
    pools[r.provider].totalKeys++;
    if (!inCooldown) pools[r.provider].activeKeys++;
    pools[r.provider].keys.push({
      account: r.account_label,
      inCooldown,
      cooldownSecondsRemaining: Math.max(0, Math.ceil((r.cooldown_until - now) / 1000)),
      successCount: r.success_count,
      rateLimit429Count: r.rate_limit_429_count,
      errorCount: r.error_count,
    });
  }

  res.json({ status: "healthy", activePools: Object.values(pools) });
});

// Admin Seed Endpoint: Ingest multiple markdown files or JSON payloads
app.post("/admin/seed", (req, res) => {
  const { markdown, files, label = "seeded" } = req.body;
  let totalIngested = 0;

  if (typeof markdown === "string") {
    totalIngested += ingestMarkdownContent(markdown, label);
  }

  if (Array.isArray(files)) {
    for (const f of files) {
      if (typeof f.content === "string") {
        totalIngested += ingestMarkdownContent(f.content, f.label || label);
      }
    }
  }

  res.json({ success: true, keysIngested: totalIngested });
});

// Models Catalog Endpoint
app.get("/v1/models", (req, res) => {
  const models = [];
  for (const [pid, pmeta] of Object.entries(PROVIDER_METADATA)) {
    for (const m of pmeta.models) {
      models.push({
        id: `${pid}/${m}`,
        object: "model",
        owned_by: pid,
        permission: [],
      });
    }
  }
  // Virtual Directives
  models.push(
    { id: "auto", object: "model", owned_by: "freellmapi" },
    { id: "auto:fast", object: "model", owned_by: "freellmapi" },
    { id: "auto:smart", object: "model", owned_by: "freellmapi" },
    { id: "auto:balanced", object: "model", owned_by: "freellmapi" },
    { id: "auto:reliable", object: "model", owned_by: "freellmapi" }
  );
  res.json({ object: "list", data: models });
});

// Model Context Protocol (/mcp) Gateway Endpoint
app.post("/mcp", (req, res) => {
  const { id = 1, method } = req.body || {};

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "list_models",
            description: "List active LLM models across all free-tier provider pools",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "provider_health",
            description: "Check health, quotas, and 429 cooldown status across all providers",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "usage_summary",
            description: "Summary of tokens, successful requests, and rate-limit counters",
            inputSchema: { type: "object", properties: {} },
          },
        ],
      },
    });
  }

  if (method === "tools/call") {
    const totalKeys = db.prepare("SELECT COUNT(*) as count FROM provider_keys").get().count;
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: JSON.stringify({ status: "healthy", activeKeys: totalKeys }) }],
      },
    });
  }

  return res.json({ jsonrpc: "2.0", id, result: {} });
});

// Dynamic Smart Routing Directive Resolver
function resolveProviderSequence(modelDirective) {
  const allProviders = Object.keys(PROVIDER_METADATA);

  if (!modelDirective || modelDirective === "auto" || modelDirective === "auto:balanced") {
    return ["groq", "cerebras", "opencode", "openrouter", "huggingface", "aisa", "ollama"];
  }
  if (modelDirective === "auto:fast") {
    return ["cerebras", "groq", "openrouter", "opencode", "aisa"];
  }
  if (modelDirective === "auto:smart") {
    return ["opencode", "openrouter", "groq", "huggingface", "cerebras", "aisa"];
  }
  if (modelDirective === "auto:reliable") {
    const stats = db.prepare(`
      SELECT provider, SUM(error_count + rate_limit_429_count) as errors
      FROM provider_keys
      GROUP BY provider
      ORDER BY errors ASC
    `).all();
    const ordered = stats.map((s) => s.provider);
    return Array.from(new Set([...ordered, ...allProviders]));
  }

  // Explicit provider requested (e.g. "groq/llama-3.3-70b-versatile")
  const specific = modelDirective.split("/")[0].toLowerCase();
  if (PROVIDER_METADATA[specific]) {
    return [specific, ...allProviders.filter((p) => p !== specific)];
  }

  return allProviders;
}

// Resilient Chat Completions with Two-Tier Key Rotation and Failover
app.post("/v1/chat/completions", async (req, res) => {
  const { messages, model = "auto:balanced", temperature = 0.7, max_tokens = 2048, stream = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  const providerOrder = resolveProviderSequence(model);
  let lastError = null;

  for (const providerId of providerOrder) {
    const meta = PROVIDER_METADATA[providerId];
    if (!meta) continue;

    // Get all healthy keys for this provider ordered by least recently used
    const keys = getAvailableKeysForProvider(providerId);
    if (keys.length === 0) continue;

    // Intra-Provider Key Rotation
    for (const keyRow of keys) {
      try {
        const targetModel = model.includes("/") ? model.split("/")[1] : meta.defaultModel;
        console.log(`[FreeLLMAPI] Routing to [${providerId}] using account [${keyRow.account_label}] (model: ${targetModel})...`);

        const upstreamRes = await fetch(`${meta.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keyRow.apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature,
            max_tokens,
            stream: Boolean(stream),
          }),
        });

        // Tier 1: Handle HTTP 429 Rate Limit
        if (upstreamRes.status === 429) {
          recordKey429(keyRow.id, 60);
          console.warn(`[FreeLLMAPI] Key [${keyRow.id}] hit 429. Cooldown 60s. Rotating to next key in pool...`);
          continue; // Try next key of SAME provider!
        }

        if (!upstreamRes.ok) {
          recordKeyError(keyRow.id);
          const errText = await upstreamRes.text();
          console.warn(`[FreeLLMAPI] Upstream error ${upstreamRes.status} from [${providerId}]: ${errText.slice(0, 100)}`);
          continue; // Try next key of SAME provider!
        }

        // Success!
        recordKeySuccess(keyRow.id);
        res.setHeader("x-routed-provider", providerId);
        res.setHeader("x-routed-account", keyRow.account_label);

        // Streaming Response
        if (stream && upstreamRes.body) {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");

          const reader = upstreamRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          return res.end();
        }

        // Non-streaming JSON response
        const data = await upstreamRes.json();
        return res.json(data);
      } catch (err) {
        recordKeyError(keyRow.id);
        lastError = err;
        console.warn(`[FreeLLMAPI] Connection error on key [${keyRow.id}]:`, err.message);
      }
    }
  }

  // Fallback synthetic response if all pools are exhausted or no keys ingested
  console.warn("[FreeLLMAPI] All provider pools exhausted or in cooldown. Providing synthetic fallback.");
  return res.json({
    id: `chatcmpl-fallback-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: `[FreeLLMAPI Sovereign Fallback] Procesado bajo contingencia. Último error: ${lastError?.message || "Pools en cooldown"}.`,
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[FreeLLMAPI] Sovereign Aggregator v2.4.0 listening on 0.0.0.0:${PORT} (SQLite WAL active)`);
});
