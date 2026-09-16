#!/usr/bin/env bash
set -e

# Zerops AstroBranding 1-Command Universal Setup
# Usage: ./setup.sh [/path/to/keys.md]

echo "=================================================================="
echo "   🚀 Zerops AstroBranding 1-Click Universal Initializer 🚀       "
echo "=================================================================="

KEYS_ARG="${1:-}"

# 1. Prepare environment variables
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "==> Creating default .env from .env.example..."
  cp .env.example .env
fi

# 2. Install dependencies with Bun
echo "==> Installing workspace dependencies via Bun..."
bun install

# 3. Seed FreeLLMAPI multi-account keys if credentials file passed or found
if [ -n "$KEYS_ARG" ] && [ -e "$KEYS_ARG" ]; then
  echo "==> Ingesting credentials from: $KEYS_ARG"
  node scripts/seed-freellm-keys.mjs "$KEYS_ARG"
elif [ -d "/var/www/keys" ]; then
  echo "==> Auto-discovering keys from /var/www/keys..."
  node scripts/seed-freellm-keys.mjs "/var/www/keys"
elif [ -f "/var/www/keys.md" ]; then
  echo "==> Auto-discovering keys from /var/www/keys.md..."
  node scripts/seed-freellm-keys.mjs "/var/www/keys.md"
else
  echo "==> Checking for available LLM API keys..."
  node scripts/seed-freellm-keys.mjs
fi

# 4. Run architecture boundary validation
echo "==> Validating architecture boundaries..."
bun scripts/architecture-check.mjs

echo "=================================================================="
echo "✅ Setup finished successfully! Everything is automated."
echo "   • Local server: bun run dev (serves unified app on port 3000)"
echo "   • Zerops 10-Service Mesh: zcli project import import.yaml"
echo "=================================================================="
