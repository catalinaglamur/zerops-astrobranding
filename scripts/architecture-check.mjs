#!/usr/bin/env bun
// ==============================================================================
// Architecture Guardian: Deterministic Static Boundary Sensor
// Adapted from di-sukharev/vibe for AstroBranding Zerops Sovereign Monorepo
// Zero LLM Tokens | Bounded Execution < 100ms | 100% Deterministic
// ==============================================================================
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

let violations = 0;

function report(rule, file, message) {
  console.error(`❌ [${rule}] in ${file}:`);
  console.error(`   ${message}`);
  violations++;
}

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        if (dirent.name === "node_modules" || dirent.name === "dist" || dirent.name === ".astro") {
          return [];
        }
        return getFiles(res);
      }
      return res;
    })
  );
  return files.flat();
}

async function checkContractsPurity() {
  const contractFiles = await getFiles("./packages/contracts/src");
  const forbiddenFrameworks = ["hono", "drizzle-orm", "postgres", "react", "react-dom", "@astrojs", "bullmq"];

  for (const file of contractFiles) {
    if (!file.endsWith(".ts")) continue;
    const content = await readFile(file, "utf-8");
    for (const fw of forbiddenFrameworks) {
      if (content.includes(`from "${fw}`) || content.includes(`from '${fw}`)) {
        report(
          "contracts-framework-purity",
          path.relative(".", file),
          `@astrobranding/contracts must be 100% pure TypeScript/Zod. Found forbidden dependency '${fw}'.`
        );
      }
    }
  }
}

async function checkDatabaseBoundaries() {
  const dbFiles = await getFiles("./packages/database/src");
  for (const file of dbFiles) {
    if (!file.endsWith(".ts")) continue;
    const content = await readFile(file, "utf-8");
    if (content.includes("from 'react'") || content.includes('from "react"')) {
      report(
        "database-no-ui",
        path.relative(".", file),
        `Database package must never import UI libraries.`
      );
    }
  }
}

async function run() {
  console.log("============================================================");
  console.log("  🔍 Running Architecture Guardian (scripts/architecture-check.mjs)");
  console.log("============================================================");

  await checkContractsPurity();
  await checkDatabaseBoundaries();

  if (violations === 0) {
    console.log("✅ Architecture Guardian: All layer boundaries verified (exit code 0).");
    process.exit(0);
  } else {
    console.error(`❌ Architecture Guardian: Rejected with ${violations} boundary violation(s).`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error during architecture check:", err);
  process.exit(1);
});
