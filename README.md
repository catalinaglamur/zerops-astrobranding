# Zerops AstroBranding Sovereign Platform

Enterprise-grade AstroBranding & Sovereign Business Intelligence monorepo template for Zerops Incus LXC runtimes.

## Stack
- **Web & Presentation**: Astro 5 SSR + Tailwind CSS 4
- **Engine & Orchestration**: Bun 1.4 + Hono.dev
- **Data & Cache**: PostgreSQL 18 with pgvector, Valkey 7.2
- **Event Mesh**: NATS Server 2.12 with JetStream
- **Storage**: POSIX Local Storage + S3 Object Storage
- **AI Mesh**: Maxim AI Bifrost + FreeLLMAPI + Nous Hermes-Agent
- **Messaging**: EvolutionGo WhatsApp Engine

## Verification
- Health Check: `GET /health` -> `HTTP 200`
