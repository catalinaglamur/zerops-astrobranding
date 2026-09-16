#!/usr/bin/env node

/**
 * FreeLLMAPI Markdown Seeder CLI
 * Usage: node scripts/seed-freellm-keys.mjs [/path/to/apis.md] [freellmapi_url]
 *
 * Parses markdown API credential files and injects them into FreeLLMAPI via REST or direct JSON storage.
 */

import fs from "node:fs";
import path from "node:path";

const defaultCandidates = [
  process.argv[2],
  process.env.KEYS_FILE,
  "/var/www/keys.md",
  "/var/www/.env",
].filter(Boolean);

let filePath = "";
for (const cand of defaultCandidates) {
  if (cand && fs.existsSync(cand)) {
    filePath = cand;
    break;
  }
}

const targetUrl = process.argv[3] || process.env.FREELLMAPI_URL || "http://localhost:3001";

if (!filePath) {
  console.log(`[Info] No credentials file supplied or found. FreeLLMAPI operates via environment variables.`);
  process.exit(0);
}

console.log(`\n==> [FreeLLMAPI Seeder] Reading credentials from: ${filePath}`);

const content = fs.readFileSync(filePath, "utf-8");

// Extracted providers array
const providers = [];

// Parse markdown sections
const sections = content.split(/###\s+\d+\.\s+/);

for (const section of sections) {
  if (!section.trim()) continue;

  const platformMatch = section.match(/\*\*Plataforma:\*\*\s*`([^`]+)`/);
  const labelMatch = section.match(/\*\*Etiqueta:\*\*\s*`([^`]+)`/);
  const keyMatch = section.match(/\*\*API Key:\*\*\s*`([^`]+)`/);
  const urlMatch = section.match(/\*\*Base URL:\*\*\s*`([^`]+)`/);

  if (platformMatch && keyMatch) {
    providers.push({
      id: platformMatch[1].trim().toLowerCase(),
      label: labelMatch ? labelMatch[1].trim() : platformMatch[1].trim(),
      apiKey: keyMatch[1].trim(),
      ...(urlMatch ? { baseUrl: urlMatch[1].trim() } : {}),
    });
  }
}

console.log(`==> Extracted ${providers.length} providers from markdown:`);
for (const p of providers) {
  console.log(`  - [${p.id}] ${p.label}: ${p.apiKey.slice(0, 8)}...${p.apiKey.slice(-4)}`);
}

async function seedViaRest() {
  try {
    const res = await fetch(`${targetUrl.replace(/\/$/, "")}/admin/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providers }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`\n==> [Success] Seeded ${providers.length} providers into live FreeLLMAPI at ${targetUrl}!`);
      console.log(`    API Response:`, data);
      return true;
    }
    console.warn(`[Warning] HTTP ${res.status} from FreeLLMAPI REST API.`);
  } catch (err) {
    console.warn(`[Info] Live service not reached at ${targetUrl}. Writing directly to local storage file...`);
  }
  return false;
}

async function main() {
  const success = await seedViaRest();

  // Always write fallback to local storage json so that when FreeLLMAPI boots, keys are pre-loaded
  const localDbPaths = [
    path.join(process.cwd(), "apps", "freellmapi", "data", "freellmapi.json"),
    "/mnt/localstorage/freellmapi/freellmapi.db",
  ];

  for (const dbPath of localDbPaths) {
    try {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(providers, null, 2), "utf-8");
      console.log(`==> [File Storage] Pre-seeded credentials to: ${dbPath}`);
    } catch {
      // Ignore write errors for paths not writable in current container
    }
  }

  console.log(`\n==> [FreeLLMAPI Seeder] Completed successfully.\n`);
}

main();
