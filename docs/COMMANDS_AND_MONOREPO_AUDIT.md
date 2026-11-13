# Kara AI — Monorepo Run Commands & Audit Guide

> **Current Architecture:** Turborepo + pnpm workspace with Next.js 16, NestJS 12, PostgreSQL 18 (`pgvector`), Drizzle ORM, BullMQ, and Python FastAPI Laya Sidecar.

---

## 1. Quick Monorepo Overview

| Directory | Type | Description | Status |
| :--- | :--- | :--- | :--- |
| `apps/web` | Next.js 16 (App Router) | Adaptive Desktop UI, Executive Dashboard, Theme Engine | **Core** |
| `apps/api` | NestJS 12 + BullMQ | Central API, Deepgram Nova-3, Groq MOM, Mastra RAG | **Core** |
| `packages/db` | Drizzle ORM (PG 18) | Relational & Vector schemas, migrations, seeders | **Core** |
| `packages/shared-types`| TypeScript Library | Shared DTOs, Enums, and interfaces across all packages | **Core** |
| `packages/laya` | Python (FastAPI) | 33ms Reflex Decision Router & Utterance Classifier | **Optional Sidecar** |
| `apps/meeting-bot` | TypeScript Runner | Headless Chromium meeting bot lifecycle simulation | **On-Demand Worker** |
| `packages/ui` | Directory | Empty directory; UI components currently live in `apps/web` | ⚠️ **Extra / Unused** |

---

## 2. Environment Setup (.env)

Before starting the servers, ensure the root `.env` file exists (copied from `.env.example`):

```powershell
# Copy template to .env
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kara_dev"
REDIS_URL="redis://localhost:6379"
DEEPGRAM_API_KEY="your_deepgram_api_key"
GROQ_API_KEY="your_groq_api_key"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## 3. How to Run the Server

### Option A: The Full Monorepo (All-in-One via Turborepo)

To spin up all core development servers simultaneously:

```powershell
pnpm dev
```
*Runs `apps/web` on `http://localhost:3000`, `apps/api` on `http://localhost:4000`, `@kara/db` watcher, and `@kara/shared-types` compiler.*

---

### Option B: Modular Run (Service-by-Service in Separate Terminals)

Running services individually provides clearer logs and isolated debugging:

#### Step 1: Start Infrastructure (Postgres & Redis)
If using Docker for Postgres + Redis:
```powershell
docker compose up -d postgres redis
```
*(If you run local PostgreSQL 18 natively on port 5432 and local Redis on 6379, you don't even need Docker).*

#### Step 2: Push Database Schema & Seed Data
```powershell
# Push Drizzle schema directly to PostgreSQL 18
pnpm --filter @kara/db db:push

# (Optional) Seed the database with sample meetings and CRM data
pnpm --filter @kara/db db:seed
```

#### Step 3: Run the API Gateway (NestJS Backend)
```powershell
pnpm --filter api dev
```
*Listens on: **`http://localhost:4000`** (Swagger / API root at `/api`).*

#### Step 4: Run the Frontend (Next.js Web App)
```powershell
pnpm --filter web dev
```
*Listens on: **`http://localhost:3000`**.*

#### Step 5: (Optional) Run the Laya Python Decision Sidecar
The Laya sidecar provides 33ms reflex classification and semantic query routing:
```powershell
cd packages/laya
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```
*Listens on: **`http://localhost:8001`**.*
*(Note: If Laya is not running, the NestJS API automatically falls back to its built-in rule heuristics, so the app will still function seamlessly).*

#### Step 6: (On-Demand) Run the Meeting Bot Ingestion Simulation
To test the end-to-end bot lifecycle (join call -> presigned S3 audio upload -> Deepgram transcription -> Groq MOM synthesis):
```powershell
# Ensure apps/api is running first, then run:
pnpm --filter @kara/meeting-bot bot:run
```

---

## 4. Useful Helper Commands

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Drizzle Studio (GUI)** | `pnpm --filter @kara/db db:studio` | Visual web interface for PostgreSQL tables on port 4983 |
| **End-to-End Test** | `npx tsx scripts/test-e2e.ts` | Validates health, meeting ingestion, and RAG pipelines |
| **Build Entire Monorepo**| `pnpm build` | Verifies TypeScript compilation and production builds |
| **Type Check All** | `pnpm check-types` | Type-checks all workspaces |
| **Clean Build Artifacts** | `pnpm clean` | Removes `.turbo`, `dist`, and cache |

---

## 5. Audit: What Parts Are "EXTRA" in This Monorepo

Here is a breakdown of redundant, legacy, or auxiliary components currently in the repository:

### 1. ⚠️ Completely Empty / Redundant Package
* **`packages/ui/`**:
  * **Status**: Empty folder.
  * **Why it's extra**: Originally scaffolded by Turborepo as a shared UI package, but all active UI components (`AvatarStack`, `PillButton`, `SearchInput`, `StatusBadge`, `ProgressBar`) are directly implemented in `apps/web/src/components/ui/`.
  * **Recommendation**: Safe to delete or leave empty.

### 2. ⚠️ Legacy Frontend Components (`apps/web/src/components/`)
From earlier iterations ("Fulcrum" and "Meera" design phases), several components are unreferenced and superseded:
* **`apps/web/src/components/layout/FulcrumSidebar.tsx`**: Legacy sidebar using old "Fulcrum" branding. Superseded by `KaraSidebar.tsx`.
* **`apps/web/src/components/layout/PrimaryRail.tsx`**: Leftover 2-column rail navigation. Superseded by `KaraSidebar.tsx`.
* **`apps/web/src/components/layout/SecondarySidebar.tsx`**: Leftover second column sidebar. Superseded by `KaraSidebar.tsx`.
* **`apps/web/src/components/Sidebar.tsx`**: Basic starter boilerplate sidebar. Never imported.
* **`apps/web/src/components/Header.tsx`**: Basic starter boilerplate header. Never imported (superseded by `BreadcrumbHeader.tsx`).
* **Recommendation**: These 5 files can be safely deleted or moved to an archive folder to eliminate clutter.

### 3. ⚠️ Legacy References in `docker-compose.yml`
* **Container Names**: Still prefixed with `meera-*` (`meera-postgres`, `meera-redis`, `meera-minio`, `meera-qdrant`) instead of `kara-*`.
* **`qdrant` & `minio` Services**: 
  * In the updated architecture, vector storage is handled directly inside PostgreSQL 18 via the native `pgvector` extension, eliminating the need for a separate Qdrant container.
  * Audio storage is designed to point to external RustFS or S3 (as configured in `.env`).
  * **Recommendation**: If running Postgres & Redis locally, `minio` and `qdrant` in `docker-compose.yml` are optional.

### 4. ℹ️ `packages/laya` (Optional vs Extra)
* **Status**: Working Python FastAPI service.
* **Why it might feel extra**: It requires a Python environment (`fastapi`, `uvicorn`, `pydantic`), whereas the rest of the monorepo is TypeScript/pnpm.
* **Architecture Reality**: It provides high-speed (33ms) utterance classification and semantic routing. If you don't run it, `apps/api/src/ai/laya.service.ts` has an automatic internal regex fallback, so it is strictly optional.

### 5. ℹ️ `apps/meeting-bot` (Runner vs Background Service)
* **Status**: Script runner (`runner.ts`).
* **Clarification**: It is not a persistent server that stays alive in the background; it is an on-demand process executed when you want to simulate a bot joining a call.

