import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and, ilike } from "@kara/db";

export const templateLoaderTool = createTool({
  id: "templateLoaderTool",
  description:
    "Retrieve document templates (offer letters, SLAs, executive briefs) with placeholder variables from the repository.",
  inputSchema: z.object({
    orgId: z.string(),
    type: z.string().optional().describe("Template type (e.g. 'offer_letter', 'sla_agreement')"),
    name: z.string().optional().describe("Template name keyword"),
  }),
  execute: async (input: any) => {
    const db = getDb();
    const conditions = [eq(schema.documentTemplates.orgId, input.orgId)];

    if (input.type) {
      conditions.push(eq(schema.documentTemplates.type, input.type));
    }
    if (input.name) {
      conditions.push(ilike(schema.documentTemplates.name, `%${input.name}%`));
    }

    const templates = await db.query.documentTemplates.findMany({
      where: and(...conditions),
      limit: 5,
    });

    return {
      count: templates.length,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        variables: t.variables,
        contentPreview: t.content.slice(0, 200),
      })),
    };
  },
});

export const documentRendererTool = createTool({
  id: "documentRendererTool",
  description:
    "Populate document templates with real variables (candidate names, salaries, SLA targets) and save draft artifact to PostgreSQL.",
  inputSchema: z.object({
    orgId: z.string(),
    templateId: z.string().optional(),
    templateType: z.string().optional().describe("Template type if templateId is not known"),
    recipientName: z.string(),
    recipientEmail: z.string(),
    recipientRole: z.string().optional(),
    variables: z.record(z.string(), z.string()).describe("Key-value map of template substitutions"),
    customContent: z.string().optional().describe("Direct content override if not using template"),
  }),
  execute: async (input: any) => {
    const db = getDb();

    let rawContent = input.customContent || "";
    let templateId = input.templateId || null;

    if (!rawContent) {
      const template = input.templateId
        ? await db.query.documentTemplates.findFirst({
            where: and(
              eq(schema.documentTemplates.id, input.templateId),
              eq(schema.documentTemplates.orgId, input.orgId),
            ),
          })
        : await db.query.documentTemplates.findFirst({
            where: and(
              eq(schema.documentTemplates.orgId, input.orgId),
              eq(schema.documentTemplates.type, input.templateType || "offer_letter"),
            ),
          });

      if (!template) {
        return {
          success: false,
          error: "No matching template found for variable rendering",
        };
      }

      templateId = template.id;
      rawContent = template.content;
    }

    let renderedContent = rawContent;
    for (const [key, value] of Object.entries(input.variables || {})) {
      const escapedKey = key.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      renderedContent = renderedContent.replace(
        new RegExp(`\\{\\{?\\s*${escapedKey}\\s*\\}?}`, "gi"),
        () => String(value),
      );
    }

    const [generated] = await db
      .insert(schema.generatedDocuments)
      .values({
        orgId: input.orgId,
        templateId,
        recipientName: input.recipientName,
        recipientEmail: input.recipientEmail,
        recipientRole: input.recipientRole || null,
        variablesFilled: input.variables || {},
        documentContent: renderedContent,
        status: "draft",
      })
      .returning();

    return {
      success: true,
      documentId: generated.id,
      recipientName: generated.recipientName,
      status: generated.status,
      renderedLength: renderedContent.length,
      preview: renderedContent.slice(0, 300),
    };
  },
});
