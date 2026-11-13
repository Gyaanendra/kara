import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and } from "@kara/db";

export const userContextMemoryTool = createTool({
  id: "userContextMemoryTool",
  description:
    "Read, write, or query Kara's long-term persistent memory for executive preferences, projects, and custom context.",
  inputSchema: z.object({
    orgId: z.string(),
    userId: z.string().describe("User ID to associate context with"),
    action: z.enum(["read", "write", "list"]).default("read"),
    contextType: z.enum(["preferences", "ongoing_projects", "memory_notes"]).default("memory_notes"),
    contextData: z.record(z.string(), z.any()).optional().describe("Key-value data payload to store when writing"),
  }),
  execute: async (input: any) => {
    const db = getDb();

    if (input.action === "write" && input.contextData) {
      const existing = await db.query.userContexts.findFirst({
        where: and(
          eq(schema.userContexts.orgId, input.orgId),
          eq(schema.userContexts.userId, input.userId),
          eq(schema.userContexts.contextType, input.contextType),
        ),
      });

      if (existing) {
        const mergedData = {
          ...(existing.contextData as Record<string, unknown>),
          ...input.contextData,
        };
        const [updated] = await db
          .update(schema.userContexts)
          .set({ contextData: mergedData })
          .where(eq(schema.userContexts.id, existing.id))
          .returning();

        return {
          action: "write",
          contextType: input.contextType,
          contextData: updated.contextData,
        };
      }

      const [inserted] = await db
        .insert(schema.userContexts)
        .values({
          orgId: input.orgId,
          userId: input.userId,
          contextType: input.contextType,
          contextData: input.contextData,
        })
        .returning();

      return {
        action: "write",
        contextType: input.contextType,
        contextData: inserted.contextData,
      };
    }

    if (input.action === "list") {
      const rows = await db.query.userContexts.findMany({
        where: and(
          eq(schema.userContexts.orgId, input.orgId),
          eq(schema.userContexts.userId, input.userId),
        ),
      });
      return {
        action: "list",
        contexts: rows.map((r) => ({
          type: r.contextType,
          data: r.contextData,
          updatedAt: r.updatedAt,
        })),
      };
    }

    const row = await db.query.userContexts.findFirst({
      where: and(
        eq(schema.userContexts.orgId, input.orgId),
        eq(schema.userContexts.userId, input.userId),
        eq(schema.userContexts.contextType, input.contextType),
      ),
    });

    return {
      action: "read",
      contextType: input.contextType,
      contextData: row?.contextData || {},
    };
  },
});
