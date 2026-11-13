import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations } from "./auth.js";

export type DocumentStatus = "draft" | "pending_review" | "final" | "sent";

export const documentTemplates = pgTable(
  "document_templates",
  {
    id: primaryId("tmpl"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("offer_letter"),
    content: text("content").notNull(),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    emailTemplate: text("email_template"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("document_templates_org_type_unique").on(t.orgId, t.type),
    index("document_templates_org_idx").on(t.orgId),
  ],
);

export const generatedDocuments = pgTable(
  "generated_documents",
  {
    id: primaryId("doc"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => documentTemplates.id, {
      onDelete: "set null",
    }),
    recipientName: text("recipient_name").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    recipientRole: text("recipient_role"),
    variablesFilled: jsonb("variables_filled").$type<Record<string, string>>().notNull(),
    documentContent: text("document_content").notNull(),
    status: text("status").$type<DocumentStatus>().notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("generated_documents_org_status_idx").on(t.orgId, t.status),
    index("generated_documents_recipient_idx").on(t.recipientEmail),
  ],
);

export const documentTemplatesRelations = relations(documentTemplates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [documentTemplates.orgId],
    references: [organizations.id],
  }),
  generated: many(generatedDocuments),
}));

export const generatedDocumentsRelations = relations(generatedDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [generatedDocuments.orgId],
    references: [organizations.id],
  }),
  template: one(documentTemplates, {
    fields: [generatedDocuments.templateId],
    references: [documentTemplates.id],
  }),
}));
