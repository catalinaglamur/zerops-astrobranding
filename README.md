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
│   ├── freellmapi/         # [Runtime 3] Multi-Provider Free LLM Proxy (Node.js 22, SQLite on POSIX storage) [:3001]
│   ├── evolution/          # [Runtime 4] Native WhatsApp Engine (Go whatsmeow, NATS JetStream events) [:8085]
│   └── hermes/             # [Runtime 5] Autonomous Copilot (Python 3.12, NATS JetStream daemon, stdlib health) [:8000]
├── packages/
│   ├── contracts/          # Zod 4 Schemas, CoachStrategicProfile & Universal DTOs (SSoT)
│   ├── database/           # PostgreSQL 18 (pgvector HNSW + uuidv7() + Transactional Outbox Pattern)
│   └── engine/             # Typed Microservice SDKs (Bifrost, FreeLLMAPI, Evolution, Hermes)
├── scripts/
│   ├── architecture-check.mjs # Static Architecture Guardian (DDD-lite boundary enforcement)
│   └── bootstrap.mjs       # Clean-Room Bootstrapper for fresh containers and agents
├── .github/workflows/
│   └── deploy.yaml         # Immutable CI/CD Delivery via zeropsio/actions@v1.0.2
├── zerops.yaml             # Multi-Service Build & Run Manifest for all 5 Runtimes
├── import.yaml             # Canonical Zerops Provisioning Manifest (10 Services)
└── CHECKLIST.md            # Architecture & Intake Specification
```

---

## 🚀 Quick Start for Fresh Containers & Agents

To bootstrap a clean workspace from scratch:

```bash
# 1. Clone repository
git clone https://github.com/elplacerdc/zerops-astrobranding.git
cd zerops-astrobranding

# 2. Run deterministic clean-room bootstrapper
bun run bootstrap
```

The bootstrapper automatically:
1. Copies `.env.example` to `.env` if not present.
2. Installs workspace dependencies via `bun install`.
3. Validates Zerops platform manifests via `zcp-validate yaml import.yaml`.
4. Enforces architecture boundaries via `scripts/architecture-check.mjs`.
5. Compiles the Astro 5 SSR standalone server and React 19 client islands with exit code 0.

---

## 🛠️ Development Commands

```bash
# Start unified fullstack dev server on port :3000
bun run dev

# Build all workspaces
bun run build

# Run Architecture Guardian check
bun run check:arch

# Start production Astro SSR server
bun run start
```

---

## 🌐 Public Routes & Commercial Funnel

- **Landing Page (`/`)**: High-converting Astro 5 SSR landing with instant TTFB (&lt;10ms) and dynamic SEO.
- **Lead Magnet (`/gratis`)**: Sequential 2-step double opt-in (WhatsApp OTP via EvolutionGo $\to$ Lead in Frappe CRM $\to$ Email via Listmonk).
- **Checkout Funnel (`/checkout`)**: Pay-what-you-want ($1+ USD) via dLocal Go, Order Bump (Jyotish D10/Shadbala), 1-Click Upsell (BaZi + Kabbalah), Downsell (1:1 Coaching session).
- **Client Interactive Dossier (`/app`)**: Experiential client portal featuring animated SVG natal wheels and planetary positions.
- **Coach Strategic Cockpit (`/desk`)**: Private mentor cabinet protected by `COACH_MASTER_KEY` / Google OAuth allowlist. Analyzes Cognitive Architecture, Non-Self defense mechanisms, Tactical Questions, and Leverage Points.
- **Queues Dashboard (`/admin/queues`)**: Interactive Bull Board monitoring AI, WhatsApp, and astrology background workers.
- **Technical Documentation (`/docs`)**: Monorepo architecture and API reference.
