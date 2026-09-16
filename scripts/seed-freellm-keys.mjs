#!/usr/bin/env node

/**
 * Universal FreeLLMAPI Multi-Account Seeder CLI
 * Usage:
 *   node scripts/seed-freellm-keys.mjs [file1.md file2.md ... | /path/to/keys-dir] [freellmapi_url]
 *
 * Agnostic quota-stacking seeder:
 * - Scans multiple markdown files / accounts (e.g., baiosfera_freellm.md, damaren_freellm.md)
 * - Ingests provider keys per account into FreeLLMAPI REST /admin/seed
 * - Writes offline fallback seed.json for cold boots
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
let targetUrl = process.env.FREELLMAPI_URL || "http://localhost:3001";
const fileCandidates = [];

// Parse CLI arguments (files, directories, or URL)
for (const arg of args) {
  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    targetUrl = arg;
    continue;
  }
  if (fs.existsSync(arg)) {
    const stat = fs.statSync(arg);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(arg);
      for (const f of files) {
        if (f.endsWith(".md")) {
          fileCandidates.push(path.resolve(arg, f));
        }
      }
    } else if (stat.isFile() && arg.endsWith(".md")) {
      fileCandidates.push(path.resolve(arg));
    }
  }
}

// Fallback search locations if no files passed
if (fileCandidates.length === 0) {
  const envFiles = [process.env.KEYS_FILE, process.env.KEYS_DIR].filter(Boolean);
  for (const ef of envFiles) {
    if (fs.existsSync(ef)) {
      const stat = fs.statSync(ef);
      if (stat.isDirectory()) {
        for (const f of fs.readdirSync(ef)) {
          if (f.endsWith(".md")) fileCandidates.push(path.resolve(ef, f));
        }
      } else if (stat.isFile()) {
        fileCandidates.push(path.resolve(ef));
      }
    }
  }

  const defaultLocations = [
    "/var/www/keys",
    "/var/www/keys.md",
    "/var/www/.env",
  ];
  for (const loc of defaultLocations) {
    if (fs.existsSync(loc)) {
      const stat = fs.statSync(loc);
      if (stat.isDirectory()) {
        for (const f of fs.readdirSync(loc)) {
          if (f.endsWith(".md")) fileCandidates.push(path.resolve(loc, f));
        }
      } else if (stat.isFile()) {
        fileCandidates.push(path.resolve(loc));
      }
    }
  }
}

if (fileCandidates.length === 0) {
  console.log(`[Info] No markdown credentials files found. FreeLLMAPI will run with env vars or empty seed.`);
  process.exit(0);
}

// Deduplicate candidate paths
const uniqueFiles = [...new Set(fileCandidates)];
console.log(`\n==> [FreeLLMAPI Seeder] Discovered ${uniqueFiles.length} credentials file(s):`);
uniqueFiles.forEach((f) => console.log(`    - ${f}`));

const seedPayloadFiles = [];
const fallbackFlattenedKeys = [];

for (const fpath of uniqueFiles) {
  try {
    const raw = fs.readFileSync(fpath, "utf-8");
    const baseName = path.basename(fpath, path.extname(fpath));
    const headerMatch = raw.match(/#\s+API\s+Keys\s+[-—]\s+([^\n\r]+)/i);
    const accountLabel = headerMatch ? headerMatch[1].trim() : baseName;

    seedPayloadFiles.push({
      content: raw,
      label: accountLabel,
    });

    // Parse sections for offline fallback
    const sections = raw.split(/###\s+\d+\.\s+/);
    for (const sec of sections) {
      if (!sec.trim()) continue;
      const platformMatch = sec.match(/\*\*Plataforma:\*\*\s*`([^`]+)`/i);
      const keyMatch = sec.match(/\*\*API Key:\*\*\s*`([^`]+)`/i);
      const labelMatch = sec.match(/\*\*Etiqueta:\*\*\s*`([^`]+)`/i);

      if (platformMatch && keyMatch) {
        fallbackFlattenedKeys.push({
          provider: platformMatch[1].trim().toLowerCase(),
          account: accountLabel,
          label: labelMatch ? labelMatch[1].trim() : accountLabel,
          apiKey: keyMatch[1].trim(),
        });
      }
    }
  } catch (err) {
    console.warn(`[Warning] Failed reading ${fpath}: ${err.message}`);
  }
}

console.log(`==> Total extracted provider keys for pooling: ${fallbackFlattenedKeys.length}`);

async function seedViaRest() {
  try {
    const endpoint = `${targetUrl.replace(/\/$/, "")}/admin/seed`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: seedPayloadFiles }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`\n==> [Success] Seeded ${data.keysIngested || fallbackFlattenedKeys.length} keys into live FreeLLMAPI at ${endpoint}!`);
      return true;
    }
    console.warn(`[Warning] HTTP ${res.status} from FreeLLMAPI REST API at ${endpoint}.`);
  } catch (err) {
    console.warn(`[Info] Live service not reached at ${targetUrl} (${err.message}). Storing offline seed...`);
  }
  return false;
}

async function main() {
  await seedViaRest();

  // Write offline fallback seed.json
  const seedTargets = [
    "/mnt/localstorage/freellmapi/seed.json",
    path.join(process.cwd(), "apps", "freellmapi", "data", "seed.json"),
  ];

  for (const st of seedTargets) {
    try {
      const dir = path.dirname(st);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(st, JSON.stringify(fallbackFlattenedKeys, null, 2), "utf-8");
      console.log(`==> [Offline Seed] Wrote ${fallbackFlattenedKeys.length} keys to ${st}`);
    } catch {
      // Ignore write errors if path not writable in current environment
    }
  }

  console.log(`\n==> [FreeLLMAPI Seeder] Multi-account quota stacking ready.\n`);
}

main();
