import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { CustomFieldType, RelationKind } from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";

export const crmObjects = pgTable(
  "crm_objects",
  {
    id: primaryId("obj"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    singularName: text("singular_name").notNull(),
    pluralName: text("plural_name").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("database"),
    colorHex: text("color_hex"),
    isSystem: bool("is_system").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("crm_objects_org_slug_unique").on(t.orgId, t.slug),
    index("crm_objects_org_idx").on(t.orgId),
  ],
);

export const crmFields = pgTable(
  "crm_fields",
  {
    id: primaryId("fld"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    objectId: text("object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type").$type<CustomFieldType>().notNull(),
    description: text("description"),
    isRequired: bool("is_required").notNull().default(false),
    isUnique: bool("is_unique").notNull().default(false),
    defaultValue: jsonb("default_value"),
    options: jsonb("options").$type<Array<{ label: string; value: string; color?: string }>>(),
    targetObjectId: text("target_object_id").references(() => crmObjects.id, {
      onDelete: "set null",
    }),
    relationKind: text("relation_kind").$type<RelationKind>(),
    position: doublePrecision("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("crm_fields_object_slug_unique").on(t.objectId, t.slug),
    index("crm_fields_object_pos_idx").on(t.objectId, t.position),
  ],
);

export const crmRecords = pgTable(
  "crm_records",
  {
    id: primaryId("crec"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    objectId: text("object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    index("crm_records_object_idx").on(t.objectId),
    index("crm_records_org_object_idx").on(t.orgId, t.objectId),
  ],
);

export const crmRecordValues = pgTable(
  "crm_record_values",
  {
    id: primaryId("val"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    recordId: text("record_id")
      .notNull()
      .references(() => crmRecords.id, { onDelete: "cascade" }),
    fieldId: text("field_id")
      .notNull()
      .references(() => crmFields.id, { onDelete: "cascade" }),
    textValue: text("text_value"),
    numberValue: numeric("number_value"),
    booleanValue: bool("boolean_value"),
    dateValue: timestamp("date_value", { withTimezone: true, mode: "date" }),
    jsonValue: jsonb("json_value"),
    targetRecordId: text("target_record_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("crm_record_values_record_field_unique").on(t.recordId, t.fieldId),
    index("crm_record_values_field_text_idx").on(t.fieldId, t.textValue),
    index("crm_record_values_field_number_idx").on(t.fieldId, t.numberValue),
    index("crm_record_values_field_date_idx").on(t.fieldId, t.dateValue),
  ],
);

export const crmRelations = pgTable(
  "crm_relations",
  {
    id: primaryId("rel"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    fieldId: text("field_id")
      .notNull()
      .references(() => crmFields.id, { onDelete: "cascade" }),
    sourceRecordId: text("source_record_id")
      .notNull()
      .references(() => crmRecords.id, { onDelete: "cascade" }),
    targetRecordId: text("target_record_id")
      .notNull()
      .references(() => crmRecords.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("crm_relations_field_source_target_unique").on(
      t.fieldId,
      t.sourceRecordId,
      t.targetRecordId,
    ),
    index("crm_relations_target_idx").on(t.targetRecordId),
  ],
);

export const crmObjectsRelations = relations(crmObjects, ({ many }) => ({
  fields: many(crmFields),
  records: many(crmRecords),
}));

export const crmFieldsRelations = relations(crmFields, ({ one }) => ({
  object: one(crmObjects, {
    fields: [crmFields.objectId],
    references: [crmObjects.id],
  }),
}));

export const crmRecordsRelations = relations(crmRecords, ({ one, many }) => ({
  object: one(crmObjects, {
    fields: [crmRecords.objectId],
    references: [crmObjects.id],
  }),
  values: many(crmRecordValues),
}));
