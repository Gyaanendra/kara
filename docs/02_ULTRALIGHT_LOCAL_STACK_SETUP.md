# 02. Ultralight Local Stack & Resource Optimization

## 1. Design Goal: Zero Strain on Local Laptop Hardware
Running multiple heavy Docker containers (MinIO, PostgreSQL, Qdrant, Redis, Django, FastAPI) locally consumes 3GB to 5GB of RAM and causes continuous CPU spikes.

Kara solves this by utilizing an **Ultralight Hybrid Strategy**:

| Service | Traditional Heavy Container | Kara Ultralight Strategy | RAM Consumed Locally |
| :--- | :--- | :--- | :--- |
| **Object Storage (S3)** | Local MinIO (~500MB RAM) | **Self-Hosted RustFS on Oracle VPS** | **0 MB (Offloaded)** |
| **Primary Database** | Local Postgres (~400MB RAM) | **Local SQLite File (`dev.db`)** | **~15 MB** |
| **Vector Database** | Qdrant / Weaviate (~600MB RAM) | **ChromaDB / Cloud Vector Endpoint** | **~40 MB** |
| **Job Queue Broker** | Celery + Redis Cluster (~300MB RAM) | **Minimal Alpine Redis (or Upstash Serverless)** | **~15 MB** |
| **Total Local RAM** | **~2.5 GB - 4 GB** | **Kara Hybrid** | **< 100 MB** |

---

## 2. Integration with Self-Hosted RustFS (S3 Compatible)

RustFS is a high-efficiency S3 implementation written in Rust running on an Oracle Cloud VPS (1 Core, 1 GB RAM).

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

### Why Presigned URLs Matter:
- When a meeting bot records audio, it requests a presigned PUT URL from Kara API.
- The bot uploads the audio stream directly to RustFS on Oracle Cloud.
- **Node.js and your laptop memory never buffer heavy MP3/WAV files.**

---

## 3. Centralized `.env` Single Source of Truth

All configuration is managed from the single root `.env` file:
- Toggle between SQLite (`DATABASE_PROVIDER="sqlite"`) and PostgreSQL (`DATABASE_PROVIDER="postgresql"`).
- Toggle vector engines between Chroma (`VECTOR_DB_PROVIDER=chroma`) and Qdrant (`VECTOR_DB_PROVIDER=qdrant`).
- Set S3 credentials for RustFS.

