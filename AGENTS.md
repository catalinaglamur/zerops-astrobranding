# Operational Directives for Successor Antigravity (AGY) Agents

This repository is a sovereign, agnostic multi-ZCP monorepo template for Zerops Incus LXC runtimes.

---

## 🚀 How to Onboard & Start This Repository in a Fresh ZCP

When a user opens this repository in a brand-new ZCP container, execute the following protocol:

### The Human Activation Prompt:
```text
Iniciá y desplegá este proyecto paso a paso usando mis credenciales en /ruta/a/mis-keys.md (o /var/www/.env). Seguí estrictamente las instrucciones de AGENTS.md.
```

### AGY Automated Workflow:
1. **Locate Credentials**: Identify if credentials exist in `/var/www/.env`, `/var/www/keys/`, or a user-provided path.
2. **Execute Step-by-Step Initialization**:
   ```bash
   ./setup.sh --step 1
   ./setup.sh --step 2
   ./setup.sh --step 3 /path/to/keys.md
   ./setup.sh --step 4
   ./setup.sh --step 5
   ./setup.sh --step 6
   ```
3. **Handle Errors At Once**: If step $N$ fails, HALT immediately. Do not attempt step $N+1$. Fix the code locally, verify with physical sensors (exit code 0), and commit/push to Git before resuming.
4. **Deploy via Zerops Native MCP**:
   - Use native MCP tool `zerops_import` with `import.yaml` (or `zerops_workflow action="start" workflow="bootstrap"`).
   - Zerops provisions the 10 services in priority order (10 -> 8 -> 6 -> 4 -> 2).
   - Never use `zcli` inside this container; the container is the native ZCP control plane.

---

## 🏛️ Gentle-AI Governance (GGA, SDD, RDD) Alignment

All changes in this repository must comply with Gentle-AI sovereign governance:

### 1. Gentle Governance Architecture (GGA - F0 to F5)
- **F0 (Epistemic Inflow)**: Zero static assumptions. All astrology, payment, or platform schemas must align with the canonical research reports in `/var/www/artifacts/astrology_disciplines/` and `/var/www/artifacts/tech_stack_research/`.
- **F1 (Clarification Gate)**: If any credential, environment variable, or client requirement is missing, ask one direct question and stop.
- **F2 (Dual-RAG Pre-Plan)**: Audit `packages/contracts` (Zod schemas) and `import.yaml` before changing business logic.
- **F3 (Validation Feedforward)**: Validate topology with `zcp-validate yaml import.yaml` and layer boundaries with `bun scripts/architecture-check.mjs`.
- **F4 (Plan Offloading)**: For major features touching $\ge 3$ files, write a structured plan before mutating code.
- **F5 (Atomic Sensors & Commit)**:
  - Run physical sensors: `bun run check && bun run check:arch && bun run build` (must exit 0).
  - Use conventional commits only (strictly NO "Co-Authored-By" or AI attribution).
  - Save milestones to persistent memory via `mem_save`.

### 2. Spec-Driven Development (SDD) & Receipt-Driven Development (RDD)
- **SDD**: For complex multi-service features (e.g. adding new payment drivers or astrology engines), structure implementation into clear stages: `spec` $\to$ `design` $\to$ `tasks` $\to$ `apply` $\to$ `verify`.
- **RDD**: Verify changes through deterministic evidence and receipts (physical exit codes, API ping endpoints, and health checks), avoiding performative agreement or blind assumption.

---

## 🔒 Invariants & Agnostic Standards

- **Multi-ZCP Portability**: Never hardcode account emails, user-specific directories (e.g. `/var/www/baiosfera`), or single-tenant credentials.
- **FreeLLMAPI Quota Stacking**: Multi-account keys are isolated per account and pooled per provider in SQLite WAL mode on `/mnt/localstorage/freellmapi/freellmapi.db`.
- **Bifrost v2 GA**: Serves as the Single Front Door on port `:8080`, with CEL routing and semantic caching on Valkey 7.2.
- **Frappe Idempotency**: All CRM operations must use `search-before-write` or conflict handling to avoid HTTP 409 collisions.
