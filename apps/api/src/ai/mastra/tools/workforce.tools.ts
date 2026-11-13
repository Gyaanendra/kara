import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and, or, ilike, desc, gte } from "@kara/db";

export const directoryLookupTool = createTool({
  id: "directoryLookupTool",
  description:
    "Query the canonical company directory to find team members by name, email, department, or technical skills, including live presence status.",
  inputSchema: z.object({
    orgId: z.string().describe("The active organization ID"),
    query: z.string().optional().describe("Search string matching name, email, or bio"),
    department: z.string().optional().describe("Filter by department (e.g. Engineering, Product)"),
    skills: z.string().optional().describe("Filter by skill keyword"),
    limit: z.number().default(10).describe("Max members to return"),
  }),
  execute: async (input: any) => {
    const db = getDb();
    const conditions = [
      eq(schema.companyMembers.orgId, input.orgId),
      eq(schema.companyMembers.isActive, true),
    ];

    if (input.department) {
      conditions.push(ilike(schema.companyMembers.department, `%${input.department}%`));
    }
    if (input.skills) {
      conditions.push(ilike(schema.companyMembers.skills, `%${input.skills}%`));
    }
    if (input.query) {
      conditions.push(
        or(
          ilike(schema.companyMembers.name, `%${input.query}%`),
          ilike(schema.companyMembers.email, `%${input.query}%`),
          ilike(schema.companyMembers.bio, `%${input.query}%`),
        )!,
      );
    }

    const members = await db.query.companyMembers.findMany({
      where: and(...conditions),
      limit: input.limit || 10,
    });

    const emails = members.map((m) => m.email);
    const presenceRows = emails.length > 0
      ? await db.query.userPresence.findMany({
          where: eq(schema.userPresence.orgId, input.orgId),
        })
      : [];
    const presenceMap = new Map(presenceRows.map((p) => [p.userEmail.toLowerCase(), p.status]));

    return {
      count: members.length,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        jobTitle: m.jobTitle,
        department: m.department,
        skills: m.skills,
        presence: presenceMap.get(m.email.toLowerCase()) || "offline",
      })),
    };
  },
});

export const entityGraphTool = createTool({
  id: "entityGraphTool",
  description:
    "Traverse the company Knowledge Graph to find relational triplets (entityA -[relation]-> entityB) with confidence scores.",
  inputSchema: z.object({
    orgId: z.string().describe("Organization ID"),
    entity: z.string().optional().describe("Name of entity to query (matches entityA or entityB)"),
    relation: z.string().optional().describe("Relationship type (e.g. OWNS_PROJECT, REPORTS_TO)"),
    minConfidence: z.number().default(0.5).describe("Minimum confidence threshold (0 to 1)"),
    limit: z.number().default(15),
  }),
  execute: async (input: any) => {
    const db = getDb();
    const conditions = [
      eq(schema.entityRelationships.orgId, input.orgId),
      gte(schema.entityRelationships.confidence, input.minConfidence || 0.5),
    ];

    if (input.relation) {
      conditions.push(ilike(schema.entityRelationships.relation, `%${input.relation}%`));
    }
    if (input.entity) {
      conditions.push(
        or(
          ilike(schema.entityRelationships.entityA, `%${input.entity}%`),
          ilike(schema.entityRelationships.entityB, `%${input.entity}%`),
        )!,
      );
    }

    const rows = await db.query.entityRelationships.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.entityRelationships.confidence)],
      limit: input.limit || 15,
    });

    return {
      count: rows.length,
      relationships: rows.map((r) => ({
        id: r.id,
        entityA: r.entityA,
        relation: r.relation,
        entityB: r.entityB,
        context: r.context,
        confidence: r.confidence,
      })),
    };
  },
});

export const upsertRelationshipTool = createTool({
  id: "upsertRelationshipTool",
  description: "Record or update a knowledge graph entity relationship triplet discovered during execution.",
  inputSchema: z.object({
    orgId: z.string(),
    entityA: z.string().describe("Source entity name (e.g. 'Sarah Chen')"),
    relation: z.string().describe("Relation edge (e.g. 'OWNS_DATABASE_MIGRATION')"),
    entityB: z.string().describe("Target entity name (e.g. 'PostgreSQL 18')"),
    context: z.string().optional().describe("Meeting context or rationale"),
    meetingId: z.string().optional(),
    confidence: z.number().default(1.0),
  }),
  execute: async (input: any) => {
    const db = getDb();
    const [inserted] = await db
      .insert(schema.entityRelationships)
      .values({
        orgId: input.orgId,
        entityA: input.entityA,
        relation: input.relation,
        entityB: input.entityB,
        context: input.context || null,
        meetingId: input.meetingId || null,
        confidence: input.confidence ?? 1.0,
      })
      .returning();

    return {
      success: true,
      relationship: inserted,
    };
  },
});
