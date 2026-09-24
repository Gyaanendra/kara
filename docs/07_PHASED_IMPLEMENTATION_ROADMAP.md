# 07. Phased Implementation Roadmap

This roadmap breaks down the complete development of Kara AI into milestone-driven phases.

---

## Phase 1: Monorepo Scaffolding & Ultralight Environment (COMPLETE)
- [x] Initialized Turborepo monorepo with `pnpm workspaces` (Turborepo 2.11+, pnpm 12+).
- [x] Scaffolded `@kara/shared-types` with Zod validation and core domain enums.
- [x] Scaffolded `apps/api` with NestJS 11 Core, BullMQ, and Mastra modules.
- [x] Scaffolded `apps/web` with Next.js 16 (React 19, Tailwind CSS v4, TanStack Query/Table, Zustand).
- [x] Configured single `.env` supporting local SQLite (`dev.db`), ChromaDB, and self-hosted RustFS S3.
- [x] Verified full monorepo compilation (`turbo build`) passing 100%.
- [x] Created numbered architecture and feature documentation in `docs/`.

---

## Phase 2: Data Models & Persistence Layer (`packages/db`)
- [ ] Set up Prisma / Drizzle ORM configured for SQLite local dev with Postgres production readiness.
- [ ] Implement schemas for:
  - Users, Organizations, and RBAC Roles (`MEMBER`, `ADMIN`, `SUPERADMIN`).
  - Meetings, Recordings, Transcripts, and Utterances.
  - Minutes of Meeting (MOM), Key Decisions, and Action Items.
  - Twenty CRM Custom Objects (`crm_objects`, `crm_fields`, `crm_records`).
  - Kanban Tasks & Activity Logs.
- [ ] Write seed script to populate sample meetings, transcripts, and custom CRM objects for rapid UI development.

---

## Phase 3: NestJS Backend Core & BullMQ Pipeline (`apps/api`)
- [ ] Configure BullMQ queues on Redis:
  - `bot-dispatch`: Coordinates bot launching and timeouts.
  - `transcription`: Downloads audio from RustFS S3 and invokes Groq Whisper.
  - `mom-synthesis`: Triggers Mastra workflow to produce meeting summaries.
  - `rag-indexing`: Embeds transcript chunks into ChromaDB with strict temporal metadata.
- [ ] Implement S3 Presigned URL Service for RustFS on Oracle Cloud.
- [ ] Implement REST & SSE Endpoints:
  - Meeting creation & calendar sync.
  - Transcript streaming & audio playback URLs.
  - Dynamic CRM Object CRUD.
  - Kanban Task CRUD with status transitions.

---

## Phase 4: Mastra.ai Agentic Workflows & Non-Hallucinatory RAG
- [ ] Register `@mastra/nestjs` module and configure Mastra Agent with OpenAI / Groq LLMs.
- [ ] Implement non-hallucinatory search tools:
  - `getPastMeetings`: Strictly queries completed past meetings.
  - `getUpcomingSchedule`: Queries scheduled calendar events.
  - `searchKnowledgeBase`: Hybrid vector search with mandatory temporal filters (`status: COMPLETED`).
- [ ] Implement Agent Tool Calling for Task & CRM Operations:
  - `createTask`, `updateTask`, `listTasks`.
  - `searchCRMRecords`, `createCRMRecord`.
- [ ] Set up Server-Sent Events (SSE) streaming chat endpoint (`/api/chat`).

---

## Phase 5: Next.js 16 Frontend (Notion / Twenty CRM Aesthetic) (`apps/web`)
- [ ] Build global layout: Collapsible Notion-style sidebar, Cmd+K command palette, and dark/light mode tokens.
- [ ] Build **Meeting Intelligence Hub**:
  - Interactive transcript viewer synchronized with audio player.
  - Minutes of Meeting (MOM) tabs (Summary, Decisions, Action Items).
- [ ] Build **Notion-Style Task & Kanban Board**:
  - Drag-and-drop column status transitions using `@dnd-kit`.
  - Filter bar (Assignee, Priority, Due Date).
- [ ] Build **Twenty CRM Data Explorer**:
  - Dynamic table with inline cell editing using `@tanstack/react-table`.
  - Custom field builder (add new columns dynamically).
- [ ] Build **Kara AI Floating Assistant Drawer**:
  - Streaming markdown responses with clickable citation pills linking directly to past meeting timestamps.

---

## Phase 6: Stateless Meeting Bot Runner & End-to-End Testing
- [ ] Build containerized Chromium bot (`apps/meeting-bot`) using Puppeteer/WebRTC.
- [ ] Test real meeting join (Google Meet / Zoom test link) -> Stream to RustFS -> Transcribe -> MOM -> RAG -> Kanban task.
