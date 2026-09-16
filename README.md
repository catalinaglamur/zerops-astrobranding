# Zerops AstroBranding Sovereign Platform (Template Monorepo)

> High-Performance, Sovereign Fullstack & Astrological Branding Monorepo Template for Zerops Incus LXC Runtimes.  
> Inspired by the best of [`di-sukharev/vibe`](https://github.com/di-sukharev/vibe) and [`xanthous-tech/hono-astro-remix-template`](https://github.com/xanthous-tech/hono-astro-remix-template).

---

## 🏛️ Architecture Overview

The repository is organized as a **Bun Workspaces Monorepo** managing a **Sovereign Mesh of 10 Services** (5 application runtimes + 5 stateful managed services):

```text
├── apps/
│   ├── astrobranding/      # [Runtime 1] Unified Fullstack (Astro 5 SSR + React 19 Islands + Hono + BullMQ) [:3000]
│   │   ├── src/
│   │   │   ├── components/ # React 19 Islands: /app (Dossier) & /desk (Cockpit)
│   │   │   ├── pages/      # Astro 5 SSR: /, /gratis, /checkout, /docs, /app, /desk, /api/[...path]
│   │   │   ├── server/     # Hono API Router, BullMQ queues & Bull Board dashboard
│   │   │   └── workers/    # Dedicated BullMQ background job processors
│   ├── bifrost/            # [Runtime 2] Maxim AI Enterprise Gateway (Go v2.0.0, CEL routing, Valkey cache) [:8080]
│   ├── freellmapi/         # [Runtime 3] Multi-Provider Free LLM Proxy with 429 Circuit Breaker [:3001]
│   ├── evolution/          # [Runtime 4] Native WhatsApp Engine (Go whatsmeow, NATS JetStream events) [:8085]
│   └── hermes/             # [Runtime 5] Autonomous Copilot (Python 3.12, NATS JetStream daemon, stdlib health) [:8000]
├── packages/
│   ├── contracts/          # Zod 4 Schemas, 15 Shards, Feeds, Multi-Payment & Frappe DTOs (SSoT)
│   ├── database/           # PostgreSQL 18 (pgvector HNSW + uuidv7() + 15 Shards JSONB + Transactional Outbox)
│   └── engine/             # Typed SDKs, Multi-Gateway Payment Drivers, Frappe Client & Astrological Orchestrator
├── scripts/
│   ├── architecture-check.mjs # Static Architecture Guardian (DDD-lite boundary enforcement)
│   ├── bootstrap.mjs       # Clean-Room Bootstrapper for fresh containers and agents
│   └── seed-freellm-keys.mjs # Dynamic CLI Seeder from markdown credential files
├── .github/workflows/
│   └── deploy.yaml         # Immutable CI/CD Delivery via zeropsio/actions@v1.0.2
├── zerops.yaml             # Multi-Service Build & Run Manifest for all 5 Runtimes
├── import.yaml             # Canonical Zerops Provisioning Manifest (10 Services)
└── CHECKLIST.md            # Architecture & Intake Specification
```

---

## 💳 Multi-Gateway Payment Architecture & Frappe CRM/ERPNext Sync

The application features a pluggable, environment-driven payment strategy pattern:

1. **Dynamic Gateway Discovery (`/api/v1/payments/gateways`)**:
   - Inspects active environment keys at runtime (`DLOCALGO_*`, `WOMPI_*`, `EPAYCO_*`).
   - Renders only the available gateways in the interactive checkout tabbed interface (`/checkout`).
2. **Unified Webhook Processing (`/api/webhooks/:gateway`)**:
   - Cryptographic signature validation for each gateway.
   - Transactional Outbox Pattern in PostgreSQL 18 with native deduplication (`pay-${gateway}-${txId}`).
3. **Automated Post-Settlement Business Sync**:
   - **Frappe CRM v1.83+**: Automatically marks the corresponding `CRM Deal` as `Won` and updates lead value.
   - **ERPNext**: Generates or links the `Customer` and automatically issues the `Sales Invoice` (`ASTRO-REPORT`).

---

## 🤖 FreeLLMAPI, Bifrost & 429 Rate-Limit Circuit Breaker

### Service Interactions & Data Stores
| Service | Runtime | Uses PostgreSQL 18? | Uses Valkey 7.2? | Uses NATS 2.12? | Persistence / Storage |
|---|---|---|---|---|---|
| **FreeLLMAPI** | Node.js 22 | No | No | No | SQLite / JSON on Zerops POSIX volume `localstorage` |
| **Bifrost** | Go v2.0.0 (Alpine) | No | **Yes** (Semantic Cache) | No | Upstream proxy to FreeLLMAPI (`:3001/v1`) |
| **EvolutionGo** | Go 1.22 (Alpine) | **Yes** (Auth & Chats) | **Yes** (QR/Session) | **Yes** (Event stream) | Dedicated DBs `evogo_auth` & `evogo_users` |
| **Hermes-Agent** | Python 3.12 (Ubuntu) | No | No | **Yes** (Agent bridge) | Bifrost proxy for LLM inference |
| **AstroBranding** | Bun 1.4 (Ubuntu) | **Yes** (Shards, Feeds, Orders) | **Yes** (BullMQ queues) | **Yes** (Pub/Sub) | S3 Object Storage for exported PDFs/PNGs |

### Automated 429 Prevention & Failover
`apps/freellmapi` implements an active circuit breaker across 7 providers:
`cerebras` $\to$ `groq` $\to$ `opencode` $\to$ `ollama` $\to$ `openrouter` $\to$ `huggingface` $\to$ `aisa`.
If any upstream provider returns HTTP 429, it enters a 60-second cooldown and the request automatically fails over to the next healthy candidate without dropping user requests.

### CLI Seeding from Markdown Credential Files
To seed or update API keys into FreeLLMAPI from a markdown vault file:
```bash
node scripts/seed-freellm-keys.mjs /var/www/baiosfera/0ZEROPS-AGY/0zcp-123/apis/baiosfera_freellm.md
```

---

## 🚀 Quick Start for Fresh Containers & Deployment AGY

To bootstrap and verify the repository locally:

```bash
# 1. Clone repository
git clone https://github.com/elplacerdc/zerops-astrobranding.git
cd zerops-astrobranding

# 2. Run deterministic clean-room bootstrapper
bun run bootstrap
```

### Clean Handoff Contract for Successor Deployment AGY
1. **Zero Active Deployments in This Phase**: Per strict directive, this repository was prepared in a pure clean-room environment with 100% typing, zero compile errors, and verified contracts. No live cluster deployments were initiated.
2. **To Deploy to Zerops**:
   - Push to `main` branch: GitHub Actions (`.github/workflows/deploy.yaml`) automatically triggers deployment using `zeropsio/actions@v1.0.2` with secret `ZEROPS_TOKEN`.
   - Or import infrastructure via `zcli`:
     ```bash
     zcli project import import.yaml
     ```
   - Build priority sequence in `import.yaml`:
     * Priority 10: PostgreSQL 18, Valkey 7.2, NATS 2.12, Local Storage, S3.
     * Priority 8: FreeLLMAPI.
     * Priority 6: Bifrost & EvolutionGo.
     * Priority 4: Hermes-Agent.
     * Priority 2: AstroBranding Fullstack Webapp.

---

## 🛠️ Development & Quality Assurance Commands

```bash
# Start unified fullstack dev server on port :3000
bun run dev

# Full monorepo typecheck across all packages & apps
bun run check

# Verify architectural boundary invariants (DDD-lite)
bun run check:arch

# Compile Astro 5 SSR server and React 19 client islands
bun run build

# Start production Astro SSR server
bun run start
```
