# RAG Vector Architecture: pgvector to Qdrant Operational Runbook

## 1. Architectural Overview & Separation of Concerns

In this sovereign Zerops ecosystem, vector operations are segregated into two distinct layers to prevent resource contention and minimize operational cost:

```
[ Incoming Requests / Chats ]
          │
          ▼
┌───────────────────────────────────────────────┐
│ Layer 1: LLM Gateway & Prompt Cache (Bifrost) │
│ - Engine: Embedded chromem (in-process Go)    │
│ - Storage: /mnt/localstorage/bifrost/chromem │
│ - Purpose: Direct & Semantic hash cache       │
│ - Extra Services: 0 (Runs in Bifrost memory)  │
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ Layer 2: Application Knowledge RAG            │
│ - Workloads: WhatsApp (Evolution) & Web (Astro)│
│ - Phase 1 (Current): pgvector (PostgreSQL 18) │
│ - Phase 2 (Target): Qdrant (qdrant:single@1.12)│
└───────────────────────────────────────────────┘
```

---

## 2. Phase 1: Native pgvector on PostgreSQL 18

### 2.1 Why pgvector for Initial to Moderate Traffic
* **Zero Additional Infrastructure**: Leverages the existing managed `database:single@18` service. No extra monthly container cost on Zerops.
* **Transactional ACID Joins**: Allows querying vector embeddings alongside relational tenant data, user profiles, and order tables in a single SQL statement:
  ```sql
  SELECT d.id, d.title, d.content,
         1 - (d.embedding <=> $1) AS cosine_similarity
  FROM knowledge_documents d
  JOIN organization_tenants t ON d.tenant_id = t.id
  WHERE t.slug = $2 AND d.status = 'published'
  ORDER BY d.embedding <=> $1
  LIMIT 5;
  ```
* **Performance Profile**: Sub-15ms vector retrieval for collections up to 300,000 vectors with HNSW indexes.

### 2.2 Indexing Best Practices for PostgreSQL 18
Always use HNSW (Hierarchical Navigable Small World) indexes with cosine or inner product distance:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Recommended HNSW index configuration
CREATE INDEX idx_knowledge_embeddings_hnsw 
ON knowledge_documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 3. Saturation Sensors: How to Detect When pgvector is Near Capacity

Run these diagnostic queries periodically or integrate them into telemetry alerts.

### 3.1 Buffer Cache Hit Ratio for Vector Index
If the index does not fit into RAM, PostgreSQL performs slow disk reads:
```sql
SELECT 
  relname AS index_name,
  idx_blks_hit,
  idx_blks_read,
  ROUND(100.0 * idx_blks_hit / NULLIF(idx_blks_hit + idx_blks_read, 0), 2) AS cache_hit_pct
FROM pg_statio_user_indexes
WHERE relname LIKE '%hnsw%' OR relname LIKE '%vector%';
```
* **Healthy**: `cache_hit_pct` > 98%
* **Warning**: `cache_hit_pct` between 90% and 98%
* **Critical Saturation**: `cache_hit_pct` < 90% (HNSW graph is being swapped to disk).

### 3.2 Index Scan vs Sequential Scan Ratio
Ensures the query planner is actually utilizing the vector index instead of falling back to exhaustive sequential table scans:
```sql
SELECT 
  relname AS table_name,
  seq_scan,
  idx_scan,
  ROUND(100.0 * idx_scan / NULLIF(seq_scan + idx_scan, 0), 2) AS index_usage_pct
FROM pg_stat_user_tables
WHERE relname = 'knowledge_documents';
```
* **Critical**: `seq_scan` rapidly growing while `idx_scan` remains flat.

### 3.3 Query Latency & Shared Buffer Eviction
Check if vector queries are dominating database execution time:
```sql
SELECT 
  query,
  calls,
  ROUND(total_exec_time::numeric, 2) AS total_ms,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(max_exec_time::numeric, 2) AS max_ms
FROM pg_stat_statements
WHERE query LIKE '%<=>%' OR query LIKE '%<->%'
ORDER BY mean_exec_time DESC
LIMIT 5;
```

---

## 4. Hard Migration Triggers (When to Switch to Qdrant)

Trigger the migration runbook when **any two** of the following conditions are met:

1. **Volume**: Total stored vectors exceed **300,000 vectors** (for 1536-dim embeddings like OpenAI `text-embedding-3-small`) or **150,000 vectors** (for 3072-dim embeddings).
2. **Latency**: p95 vector search query latency consistently exceeds **50ms** under normal load.
3. **RAM Contention**: The PostgreSQL container in Zerops sustains > 80% RAM utilization, or memory allocations for HNSW (`m * ef_construction`) start evicting standard relational tables (`orders`, `users`, `chats`).
4. **Throughput**: Concurrent vector queries exceed **50 queries per second (QPS)**, causing lock contention on transactional database connections.

---

## 5. Zero-Downtime Migration Runbook: pgvector to Zerops Qdrant

### Step 1: Provision Qdrant Service in Zerops
Add Qdrant to `zerops.yaml` or provision via Zerops GUI/CLI:
```yaml
# In Zerops import recipe:
services:
  - hostname: qdrant
    type: qdrant:single@1.12
    mode: NON_HA
    verticalAutoscaling:
      minRam: 0.5
      maxRam: 2.0
```

### Step 2: Establish Dual-Write Pattern
Update your ingestion services (e.g. Astro or Evolution WhatsApp webhook):
* On document create/update:
  1. Write document metadata & text to PostgreSQL (SSoT).
  2. Write embedding & payload asynchronously to Qdrant collection:
     ```typescript
     // Pseudocode
     await qdrantClient.upsert('knowledge_base', {
       points: [{
         id: doc.id, // UUID v4 or integer ID matching Postgres
         vector: embeddingArray,
         payload: {
           tenant_id: doc.tenant_id,
           category: doc.category,
           content_preview: doc.content.slice(0, 300),
           updated_at: doc.updated_at
         }
       }]
     });
     ```

### Step 3: Historical Backfill
Execute a batch streaming script from the `zcp` container:
```bash
# Streams rows from Postgres in batches of 500 and inserts into Qdrant
node scripts/migrate-pgvector-to-qdrant.mjs
```

### Step 4: Shadow Read Verification
Run search queries against both engines in shadow mode for 48 hours:
* Compare top-5 nearest neighbor recall between `PostgreSQL` and `Qdrant`.
* Measure latency reduction (typically drops from ~30ms in Postgres to ~2ms in Qdrant).

### Step 5: Read Cutover
Switch application retrieval code (`rag.search()`) to query Qdrant directly.

### Step 6: Reclamation of PostgreSQL Resources
Once Qdrant is serving 100% of vector queries:
```sql
-- Reclaim shared_buffers and disk memory in PostgreSQL
DROP INDEX IF EXISTS idx_knowledge_embeddings_hnsw;
ALTER TABLE knowledge_documents DROP COLUMN IF EXISTS embedding;
VACUUM FULL knowledge_documents;
```
PostgreSQL returns to a lean, dedicated relational OLTP engine, while Qdrant independently scales vector search.
