# 07. Phased Implementation Roadmap

This roadmap breaks down the complete development of Kara AI into milestone-driven phases.
Each phase produces a concrete, testable deliverable before moving to the next.

---

## Phase 1: Monorepo Scaffolding & Ultralight Environment (COMPLETE)

- [x] Initialized Turborepo monorepo with `pnpm workspaces` (Turborepo 2.11+, pnpm 12+).
- [x] Scaffolded `@kara/shared-types` with Zod validation and core domain enums.
- [x] Scaffolded `apps/api` with NestJS 11 Core, BullMQ, and Mastra modules.
- [x] Scaffolded `apps/web` with Next.js 16 (React 19, Tailwind CSS v4, TanStack Query/Table, Zustand).
- [x] Configured single `.env` supporting local SQLite (`dev.db`), ChromaDB, and self-hosted RustFS S3.
- [x] Verified full monorepo compilation (`turbo build`) passing 100%.
- [x] Created numbered architecture and feature documentation in `docs/`.
- [x] Created professional README with brand logo SVGs.

---

## Phase 2: Full-Stack Schema Design & Data Architecture (2A COMPLETE, 2B-2D DESIGN ONLY)

> **Goal**: Produce a complete, reviewed blueprint of every table, relation, API endpoint,
> and frontend route BEFORE writing any implementation code. This prevents mid-build
> rewrites and ensures the backend, frontend, and AI pipeline all agree on the same data contracts.
>
> **Status note**: the 2A blueprint was implemented directly as executable Drizzle schema
> code rather than left as a paper design, because Drizzle's table builders *are* the
> schema definition — there is no separate artifact to keep in sync. The full reference
> for all 24 tables, the ERD, the query cookbook, and the index/migration strategy now
> lives in **[08. Database Schema Reference & Query Cookbook](./08_DATABASE_SCHEMA_REFERENCE_AND_QUERIES.md)**.
> Sections 2B, 2C, and 2D remain design-only and are still open.

### 2A. Database Schema Design (`packages/db`) -- COMPLETE

> Implementation: `packages/db/src/schema/` (6 modules, 24 tables) and
> `packages/shared-types/src/enums.ts` (all domain enums).
> Reference: [doc 08](./08_DATABASE_SCHEMA_REFERENCE_AND_QUERIES.md).

- [x] **Entity-Relationship Diagram (ERD)**: Full Mermaid ER diagram covering all tables and their relations. -> doc 08 §3.
- [x] **Users & Auth Domain**:
  - `users`, `organizations`, `org_memberships` tables. -> `schema/auth.ts`.
  - RBAC roles (`MEMBER`, `ADMIN`, `SUPERADMIN`) as the `UserRole` enum; per-org authority on `org_memberships.role`.
  - [ ] Permission matrix -- still open.
  - [ ] Auth strategy decision (NextAuth.js / Lucia / custom JWT) -- still open. `.env.example` currently carries `JWT_SECRET` / `JWT_EXPIRATION`, suggesting custom JWT.
- [x] **Meeting Intelligence Domain** (`schema/meetings.ts`):
  - `meetings` -- scheduled/active/completed meeting lifecycle, plus bot lifecycle columns and `meeting_type` (Laya auto-tagger output).
  - `recordings` -- S3 object references, duration, file size, checksum for webhook idempotency.
  - `transcripts` -- full transcript document linked to a recording, with retained `raw_payload`.
  - `utterances` -- individual speaker turns with `start_ms`/`end_ms`, speaker IDs, `sequence`, and Laya `type` + content-guard flags.
  - `meeting_participants` -- join table linking users to meetings with role (host/attendee/bot); `user_id` nullable for external guests.
- [x] **MOM (Minutes of Meeting) Domain** (`schema/mom.ts`):
  - `moms` -- generated summary document linked to a meeting (unique per meeting, for idempotent retries).
  - `mom_decisions` -- extracted key decisions with `context_quote` provenance.
  - `mom_action_items` -- extracted action items with assignee, deadline, and source utterance reference.
- [x] **Twenty CRM Custom Data Engine** (`schema/crm.ts`):
  - `crm_objects` -- dynamic entity definitions (name, icon, description, org-scoped).
  - `crm_fields` -- field definitions per object (type: TEXT, NUMBER, SELECT, MULTI_SELECT, DATE, RELATION, URL, EMAIL, PHONE, BOOLEAN).
  - `crm_records` -- actual data rows for each object, with a denormalized `data` JSON snapshot.
  - `crm_record_values` -- EAV store for dynamic field values, with per-type indexed columns.
  - `crm_relations` -- cross-object relation links, polymorphic to a CRM record or a Meeting.
- [x] **Kanban & Task OS** (`schema/kanban.ts`):
  - `kanban_boards` -- board definitions (per org, per project, per meeting).
  - `kanban_columns` -- ordered columns with `status` mapping.
  - `tasks` -- cards with title, description, priority, assignee, due date, `source` (manual / AI-extracted), and four provenance FKs.
  - `task_comments` -- threaded comments on tasks.
  - `task_activity_log` -- append-only audit trail of status changes, assignments, edits.
- [x] **AI & Vector Domain** (`schema/ai.ts`):
  - `chat_sessions` -- conversation threads between user and Kara AI.
  - `chat_messages` -- individual messages with role (user/assistant), content, citations, and the persisted Laya route decision.
  - `vector_documents` -- metadata tracking for what has been embedded (meeting_id, chunk_index, embedding_status).
- [x] **Index Strategy**: Documented in doc 08 §6 -- every index mapped to the query it serves, and the omitted ones justified.
- [x] **Migration Strategy**: Documented in doc 08 §7 -- SQLite (dev) vs PostgreSQL (prod) constraints, the table-rebuild limitation, 999-parameter ceiling, and a concrete port order.

### 2B. API Design & Endpoint Map (DESIGN ONLY -- NOT STARTED)

- [ ] **RESTful Resource Map**: Document every endpoint with HTTP method, path, request/response Zod schemas, and auth requirements.
  - `/api/auth/*` -- Authentication flow.
  - `/api/meetings/*` -- CRUD, status transitions, participant management.
  - `/api/transcripts/*` -- Fetch, search, stream utterances.
  - `/api/moms/*` -- Generated summaries, decisions, action items.
  - `/api/crm/objects/*` -- Dynamic CRUD for custom entities.
  - `/api/crm/fields/*` -- Field definition management.
  - `/api/crm/records/*` -- Record CRUD with dynamic field values.
  - `/api/tasks/*` -- Kanban task CRUD, status transitions, bulk operations.
  - `/api/chat/*` -- SSE streaming chat with Kara AI agent.
  - `/api/storage/*` -- Presigned URL generation for RustFS S3.
- [ ] **WebSocket / SSE Channels**: Document real-time events (meeting status updates, live transcription, bot health).
- [ ] **Error Response Contract**: Standardized error shape (`{ code, message, details }`).

### 2C. Frontend Route & Page Map

- [ ] **App Router Structure**: Map every Next.js route to its purpose and data dependencies.
  - `/` -- Dashboard (recent meetings, upcoming, quick stats).
  - `/meetings` -- Meeting list with filters and search.
  - `/meetings/[id]` -- Meeting detail (transcript viewer, audio player, MOM tabs).
  - `/tasks` -- Kanban board view with drag-and-drop.
  - `/crm` -- CRM object list.
  - `/crm/[objectSlug]` -- Dynamic table view for a CRM object.
  - `/chat` -- Full-page AI chat with Kara.
  - `/settings` -- Org settings, integrations, user management.
- [ ] **Component Inventory**: List of major reusable components needed (Sidebar, CommandPalette, TranscriptViewer, KanbanBoard, CRMTable, ChatDrawer, AudioPlayer).
- [ ] **State Management Plan**: Which data lives in Zustand (client state) vs TanStack Query (server cache) vs URL params.

### 2D. Laya Decision Model Integration Plan

- [ ] **Placement Architecture**: Document exactly where Laya sits in the data pipeline:
  - **Post-Transcription Classifier** -- After Whisper produces utterances, Laya classifies each as `action_item`, `decision`, `question`, `information` (choice type).
  - **RAG Relevance Scorer** -- Before surfacing retrieved chunks to the Mastra agent, Laya scores relevance (score type, 0-5).
  - **Query Router** -- When user sends a chat message, Laya routes to the correct tool: `MEETING_SEARCH`, `TASK_LOOKUP`, `CRM_QUERY`, `CALENDAR_CHECK`, `GENERAL_CHAT` (choice type).
  - **Meeting Auto-Tagger** -- After MOM generation, Laya classifies meeting type: `STANDUP`, `SPRINT_REVIEW`, `CLIENT_CALL`, `ONE_ON_ONE`, `BRAINSTORM`, `ALL_HANDS` (choice type).
  - **Content Guard** -- Before RAG indexing, Laya flags sensitive/inappropriate content (noul type).
- [ ] **Question Schema Library**: Pre-define the Laya question schemas for each use case (stored as JSON configs in `packages/laya/schemas/`).
- [ ] **Performance Budget**: Document expected latency per call (~33-40ms GPU, ~100-200ms CPU) and where it sits in the critical path vs background pipeline.

---

## Phase 3: Data Models & Persistence Layer (`packages/db`) -- IN PROGRESS

> **Goal**: Implement the schemas designed in Phase 2 as actual ORM models with migrations.

- [x] Set up Drizzle ORM (option chosen over Prisma; see doc 08 §1) configured for SQLite local dev with a documented PostgreSQL port path.
- [x] Implement all table schemas from Phase 2A ERD -- 24 tables across 6 modules, plus the domain enums in `@kara/shared-types`.
- [ ] Write and test migration scripts (create, seed, rollback) -- `drizzle-kit` is configured (`packages/db/drizzle.config.ts`) but no migration has been generated yet.
- [ ] Write seed script to populate:
  - 2 sample organizations with 5 users each.
  - 10 sample meetings across different types and statuses.
  - Sample transcripts with realistic utterances.
  - 3 custom CRM objects (Deals, Partners, Candidates) with sample records.
  - Sample Kanban board with tasks in various statuses.
- [ ] Export typed query helpers from `@kara/db` for use by `apps/api` -- the schema and connection factory are exported; the packaged query helpers from doc 08 §5 are not yet.

---

## Phase 4: NestJS Backend Core & BullMQ Pipeline (`apps/api`)

- [ ] Configure BullMQ queues on Redis:
  - `bot-dispatch`: Coordinates bot launching and timeouts.
  - `transcription`: Downloads audio from RustFS S3 and invokes Groq Whisper.
  - `utterance-classification`: Runs Laya classifier on each utterance batch (action_item/decision/question/info).
  - `mom-synthesis`: Triggers Mastra workflow to produce meeting summaries.
  - `rag-indexing`: Embeds transcript chunks into ChromaDB with strict temporal metadata.
  - `meeting-tagging`: Runs Laya meeting type classifier post-MOM.
- [ ] Implement S3 Presigned URL Service for RustFS on Oracle Cloud.
- [ ] Implement REST & SSE Endpoints (per Phase 2B design).
- [ ] Implement error handling middleware with standardized error responses.
- [ ] Add request validation using Zod schemas from `@kara/shared-types`.

---

## Phase 5: Laya Decision Model Integration (`packages/laya`)

> **Goal**: Set up Laya as a local Python sidecar service that the NestJS backend calls
> over HTTP for fast structured decisions.

- [ ] Create `packages/laya/` workspace package:
  - `server.py` -- FastAPI/Flask micro-service wrapping the Laya Router.
  - `schemas/` -- JSON question schema files for each use case.
  - `Dockerfile` -- Containerized deployment option.
  - `requirements.txt` -- `laya`, `fastapi`, `uvicorn`.
- [ ] Implement Laya Router initialization with `preload=True` for instant inference.
- [ ] Expose HTTP endpoints:
  - `POST /classify-utterance` -- Takes utterance text, returns `{type, confidence}`.
  - `POST /score-relevance` -- Takes query + chunk, returns `{score, confidence}`.
  - `POST /route-query` -- Takes user message, returns `{route, confidence}`.
  - `POST /tag-meeting` -- Takes MOM summary, returns `{meeting_type, confidence}`.
  - `POST /check-content` -- Takes text, returns `{is_safe, confidence}`.
- [ ] Add health check endpoint and startup probe.
- [ ] NestJS `LayaService` -- HTTP client in `apps/api` that calls the Laya sidecar.
- [ ] Add Laya sidecar to `docker-compose.yml` and document standalone run command.
- [ ] Write integration tests with sample meeting transcripts.

---

## Phase 6: Mastra.ai Agentic Workflows & Non-Hallucinatory RAG

- [ ] Register `@mastra/nestjs` module and configure Mastra Agent with OpenAI / Groq LLMs.
- [ ] Implement non-hallucinatory search tools:
  - `getPastMeetings`: Strictly queries completed past meetings.
  - `getUpcomingSchedule`: Queries scheduled calendar events.
  - `searchKnowledgeBase`: Hybrid vector search with mandatory temporal filters (`status: COMPLETED`).
- [ ] **Laya-Powered Query Routing**: Before hitting the LLM, route through Laya to pick the right tool -- saves tokens and reduces hallucination surface.
- [ ] **Laya-Powered Relevance Filtering**: After vector retrieval, score each chunk with Laya before injecting into the LLM context.
- [ ] Implement Agent Tool Calling for Task & CRM Operations:
  - `createTask`, `updateTask`, `listTasks`.
  - `searchCRMRecords`, `createCRMRecord`.
- [ ] Set up Server-Sent Events (SSE) streaming chat endpoint (`/api/chat`).

---

## Phase 7: Next.js 16 Frontend (Notion / Twenty CRM Aesthetic) (`apps/web`)

- [ ] Build global layout: Collapsible Notion-style sidebar, Cmd+K command palette, and dark/light mode tokens.
- [ ] Build **Dashboard**:
  - Recent meetings feed, upcoming calendar, quick stats cards.
- [ ] Build **Meeting Intelligence Hub**:
  - Interactive transcript viewer synchronized with audio player.
  - Utterance type badges (action item, decision, question) -- powered by Laya classification.
  - Minutes of Meeting (MOM) tabs (Summary, Decisions, Action Items).
- [ ] Build **Notion-Style Task & Kanban Board**:
  - Drag-and-drop column status transitions using `@dnd-kit`.
  - Filter bar (Assignee, Priority, Due Date, Source: AI/Manual).
- [ ] Build **Twenty CRM Data Explorer**:
  - Dynamic table with inline cell editing using `@tanstack/react-table`.
  - Custom field builder (add new columns dynamically).
  - Object switcher sidebar.
- [ ] Build **Kara AI Chat Interface**:
  - Streaming markdown responses with clickable citation pills linking directly to past meeting timestamps.
  - Query route indicator showing which tool Laya picked.

---

## Phase 8: Stateless Meeting Bot Runner & End-to-End Testing

- [ ] Build containerized Chromium bot (`apps/meeting-bot`) using Puppeteer/WebRTC.
- [ ] Implement full pipeline integration test:
  - Bot joins test meeting -> Streams audio to RustFS -> Whisper transcribes ->
    Laya classifies utterances -> MOM generated -> Laya tags meeting type ->
    RAG indexed -> Kanban tasks created from action items.
- [ ] Load test BullMQ pipeline with concurrent meeting simulations.
- [ ] Verify zero-hallucination guarantee: Query about future meetings must never return past meeting data and vice versa.
- [ ] Performance benchmarking: Laya sidecar latency, end-to-end pipeline time, RAG retrieval accuracy.

---

## Phase Summary

| Phase | Name | Status | Key Deliverable |
| :---: | :--- | :--- | :--- |
| 1 | Monorepo Scaffolding | COMPLETE | Build-passing workspace |
| 2 | Schema Design & Architecture | 2A COMPLETE / 2B-2D NOT STARTED | ERD + 24-table schema (code); API map, route map, Laya plan still to do |
| 3 | Data Models & Persistence | IN PROGRESS | Schema + Drizzle config landed; migrations, seed data, query helpers outstanding |
| 4 | NestJS Backend & BullMQ | NOT STARTED | REST API + job queues |
| 5 | Laya Decision Model | NOT STARTED | Local Python sidecar with 5 endpoints |
| 6 | Mastra RAG & AI Agent | NOT STARTED | Non-hallucinatory chat with Laya routing |
| 7 | Next.js Frontend | NOT STARTED | Full Notion/Twenty CRM UI |
| 8 | Meeting Bot & E2E Testing | NOT STARTED | Complete pipeline test |

---

## Documentation Index

| # | Document | Covers |
| :---: | :--- | :--- |
| 01 | [Architecture & System Overview](./01_ARCHITECTURE_AND_SYSTEM_OVERVIEW.md) | Monorepo layout, high-level system diagram, design rationale |
| 02 | [Ultralight Local Stack Setup](./02_ULTRALIGHT_LOCAL_STACK_SETUP.md) | SQLite, ChromaDB, RustFS S3 local configuration |
| 03 | [Meeting Bot & Transcription Pipeline](./03_MEETING_BOT_AND_TRANSCRIPTION_PIPELINE.md) | Stateless bot runner, batch ingestion, webhook contract |
| 04 | [Non-Hallucinatory Mastra RAG](./04_NON_HALLUCINATORY_MASTRA_RAG.md) | Temporal guardrails, tool segregation, citation enforcement |
| 05 | [Twenty CRM Custom Data Engine](./05_TWENTY_CRM_CUSTOM_DATA_ENGINE.md) | Dynamic objects/fields, UI patterns |
| 06 | [Notion Kanban & Task Management](./06_NOTION_KANBAN_TASK_MANAGEMENT.md) | Task views, meeting↔task linking, conversational task management |
| 07 | This document | Phased implementation roadmap |
| 08 | [Database Schema Reference & Query Cookbook](./08_DATABASE_SCHEMA_REFERENCE_AND_QUERIES.md) | All 24 tables, ERD, conventions, query cookbook, index + migration strategy |
