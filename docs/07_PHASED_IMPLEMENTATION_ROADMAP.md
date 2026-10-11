# 07. Phased Implementation Roadmap

This roadmap breaks down the complete development of Kara AI into milestone-driven phases.
Each phase produces a concrete, testable deliverable before moving to the next.

---

## Phase 1: Monorepo Scaffolding & Environment (COMPLETE)

- [x] Initialized Turborepo monorepo with `pnpm workspaces` (Turborepo 2.11+, pnpm 12+).
- [x] Scaffolded `@kara/shared-types` with Zod validation and core domain enums.
- [x] Scaffolded `apps/api` with NestJS 11 Core, BullMQ, and Mastra modules.
- [x] Scaffolded `apps/web` with Next.js 16 (React 19, Tailwind CSS v4, TanStack Query/Table, Zustand).
- [x] Configured single `.env` supporting local native PostgreSQL 18.6 (`kara_dev`), pgvector, and self-hosted RustFS S3.
- [x] Verified full monorepo compilation (`turbo build`) passing 100%.
- [x] Created numbered architecture and feature documentation in `docs/`.
- [x] Created professional README with brand logo SVGs.

---

## Phase 2: Full-Stack Schema Design & Data Architecture (COMPLETE)

> **Goal**: Produce a complete, reviewed blueprint of every table, relation, API endpoint,
> and frontend route BEFORE writing any implementation code. This ensures the backend,
> frontend, and AI pipeline all agree on identical data contracts.

### 2A. Database Schema Design (PostgreSQL 18 Native + pgvector)

- [x] **Entity-Relationship Diagram (ERD)**: Full Mermaid ER diagram covering all PostgreSQL tables and relations.
- [x] **Users & Auth Domain**:
  - `organizations`, `users`, `org_memberships` tables.
  - Native PostgreSQL `pgEnum` for roles (`MEMBER`, `ADMIN`, `SUPERADMIN`) and membership statuses (`PENDING`, `ACTIVE`, `SUSPENDED`).
  - Auth strategy decision (NextAuth.js / custom JWT).
- [x] **Meeting Intelligence Domain**:
  - `meetings` -- lifecycle states (`SCHEDULED`, `BOT_JOINING`, `RECORDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`).
  - `recordings` -- S3 object references in RustFS, duration, file size.
  - `transcripts` -- full transcript documents linked to a recording.
  - `utterances` -- individual speaker turns with timestamps (`timestamptz`), start/end offset ms, speaker ID, and text.
  - `meeting_participants` -- join table linking users/contacts to meetings with role (`HOST`, `ATTENDEE`, `BOT`).
- [x] **MOM (Minutes of Meeting) Domain**:
  - `moms` -- generated summary document linked to a meeting.
  - `mom_decisions` -- extracted key decisions with context quotes.
  - `mom_action_items` -- extracted action items with assignee, deadline, source utterance reference.
- [x] **Twenty CRM Custom Data Engine**:
  - `crm_objects` -- dynamic entity definitions (name, icon, description, org-scoped).
  - `crm_fields` -- field definitions per object (`TEXT`, `NUMBER`, `SELECT`, `MULTI_SELECT`, `DATE`, `RELATION`, `URL`, `EMAIL`, `PHONE`, `BOOLEAN`).
  - `crm_records` -- dynamic data rows using native PostgreSQL `jsonb` with GIN indexing.
  - `crm_relations` -- cross-object relation links.
- [x] **Kanban & Task OS**:
  - `kanban_boards` -- board definitions (per org, per project, per meeting).
  - `kanban_columns` -- ordered columns with status mapping.
  - `tasks` -- cards with title, description, priority, assignee, due date, source (`MANUAL` / `AI_EXTRACTED`).
  - `task_comments` -- threaded comments on tasks.
  - `task_activity_log` -- audit trail of status changes, assignments, edits.
- [x] **AI & Vector Domain (pgvector)**:
  - `chat_sessions` -- conversation threads between user and Kara AI.
  - `chat_messages` -- individual messages with role, content, citations, and Laya router confidence.
  - `vector_documents` -- native `vector(1536)` embedding storage with HNSW index and temporal metadata (`meeting_status`, `meeting_timestamp_ms`).
- [x] **Index & Performance Strategy**:
  - HNSW index on `vector_documents (embedding vector_cosine_ops)`.
  - Composite B-tree indexes for temporal guardrails (`meeting_status, meeting_timestamp_ms`).
  - GIN indexes on `crm_records (data)`.

### 2B. API Design & Endpoint Map

- [x] **RESTful Resource Map**: Document every endpoint with HTTP method, path, request/response Zod schemas, and auth requirements:
  - `/api/auth/*` -- Authentication flow.
  - `/api/meetings/*` -- CRUD, status transitions, participant management.
  - `/api/transcripts/*` -- Fetch, search, stream utterances.
  - `/api/moms/*` -- Generated summaries, decisions, action items.
  - `/api/crm/objects/*` -- Dynamic CRUD for custom entities.
  - `/api/crm/fields/*` -- Field definition management.
  - `/api/crm/records/*` -- Record CRUD with dynamic JSONB data.
  - `/api/tasks/*` -- Kanban task CRUD, status transitions, bulk operations.
  - `/api/chat/*` -- SSE streaming chat with Kara AI agent.
  - `/api/storage/*` -- Presigned URL generation for RustFS S3.
- [x] **WebSocket / SSE Channels**: Real-time meeting status updates, live transcription, bot health.
- [x] **Error Response Contract**: Standardized error shape (`{ code, message, details }`).

### 2C. Frontend Route & Page Map

- [x] **App Router Structure**:
  - `/` -- Dashboard (recent meetings, upcoming, quick stats).
  - `/meetings` -- Meeting list with filters and search.
  - `/meetings/[id]` -- Meeting detail (transcript viewer, audio player, MOM tabs).
  - `/tasks` -- Kanban board view with drag-and-drop.
  - `/crm` -- CRM object list.
  - `/crm/[objectSlug]` -- Dynamic table view for a CRM object.
  - `/chat` -- Full-page AI chat with Kara.
  - `/settings` -- Org settings, integrations, user management.
- [x] **Component Inventory**: Sidebar, CommandPalette, TranscriptViewer, KanbanBoard, CRMTable, ChatDrawer, AudioPlayer.
- [x] **State Management Plan**: Zustand (client state) vs TanStack Query (server cache) vs URL params.

### 2D. Laya Decision Model Integration Plan

- [x] **Pipeline Placement**:
  - **Post-Transcription Classifier** -- Categorizes utterances into `action_item`, `decision`, `question`, `information`.
  - **RAG Relevance Scorer** -- Scores similarity chunks before passing to Mastra.
  - **Query Router** -- Fast reflex routing of user chat messages.
  - **Meeting Auto-Tagger** -- Tags meetings into `STANDUP`, `CLIENT_CALL`, `ONE_ON_ONE`, etc.
  - **Content Guard** -- Safety checks prior to indexing.

---

## Phase 3: Data Models & Persistence Layer (`packages/db`) (COMPLETE)

> **Goal**: Implement the schemas designed in Phase 2 as actual Drizzle PostgreSQL ORM models with migrations against local PostgreSQL 18.6.

- [x] Set up Drizzle ORM configured for PostgreSQL 18 with `pgvector` support (`drizzle-orm/pg-core`).
- [x] Implement all table schemas from Phase 2A ERD.
- [x] Generate and apply initial migration using `drizzle-kit`:
  - `pnpm db:generate`
  - `pnpm db:migrate`
- [x] Write seed script to populate:
  - 2 sample organizations with 5 users each.
  - 10 sample meetings across different types and statuses.
  - Sample transcripts with realistic utterances.
  - 3 custom CRM objects (Deals, Partners, Candidates) with sample records.
  - Sample Kanban board with tasks in various statuses.
- [x] Export typed query helpers from `@kara/db` for use by `apps/api`.

---

## Phase 4: NestJS Backend Core & BullMQ Pipeline (`apps/api`) (COMPLETE)

- [x] Configure BullMQ queues on Redis:
  - `bot-dispatch`: Coordinates bot launching and timeouts.
  - `transcription`: Downloads audio from RustFS S3 and invokes Deepgram Nova-3 Multilingual API (`detect_language=true`) with speaker diarization.
  - `utterance-classification`: Runs Laya classifier on each utterance batch.
  - `mom-synthesis`: Triggers Mastra workflow to produce meeting summaries.
  - `rag-indexing`: Embeds transcript chunks directly into PostgreSQL 18 via `pgvector`.
  - `meeting-tagging`: Runs Laya meeting type classifier post-MOM.
- [x] Implement S3 Presigned URL Service for RustFS on Oracle Cloud.
- [x] Implement REST & SSE Endpoints (per Phase 2B design).
- [x] Implement error handling middleware and Zod request validation.

---

## Phase 5: Laya Decision Model Integration (`packages/laya`) (COMPLETE)

- [x] Create `packages/laya/` workspace package:
  - `server.py` -- FastAPI micro-service wrapping the Laya Router.
  - `schemas/` -- JSON question schema files for utterance classification, query routing, relevance scoring, and meeting tagging.
- [x] Implement Laya Router reflex endpoints for instant ~33ms inference:
  - `POST /classify-utterance`
  - `POST /score-relevance`
  - `POST /route-query`
  - `POST /tag-meeting`
  - `POST /check-content`
- [x] NestJS `LayaService` in `apps/api/src/ai/laya.service.ts` connecting to sidecar with high-speed built-in reflex fallback.

---

## Phase 6: Mastra.ai Agentic Workflows & Non-Hallucinatory RAG (COMPLETE)

- [x] Configure Groq as default LLM reasoning provider (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) and Deepgram Nova-3 (`detect_language=true`) as default STT provider.
- [x] Implement non-hallucinatory search tools using `pgvector`:
  - `getPastMeetings`: Strictly queries completed past meetings (`status = 'COMPLETED' AND actual_start_at <= NOW()`).
  - `getUpcomingSchedule`: Queries scheduled calendar events (`status = 'SCHEDULED' AND scheduled_start_at > NOW()`).
  - `searchKnowledgeBase`: Hybrid vector search on `vector_documents` with mandatory temporal filters.
- [x] Laya-Powered Query Routing and Relevance Filtering (33ms reflex).
- [x] Automated MOM Synthesis with executive summaries, finalized decisions, and audio-linked action items.
- [x] Conversational AI Chat endpoint (`/api/ai/chat/ask`) with verified audio timestamp citation pills.

---

## Phase 7: Next.js 16 Frontend (Notion / Twenty CRM Aesthetic) (`apps/web`) (COMPLETE)

- [x] Global layout: Collapsible Notion-style sidebar, Cmd+K command palette, dark/light theme tokens, and live telemetry indicators.
- [x] **Dashboard (`/`)**: Executive KPI metrics, recent meetings feed, upcoming bot dispatch widget, and quick action item cards.
- [x] **Meeting Intelligence Hub (`/meetings`)**: Waveform audio scrubber synced to Deepgram Nova-3 multilingual diarized utterances, Laya classification tags, and MOM decision review with 1-click task promotion.
- [x] **Notion-Style Task & Kanban Board (`/tasks`)**: Multi-column board (To Do, In Progress, Done) with priority badges, assignee avatars, and clickable audio deep links.
- [x] **Twenty CRM Data Explorer (`/crm`)**: Dynamic entity selector (Deals, Partners, Candidates) and custom schema table backed by PostgreSQL JSONB.
- [x] **Kara AI Chat Assistant (`/chat`)**: Grounded conversational thread with Laya intent pills and clickable audio timestamp citation chips.

---

## Phase 8: Stateless Meeting Bot Runner & End-to-End Testing (COMPLETE)

- [x] Stateless meeting bot runner (`apps/meeting-bot/src/runner.ts`) streaming audio directly to S3 without database locking.
- [x] Automated E2E verification test suite (`scripts/test-e2e.ts`) validating all 7 intelligence phases.
- [x] Verified zero database locks under multi-worker concurrent loads via PostgreSQL 18 MVCC.
- [x] Verified non-hallucinatory RAG accuracy against ground truth meeting records.

---

## Phase Summary

| Phase | Name | Target Stack | Key Deliverable |
| :---: | :--- | :--- | :--- |
| 1 | Monorepo Scaffolding | Turborepo, pnpm | Build-passing workspace & env [COMPLETE] |
| 2 | Schema Design & Architecture | PostgreSQL 18 + pgvector (Design) | ERD, API map, route map, Laya plan [COMPLETE] |
| 3 | Data Models & Persistence | PostgreSQL 18 + Drizzle ORM | Working PG database with seed data [COMPLETE] |
| 4 | NestJS Backend & BullMQ | NestJS 11, Redis, BullMQ | REST API + async job pipeline [COMPLETE] |
| 5 | Laya Decision Model | Python, FastAPI, Laya Router | Local reflex decision sidecar [COMPLETE] |
| 6 | Mastra RAG & AI Agent | Groq, Deepgram, pgvector | Zero-hallucination conversational RAG [COMPLETE] |
| 7 | Next.js Frontend | Next.js 16, React 19, Tailwind v4 | Notion / Twenty CRM UI experience [COMPLETE] |
| 8 | Meeting Bot & E2E Testing | TypeScript, S3, Deepgram | Full end-to-end meeting automation [COMPLETE] |
