import express from "express";
import fs from "node:fs";
import path from "node:path";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.FREEAPI_DB_PATH || path.join(process.cwd(), "data", "freellmapi.json");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.warn(`[FreeLLMAPI] Could not create data dir ${dataDir}:`, err);
  }
}

interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  models: string[];
  cooldownUntil: number;
  errorCount: number;
  successCount: number;
  rateLimit429Count: number;
}

// Built-in registry of supported providers
const providerDefaults: Record<string, { name: string; baseUrl: string; defaultModel: string; models: string[] }> = {
  cerebras: {
    name: "Cerebras Cloud",
    baseUrl: "https://api.cerebras.ai/v1",
    defaultModel: "llama3.1-8b",
    models: ["llama3.1-8b", "llama3.1-70b"],
  },
  groq: {
    name: "Groq Cloud",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  },
  opencode: {
    name: "OpenCode Zen",
    baseUrl: "https://api.opencode.zen/v1",
    defaultModel: "qwen-2.5-coder-32b",
    models: ["qwen-2.5-coder-32b", "deepseek-coder-v2"],
  },
  ollama: {
    name: "Ollama Cloud",
    baseUrl: "https://api.ollama.cloud/v1",
    defaultModel: "llama3.2:3b",
    models: ["llama3.2:3b", "qwen2.5:7b"],
  },
  openrouter: {
    name: "OpenRouter Free",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.2-3b-instruct:free",
    models: [
      "meta-llama/llama-3.2-3b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "deepseek/deepseek-chat:free",
    ],
  },
  huggingface: {
    name: "HuggingFace Serverless",
    baseUrl: "https://api-inference.huggingface.co/v1",
    defaultModel: "Qwen/Qwen2.5-72B-Instruct",
    models: ["Qwen/Qwen2.5-72B-Instruct", "meta-llama/Llama-3.1-8B-Instruct"],
  },
  aisa: {
    name: "Aisa One",
    baseUrl: "https://api.aisa.one/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "claude-3-5-sonnet"],
  },
};

const providers: Map<string, ProviderConfig> = new Map();

function loadPersistedKeys(): void {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item.id && item.apiKey) {
            const def = providerDefaults[item.id] || {
              name: item.name || item.id,
              baseUrl: item.baseUrl || "https://api.openai.com/v1",
              defaultModel: item.defaultModel || "default",
              models: [item.defaultModel || "default"],
            };
            providers.set(item.id, {
              id: item.id,
              name: item.name || def.name,
              baseUrl: item.baseUrl || def.baseUrl,
              apiKey: item.apiKey,
              defaultModel: item.defaultModel || def.defaultModel,
              models: item.models || def.models,
              cooldownUntil: 0,
              errorCount: 0,
              successCount: 0,
              rateLimit429Count: 0,
            });
          }
        }
        console.log(`[FreeLLMAPI] Loaded ${providers.size} providers from ${DB_PATH}`);
      }
    } catch (err) {
      console.error(`[FreeLLMAPI] Error loading persisted keys from ${DB_PATH}:`, err);
    }
  }
}

function persistKeys(): void {
  try {
    const list = Array.from(providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      baseUrl: p.baseUrl,
      apiKey: p.apiKey,
      defaultModel: p.defaultModel,
      models: p.models,
    }));
    fs.writeFileSync(DB_PATH, JSON.stringify(list, null, 2), "utf-8");
    console.log(`[FreeLLMAPI] Persisted ${list.length} provider credentials to ${DB_PATH}`);
  } catch (err) {
    console.error(`[FreeLLMAPI] Failed to persist keys to ${DB_PATH}:`, err);
  }
}

loadPersistedKeys();

// Health check endpoint
app.get("/api/ping", (req, res) => {
  res.json({
    status: "ok",
    service: "freellmapi",
    version: "2.1.0",
    activeProviders: providers.size,
    timestamp: new Date().toISOString(),
  });
});

// Admin endpoint: List provider status & 429 metrics
app.get("/admin/status", (req, res) => {
  const now = Date.now();
  const list = Array.from(providers.values()).map((p) => ({
    id: p.id,
    name: p.name,
    baseUrl: p.baseUrl,
    hasKey: Boolean(p.apiKey),
    inCooldown: p.cooldownUntil > now,
    cooldownSecondsRemaining: Math.max(0, Math.ceil((p.cooldownUntil - now) / 1000)),
    successCount: p.successCount,
    errorCount: p.errorCount,
    rateLimit429Count: p.rateLimit429Count,
    models: p.models,
  }));
  res.json({ providers: list });
});

// Admin endpoint: Seed API keys dynamically via CLI or REST
app.post("/admin/seed", (req, res) => {
  const { providers: newProviders } = req.body;
  if (!Array.isArray(newProviders)) {
    return res.status(400).json({ error: "Expected 'providers' array in body" });
  }

  let added = 0;
  let updated = 0;

  for (const item of newProviders) {
    if (!item.id || !item.apiKey) continue;
    const def = providerDefaults[item.id] || {
      name: item.label || item.name || item.id,
      baseUrl: item.baseUrl || "https://api.openai.com/v1",
      defaultModel: item.defaultModel || "default",
      models: [item.defaultModel || "default"],
    };

    if (providers.has(item.id)) {
      const existing = providers.get(item.id)!;
      existing.apiKey = item.apiKey;
      if (item.baseUrl) existing.baseUrl = item.baseUrl;
      if (item.name || item.label) existing.name = item.name || item.label;
      updated++;
    } else {
      providers.set(item.id, {
        id: item.id,
        name: item.label || item.name || def.name,
        baseUrl: item.baseUrl || def.baseUrl,
        apiKey: item.apiKey,
        defaultModel: item.defaultModel || def.defaultModel,
        models: item.models || def.models,
        cooldownUntil: 0,
        errorCount: 0,
        successCount: 0,
        rateLimit429Count: 0,
      });
      added++;
    }
  }

  persistKeys();
  res.json({ success: true, added, updated, total: providers.size });
});

// OpenAI-compatible /v1/models endpoint
app.get("/v1/models", (req, res) => {
  const models = [];
  for (const p of providers.values()) {
    for (const m of p.models) {
      models.push({
        id: `${p.id}/${m}`,
        object: "model",
        owned_by: p.id,
        permission: [],
      });
    }
  }
  // If no providers configured yet, return standard defaults
  if (models.length === 0) {
    models.push(
      { id: "free-cerebras-llama-3.1-8b", object: "model", owned_by: "cerebras" },
      { id: "free-groq-llama-3.3-70b", object: "model", owned_by: "groq" }
    );
  }
  res.json({ object: "list", data: models });
});

// Resilient chat completions with automatic 429 fallback circuit breaker
app.post("/v1/chat/completions", async (req, res) => {
  const { messages, model, temperature = 0.7, max_tokens = 2048, stream = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array" });
  }

  const now = Date.now();
  // Get available candidate providers (not currently in 429 cooldown)
  const candidates = Array.from(providers.values()).filter(
    (p) => p.apiKey && p.cooldownUntil <= now
  );

  if (candidates.length === 0) {
    // If all providers are in cooldown or none configured, fallback to mock response
    console.warn("[FreeLLMAPI] No active providers available or all in cooldown. Providing synthetic response.");
    return res.json({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model || "free-fallback",
      provider: "freellmapi-fallback",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: `[FreeLLMAPI Sovereign Fallback] Procesado para: "${messages[messages.length - 1]?.content?.slice(0, 50)}..."`,
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 },
    });
  }

  // Determine priority order: if model specifies provider like "groq/...", try that first
  let requestedProviderId: string | null = null;
  if (typeof model === "string" && model.includes("/")) {
    requestedProviderId = model.split("/")[0];
  }

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (a.id === requestedProviderId) return -1;
    if (b.id === requestedProviderId) return 1;
    // Prefer providers with fewer 429 errors
    return a.rateLimit429Count - b.rateLimit429Count;
  });

  let lastError: Error | null = null;

  for (const provider of sortedCandidates) {
    try {
      const targetModel = provider.defaultModel;
      console.log(`[FreeLLMAPI] Forwarding inference to provider '${provider.id}' (model: ${targetModel})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const upstreamRes = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 429 Rate Limit
      if (upstreamRes.status === 429) {
        provider.rateLimit429Count++;
        provider.cooldownUntil = Date.now() + 60000; // 60s cooldown
        console.warn(`[FreeLLMAPI] Provider '${provider.id}' returned HTTP 429. Cooling down for 60s. Failing over...`);
        continue; // Try next candidate!
      }

      if (!upstreamRes.ok) {
        const errorText = await upstreamRes.text();
        provider.errorCount++;
        console.warn(`[FreeLLMAPI] Provider '${provider.id}' returned HTTP ${upstreamRes.status}: ${errorText.slice(0, 100)}`);
        continue; // Try next candidate!
      }

      const data = await upstreamRes.json();
      provider.successCount++;
      return res.json(data);
    } catch (err: unknown) {
      provider.errorCount++;
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[FreeLLMAPI] Connection error to provider '${provider.id}':`, lastError.message);
    }
  }

  // If all attempts failed
  return res.status(503).json({
    error: {
      message: `All upstream FreeLLMAPI providers failed or were rate-limited. Last error: ${lastError?.message || "Unknown"}`,
      type: "service_unavailable",
    },
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[FreeLLMAPI] Sovereign Microservice v2.1.0 listening on port ${PORT}`);
});
