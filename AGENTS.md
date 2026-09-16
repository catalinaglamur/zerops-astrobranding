# Operational Directives for Successor Antigravity (AGY) Agents

This repository is a sovereign, agnostic multi-ZCP monorepo template for Zerops Incus LXC runtimes.

---

## 🏛️ Core Principles & Invariants

1. **Multi-ZCP & Client Agnostic**:
   - Zero hardcoded client credentials, API keys, or absolute host paths (e.g. do not assume `/var/www/baiosfera` or specific account emails).
   - Ingest credentials dynamically from `/var/www/.env`, `/var/www/keys/`, or user-supplied `.md` files via `scripts/seed-freellm-keys.mjs`.

2. **Strict Step-by-Step Initialization (`setup.sh`)**:
   - When preparing this repository in a fresh ZCP container, execute the setup **step-by-step**, NEVER all at once blindly:
     - `./setup.sh --step 1`: Workspace & environment validation.
     - `./setup.sh --step 2`: Workspace dependency installation with Bun.
     - `./setup.sh --step 3 [keys.md]`: FreeLLMAPI multi-account key ingestion and quota stacking.
     - `./setup.sh --step 4`: Architecture boundary check and TypeScript compilation (`tsc --noEmit`).
     - `./setup.sh --step 5`: Fullstack build validation.
     - `./setup.sh --step 6`: Zerops platform manifest topology verification (`zcp-validate`).
   - **Hard Stop on Failure**: If step $N$ fails, STOP immediately. Inspect error logs, fix the code in place, verify the fix with physical sensors (exit code 0), and commit/push to Git before advancing to step $N+1$. A failed preceding step invalidates all subsequent steps.

3. **Zerops Native Control Plane (ZCP MCP)**:
   - This container is the ZCP control-plane. Do NOT run or install external `zcli`.
   - Interact with the platform exclusively via native `zerops_*` MCP tools (`zerops_import`, `zerops_deploy`, `zerops_workflow`, `zerops_env`).

4. **GGA & Governance Alignment**:
   - All mutations must satisfy deterministic sensors (`bun scripts/architecture-check.mjs`, `tsc --noEmit`).
   - Conventional commits only (no "Co-Authored-By" or AI attribution).
   - Persist key architectural milestones in Engram (`mem_save`).
