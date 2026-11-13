/**
 * Schema barrel — all 24 tables specified in doc 07 §2A.
 *
 * Order matters only for human readers: `sqliteTable` callbacks are lazy, so Drizzle
 * resolves cross-module FK references regardless of import order. The modules are
 * nonetheless kept in FK-edge order (auth -> meetings -> mom -> kanban -> crm -> ai),
 * because a violation of that ordering is the usual first sign of an accidental cycle.
 */

// Auth & Tenancy — organizations, users, org_memberships (3)
export * from "./auth.js";

// Meeting Intelligence — meetings, recordings, transcripts, utterances, meeting_participants (5)
export * from "./meetings.js";

// MOM — moms, mom_decisions, mom_action_items (3)
export * from "./mom.js";

// Kanban & Task OS — kanban_boards, kanban_columns, tasks, task_comments, task_activity_log (5)
export * from "./kanban.js";

// Twenty CRM Engine — crm_objects, crm_fields, crm_records, crm_record_values, crm_relations (5)
export * from "./crm.js";

// AI & Vector — chat_sessions, chat_messages, vector_documents (3)
export * from "./ai.js";

// Sub-Helper Registry — sub_helpers (1)
export * from "./helpers.js";

// Directory & Presence — company_members, user_presence (2)
export * from "./directory.js";

// Knowledge Graph — entity_relationships (1)
export * from "./knowledge_graph.js";

// Recruitment — job_descriptions, candidates (2)
export * from "./recruitment.js";

// Documents — document_templates, generated_documents (2)
export * from "./documents.js";

// Long-Term Memory — user_contexts (1)
export * from "./user_context.js";
