import { relations } from "drizzle-orm";
import { doublePrecision, index, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations } from "./auth.js";

export type JobStatus = "active" | "paused" | "closed";
export type CandidateStatus = "applied" | "screening" | "evaluated" | "interviewing" | "offer" | "rejected";

/** 100-point objective candidate scoring, ported from the reference bot. */
export interface CandidateScore {
  openSource: number; // max 35
  selfProjects: number; // max 30
  production: number; // max 25
  technicalSkills: number; // max 10
  overall: number; // max 100
}

export const jobDescriptions = pgTable(
  "job_descriptions",
  {
    id: primaryId("job"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    department: text("department"),
    description: text("description").notNull(),
    requirements: text("requirements"),
    salaryRange: text("salary_range"),
    status: text("status").$type<JobStatus>().notNull().default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("job_descriptions_org_status_idx").on(t.orgId, t.status),
    index("job_descriptions_department_idx").on(t.department),
  ],
);

export const candidates = pgTable(
  "candidates",
  {
    id: primaryId("cnd"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    jobId: text("job_id").references(() => jobDescriptions.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    resumeText: text("resume_text"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),

    // Objective scoring breakdown (0-100)
    overallScore: doublePrecision("overall_score"),
    openSourceScore: doublePrecision("open_source_score"),
    selfProjectsScore: doublePrecision("self_projects_score"),
    productionScore: doublePrecision("production_score"),
    technicalSkillsScore: doublePrecision("technical_skills_score"),

    aiSummary: text("ai_summary"),
    aiPros: jsonb("ai_pros").$type<string[]>(),
    aiCons: jsonb("ai_cons").$type<string[]>(),
    aiJustification: text("ai_justification"),
    githubProjects: jsonb("github_projects").$type<Array<Record<string, unknown>>>(),
    evidenceJson: jsonb("evidence_json").$type<Record<string, unknown>>(),
    status: text("status").$type<CandidateStatus>().notNull().default("applied"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("candidates_org_email_unique").on(t.orgId, t.email),
    index("candidates_org_job_idx").on(t.orgId, t.jobId),
    index("candidates_overall_score_idx").on(t.overallScore),
  ],
);

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobDescriptions.orgId],
    references: [organizations.id],
  }),
  candidates: many(candidates),
}));

export const candidatesRelations = relations(candidates, ({ one }) => ({
  organization: one(organizations, {
    fields: [candidates.orgId],
    references: [organizations.id],
  }),
  job: one(jobDescriptions, {
    fields: [candidates.jobId],
    references: [jobDescriptions.id],
  }),
}));
