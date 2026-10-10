# 02. PostgreSQL 18 Native Local Stack & Resource Optimization

## 1. Design Goal: Production Parity with Zero Laptop Strain

Running multiple heavy Docker containers (MinIO, Qdrant, Chroma, Celery, multiple databases) locally consumes 3GB to 5GB of RAM and causes continuous CPU spikes.

Kara solves this by utilizing a **PostgreSQL 18 Native + Offloaded Storage Strategy**:

| Service | Traditional Container Setup | Kara PostgreSQL Native Strategy | RAM Consumed Locally |
| :--- | :--- | :--- | :--- |
| **Object Storage (S3)** | Local MinIO (~500MB RAM) | **Self-Hosted RustFS on Oracle VPS** | **0 MB (Offloaded)** |
| **Primary Relational DB** | Heavy Docker Postgres (~500MB) | **Local Native PostgreSQL 18.6** | **~80-120 MB (Lean & Fast)** |
| **Vector Database** | Separate Qdrant/Chroma (~600MB) | **PostgreSQL 18 `pgvector` Extension** | **0 MB (Consolidated in PG)** |
| **Job Queue Broker** | Celery + Redis Cluster (~300MB) | **Minimal Local Redis / KeyDB** | **~20 MB** |
| **Total Local RAM** | **~2.5 GB - 4 GB** | **Kara Native Stack** | **~100 - 150 MB** |

---

## 2. Why PostgreSQL 18 Native Over SQLite + Chroma

1. **Elimination of Database Lock Contention**:
   SQLite's single-writer architecture caused `OperationalError: database is locked` in the previous prototype whenever multiple workers inserted utterances or updated task statuses. PostgreSQL 18 provides MVCC (Multi-Version Concurrency Control) with non-blocking reads and row-level writes.
2. **Unified Relational & Vector Storage (`pgvector`)**:
   Instead of synchronizing two different databases (e.g. SQLite for records, ChromaDB for vectors), `pgvector` stores embeddings directly in PostgreSQL 18. Queries can atomically combine relational filters (`WHERE status = 'COMPLETED' AND meeting_timestamp <= NOW()`) with vector cosine similarity (`ORDER BY embedding <=> $queryVector LIMIT 5`) in a single query plan.
3. **Native JSONB for Twenty CRM Custom Objects**:
   PostgreSQL 18 features industry-standard `JSONB` support with GIN indexing (`@>` contains queries, JSON path expressions), which powers Kara's dynamic CRM custom entity engine without custom JSON parsing hacks.
4. **Zero Dialect Drift**:
   Dev and production use the exact same Drizzle PostgreSQL schemas (`pgTable`, `timestamptz`, `pgEnum`, `jsonb`, `numeric`). No dual-dialect maintenance or migration surprises.

---

## 3. Local PostgreSQL 18 Setup & Verification

Kara runs against your local PostgreSQL 18.6 installation on Windows:

### A. Create the Database and Enable pgvector

Open PowerShell and connect via `psql` (or pgAdmin):

```powershell
# Connect to PostgreSQL 18
& "D:\postgres18.6in\psql.exe" -U postgres -h localhost -p 5432
```

Run the SQL setup commands:

```sql
-- 1. Create Kara development database
CREATE DATABASE kara_dev;

-- 2. Connect to kara_dev
\c kara_dev;

-- 3. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 4. Verify extension installation
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

### B. Health Verification

Verify that the PostgreSQL service is accepting connections:
```powershell
& "D:\postgres18.6in\pg_isready.exe" -h localhost -p 5432
# Output: localhost:5432 - accepting connections
```

---

## 4. Integration with Self-Hosted RustFS (S3 Compatible)

Audio storage is completely offloaded to your self-hosted **RustFS** running on an Oracle Cloud VPS (1 Core, 1 GB RAM).

Kara communicates with RustFS using standard AWS S3 SDK protocols via presigned URLs:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // e.g. http://YOUR_ORACLE_IP:PORT
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // Required for self-hosted RustFS
});
```

### Why Presigned URLs Keep Your Laptop Fast:
- When a meeting bot records audio, it requests a presigned PUT URL from the Kara API.
- The bot streams audio chunks directly to RustFS on Oracle Cloud.
- **Node.js, NestJS, and your laptop memory never buffer heavy MP3/WAV files.**

---

## 5. Centralized Configuration in `.env`

All configuration lives in the single root `.env` file:
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/kara_dev?schema=public"
DATABASE_PROVIDER="postgresql"

# Vector Store
VECTOR_DB_PROVIDER="pgvector"

# S3 (RustFS on Oracle Cloud)
S3_ENDPOINT="http://YOUR_ORACLE_IP:PORT"
S3_ACCESS_KEY_ID="your_rustfs_key"
S3_SECRET_ACCESS_KEY="your_rustfs_secret"
S3_BUCKET_NAME="kara-recordings"
S3_FORCE_PATH_STYLE="true"

# Redis
REDIS_URL="redis://localhost:6379"
```
