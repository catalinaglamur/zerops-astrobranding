#!/usr/bin/env bash
set -e

# ==============================================================================
# Zerops AstroBranding Sovereign Monorepo — Step-by-Step Initializer (setup.sh)
#
# Designed for Successor AGY & Non-Technical Users:
# - Purely agnostic across any Zerops ZCP cluster.
# - Can run all steps sequentially OR step-by-step via:
#     ./setup.sh --step <1-6> [/path/to/keys.md]
# - Invariant: If any step fails, HALT immediately. Fix the code and commit before advancing.
# ==============================================================================

STEP="${1:-all}"
KEYS_ARG="${2:-}"

# If first arg is a file or path rather than a step flag:
if [[ "$STEP" != "--step" && "$STEP" != "1" && "$STEP" != "2" && "$STEP" != "3" && "$STEP" != "4" && "$STEP" != "5" && "$STEP" != "6" && "$STEP" != "all" ]]; then
  KEYS_ARG="$STEP"
  STEP="all"
fi

if [[ "$1" == "--step" ]]; then
  STEP="${2:-1}"
  KEYS_ARG="${3:-}"
fi

echo "=================================================================="
echo "   🚀 Zerops AstroBranding Step-by-Step Initializer (Step: $STEP)"
echo "=================================================================="

# ------------------------------------------------------------------------------
# STEP 1: Environment & Workspace Verification
# ------------------------------------------------------------------------------
step_1_env() {
  echo "==> [Step 1/6] Verifying Workspace & Environment..."
  if [ ! -f .env ] && [ -f .env.example ]; then
    echo "    Creating .env from .env.example..."
    cp .env.example .env
  fi

  # Check Bun & Node availability
  if ! command -v bun &> /dev/null; then
    echo "❌ [Step 1 Error] Bun is not installed in this container."
    echo "👉 Fix: Install Bun via curl -fsSL https://bun.sh/install | bash"
    exit 1
  fi
  echo "    Bun $(bun --version) detected."
  echo "✅ [Step 1 Passed] Environment and baseline workspace verified."
}

# ------------------------------------------------------------------------------
# STEP 2: Dependency Installation
# ------------------------------------------------------------------------------
step_2_deps() {
  echo "==> [Step 2/6] Installing Workspace Dependencies via Bun..."
  bun install
  echo "✅ [Step 2 Passed] All dependencies installed across workspaces."
}

# ------------------------------------------------------------------------------
# STEP 3: Multi-Account FreeLLMAPI Key Seeding & Quota Stacking
# ------------------------------------------------------------------------------
step_3_keys() {
  echo "==> [Step 3/6] Ingesting and Pooling FreeLLMAPI Credentials..."
  if [ -n "$KEYS_ARG" ] && [ -e "$KEYS_ARG" ]; then
    echo "    Ingesting from: $KEYS_ARG"
    node scripts/seed-freellm-keys.mjs "$KEYS_ARG"
  elif [ -d "/var/www/keys" ]; then
    echo "    Auto-discovering keys from /var/www/keys..."
    node scripts/seed-freellm-keys.mjs "/var/www/keys"
  elif [ -f "/var/www/keys.md" ]; then
    echo "    Auto-discovering keys from /var/www/keys.md..."
    node scripts/seed-freellm-keys.mjs "/var/www/keys.md"
  else
    echo "    Checking for available LLM API keys in default environment..."
    node scripts/seed-freellm-keys.mjs
  fi
  echo "✅ [Step 3 Passed] FreeLLMAPI quota stacking & offline seed configured."
}

# ------------------------------------------------------------------------------
# STEP 4: Architecture Boundary & Strict TypeScript Validation
# ------------------------------------------------------------------------------
step_4_validate() {
  echo "==> [Step 4/6] Validating Architectural Boundaries & Strict Types..."
  bun scripts/architecture-check.mjs
  bun run check
  echo "✅ [Step 4 Passed] Zero boundary violations, clean typecheck (exit code 0)."
}

# ------------------------------------------------------------------------------
# STEP 5: Fullstack Production Build Test (Astro 5 + React 19 + Hono)
# ------------------------------------------------------------------------------
step_5_build() {
  echo "==> [Step 5/6] Testing Production Fullstack Build..."
  bun run build
  echo "✅ [Step 5 Passed] Monorepo successfully built for production."
}

# ------------------------------------------------------------------------------
# STEP 6: Zerops Platform Import Readiness
# ------------------------------------------------------------------------------
step_6_zerops() {
  echo "==> [Step 6/6] Verifying Zerops Platform Manifests (import.yaml & zerops.yaml)..."
  if [ ! -f import.yaml ] || [ ! -f zerops.yaml ]; then
    echo "❌ [Step 6 Error] import.yaml or zerops.yaml missing from root."
    exit 1
  fi

  if command -v zcp-validate &> /dev/null; then
    zcp-validate yaml import.yaml
    echo "    Platform topology validated by zcp-validate."
  fi

  echo "=================================================================="
  echo "✅ [Step 6 Passed] Ready for Zerops Sovereign Mesh Provisioning."
  echo "   AGY Action: Deploy natively via Zerops MCP (zerops_import / zerops_workflow)."
  echo "   Or start local dev server via: bun run dev (port 3000)"
  echo "=================================================================="
}

# Execution Dispatcher
case "$STEP" in
  "1") step_1_env ;;
  "2") step_2_deps ;;
  "3") step_3_keys ;;
  "4") step_4_validate ;;
  "5") step_5_build ;;
  "6") step_6_zerops ;;
  "all")
    step_1_env
    step_2_deps
    step_3_keys
    step_4_validate
    step_5_build
    step_6_zerops
    ;;
  *)
    echo "Unknown step: $STEP. Options: 1, 2, 3, 4, 5, 6, all"
    exit 1
    ;;
esac
