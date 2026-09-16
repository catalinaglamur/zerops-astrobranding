# Zerops AstroBranding Sovereign Platform (Template Monorepo)

> High-Performance, Sovereign Business Intelligence & Astrological Monorepo Template for Zerops Incus LXC Runtimes.  
> Inspired by the best of [`di-sukharev/vibe`](https://github.com/di-sukharev/vibe) and [`xanthous-tech/hono-astro-remix-template`](https://github.com/xanthous-tech/hono-astro-remix-template).

---

## 🏛️ Architecture Overview

The repository is organized as a **Bun Workspaces Monorepo** managing a **Sovereign Mesh of 10 Services** (5 application runtimes + 5 stateful managed services):

```
├── apps/
│   ├── astrobranding/      # Core API Gateway (Bun 1.4 + Hono.dev + BullMQ + Bull Board)
│   ├── website/            # Public Website, Landing & Docs (Astro 5 SSG)
│   ├── webapp/             # Authenticated Client Cockpit (React 19 + Vite CSR)
│   ├── bifrost/            # Maxim AI Enterprise Gateway (Go v2.0.0, CEL routing, Valkey cache)
│   ├── freellmapi/         # Multi-Provider Free LLM Proxy (Node.js 22, SQLite on POSIX storage)
│   ├── evolution/          # Native WhatsApp Engine (Go whatsmeow, NATS JetStream event stream)
│   └── hermes/             # Autonomous Copilot (Python 3.12 Ubuntu invariant, ChatML, NATS bridge)
├── packages/
│   ├── contracts/          # Zod 4 Schemas & Universal DTOs (SSoT)
│   ├── database/           # PostgreSQL 18 + pgvector HNSW + native uuidv7() (Drizzle ORM)
│   └── engine/             # Typed Microservice SDKs (Bifrost, FreeLLMAPI, Evolution, NATS)
├── scripts/
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
4. Compiles the Astro static site and Vite React webapp with exit code 0.

---

## 🛠️ Development Commands

```bash
# Start Core API Gateway on port :3000 (with /admin/queues Bull Board)
bun run dev

# Start Astro 5 website dev server on port :4321
bun run dev:website

# Start React 19 webapp dev server on port :5173
bun run dev:webapp

# Build all applications and packages
bun run build
```

---

## 🌐 The 10-Service Sovereign Mesh

| Service | Type / Base | Port | Description |
|---|---|---|---|
| **`astrobranding`** | `ubuntu/bun@1.3.9` | `:3000` | Hono API + BullMQ queue processing + Bull Board (`/admin/queues`) |
| **`bifrost`** | `alpine/go@1.22` | `:8080` | Maxim AI Gateway with CEL adaptive routing and Valkey semantic cache |
| **`freellmapi`** | `ubuntu/nodejs@22` | `:3001` | Multi-provider free LLM proxy (34+ providers) with persistent SQLite |
| **`evolution`** | `alpine/go@1.22` | `:8085` | Native WhatsApp messaging engine streaming webhooks to NATS JetStream |
| **`hermes`** | `ubuntu/python@3.12` | `:8000` | Nous Research Hermes-Agent autonomous copilot with ChatML loop |
| **`database`** | `postgresql:single@18` | `:5432` | PostgreSQL 18 with `pgvector` HNSW indexes and native `uuidv7()` |
| **`valkey`** | `valkey:single@7.2` | `:6379` | In-memory cache, rate limiting, and BullMQ queue backend |
| **`nats`** | `nats:single@2.12` | `:4222` | NATS Server JetStream high-speed event and RPC broker |
| **`objectstorage`** | `object-storage` | S3 | Persistent storage for charts, PDFs, SVGs, and WhatsApp attachments |
| **`localstorage`** | `local-storage:single@1` | POSIX | Persistent volume for SQLite databases and WhatsApp session keys |

---

## 🚢 Deployment on Zerops

1. **Provision Infrastructure**:
   ```bash
   zcp-validate yaml import.yaml
   # Import services into your Zerops project
   ```
2. **Push to GitHub**:
   ```bash
   git push origin main
   ```
   GitHub Actions automatically deploys the 5 runtime services to Zerops using `zeropsio/actions@v1.0.2`.
