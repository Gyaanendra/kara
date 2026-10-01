import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { CustomFieldType, RelationKind } from "@kara/shared-types";

import { bool, createdAt, deletedAt, orgId, primaryId, updatedAt } from "../columns.js";
import { organizations, users } from "./auth.js";
import { meetings } from "./meetings.js";

/** Enum columns use `.$type<Enum>()` — see the note in `auth.ts`. */

/** One entry of a `SELECT` / `MULTI_SELECT` field's option list (doc 05 §2B). */
export interface CrmFieldOption {
  value: string;
  label: string;
  /** Hex colour used for the tag chip in the Twenty-style table view. */
  color?: string;
}

/** Per-type validation constraints (min/max/regex/maxLength). */
export interface CrmFieldValidation {
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * A user-defined entity, e.g. `Deal`, `Partner`, `Candidate` (doc 05 §2A).
 * Creating a row here is what replaces "write a migration" with "click a button".
 */
export const crmObjects = sqliteTable(
  "crm_objects",
  {
    id: primaryId("obj"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    singularLabel: text("singular_label").notNull(),
    pluralLabel: text("plural_label").notNull(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),

    /** True for builder-shipped objects (Contacts, Companies) the user cannot delete. */
    isSystem: bool("is_system").notNull().default(false),
    /** Sidebar ordering in the object switcher (doc 07 Phase 7). */
    position: real("position").notNull().default(0),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("crm_objects_org_slug_unique").on(t.orgId, t.slug),
    index("crm_objects_org_position_idx").on(t.orgId, t.position),
  ],
);

/**
 * A column on a custom object.
 *
 * `relation_object_id` + `relation_kind` are only meaningful when `type` is `RELATION`.
 * `relation_field_id` points at the auto-created inverse column on the target object,
 * which is what makes a relation bi-directional without duplicating rows.
 */
export const crmFields = sqliteTable(
  "crm_fields",
  {
    id: primaryId("fld"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    objectId: text("object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),

    /** Machine key used in `crm_records.data` and in filter expressions. */
    name: text("name").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    type: text("type").$type<CustomFieldType>().notNull().default(CustomFieldType.TEXT),

    isRequired: bool("is_required").notNull().default(false),
    isUnique: bool("is_unique").notNull().default(false),
    isSystem: bool("is_system").notNull().default(false),
    position: real("position").notNull().default(0),

    defaultValue: text("default_value", { mode: "json" }),
    options: text("options", { mode: "json" }).$type<CrmFieldOption[]>(),
    validation: text("validation", { mode: "json" }).$type<CrmFieldValidation>(),

    // RELATION-only columns.
    relationObjectId: text("relation_object_id").references(() => crmObjects.id, {
      onDelete: "set null",
    }),
    relationKind: text("relation_kind").$type<RelationKind>(),
    /** In-memory inverse link; intentionally not FK-constrained (would be circular). */
    relationFieldId: text("relation_field_id"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("crm_fields_object_name_unique").on(t.objectId, t.name),
    index("crm_fields_object_position_idx").on(t.objectId, t.position),
    index("crm_fields_type_idx").on(t.objectId, t.type),
  ],
);

/**
 * A data row in a custom object.
 *
 * Dual representation, deliberately (see doc 08 §4.5):
 *  - `data` is the denormalized JSON snapshot. It is what the Twenty-style table view
 *    reads, so rendering 50 rows is a single SELECT with no joins.
 *  - `crm_record_values` holds the same values exploded into one row per field, which
 *    is what makes `stage == "Negotiation" AND value > 10000` filterable by index.
 *
 * Both are written in the same transaction by the CRM service. `data` is the source of
 * truth for display; the EAV rows are the source of truth for filtering.
 */
export const crmRecords = sqliteTable(
  "crm_records",
  {
    id: primaryId("crec"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    objectId: text("object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),

    /** Denormalized display name so list views never need to parse `data`. */
    title: text("title").notNull(),
    data: text("data", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .$defaultFn(() => ({})),

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
    index("crm_records_object_created_idx").on(t.objectId, t.createdAt),
    index("crm_records_org_object_idx").on(t.orgId, t.objectId),
    index("crm_records_title_idx").on(t.objectId, t.title),
  ],
);

/**
 * EAV store: one row per (record, field).
 *
 * Exactly one of the typed value columns is populated per row, chosen by the field's
 * `type`. Keeping them as separate typed columns (rather than one TEXT blob) is what
 * lets SQLite use a B-tree index for numeric range filters.
 *
 * NOTE: SQLite cannot express "exactly one of these columns is non-null" without a
 * CHECK constraint; this schema does not use one, to keep the dialect port simple.
 * The CRM service enforces the invariant on write (doc 08 §4.5).
 */
export const crmRecordValues = sqliteTable(
  "crm_record_values",
  {
    id: primaryId("val"),
    orgId: orgId().references(() => organizations.id, { onDelete: "cascade" }),
    /** Denormalized so a filter can be scoped to one object before joining. */
    objectId: text("object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),
    recordId: text("record_id")
      .notNull()
      .references(() => crmRecords.id, { onDelete: "cascade" }),
    fieldId: text("field_id")
      .notNull()
      .references(() => crmFields.id, { onDelete: "cascade" }),

    /** TEXT, URL, EMAIL, PHONE, SELECT. */
    textValue: text("text_value"),
    /** NUMBER. */
    numberValue: real("number_value"),
    /** DATE, stored as unix ms like every other temporal column. */
    dateValue: integer("date_value", { mode: "timestamp_ms" }),
    /** BOOLEAN. */
    boolValue: bool("bool_value"),
    /** MULTI_SELECT arrays and RELATION id lists. */
    jsonValue: text("json_value", { mode: "json" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("crm_record_values_record_field_unique").on(t.recordId, t.fieldId),
    index("crm_record_values_field_text_idx").on(t.fieldId, t.textValue),
    index("crm_record_values_field_number_idx").on(t.fieldId, t.numberValue),
    index("crm_record_values_field_date_idx").on(t.fieldId, t.dateValue),
    index("crm_record_values_object_field_idx").on(t.objectId, t.fieldId),
  ],
);

/**
 * A link created by a `RELATION` field.
 *
 * The target is polymorphic by design (doc 05 §2B): a Deal can relate to another CRM
 * record *or* to a Meeting. Store exactly one of `target_record_id` /
 * `target_meeting_id`; the application layer enforces this.
 */
export const crmRelations = sqliteTable(
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

    targetObjectId: text("target_object_id")
      .notNull()
      .references(() => crmObjects.id, { onDelete: "cascade" }),
    /** Set when the relation points at another CRM record. */
    targetRecordId: text("target_record_id").references(() => crmRecords.id, {
      onDelete: "cascade",
    }),
    /** Set when the relation points at a meeting (e.g. Deal -> "Discovery Call"). */
    targetMeetingId: text("target_meeting_id").references(() => meetings.id, {
      onDelete: "cascade",
    }),

    createdAt: createdAt(),
  },
  (t) => [
    index("crm_relations_source_idx").on(t.sourceRecordId, t.fieldId),
    index("crm_relations_target_record_idx").on(t.targetRecordId),
    index("crm_relations_target_meeting_idx").on(t.targetMeetingId),
  ],
);

// ---------------------------------------------------------------------------
// Relations
//
// `crm_fields.relation_object_id` / `relation_field_id` and `crm_records`' reverse
// edges are intentionally NOT exposed as `relations()`: multiple edges between the
// same pair of tables require `relationName` disambiguation, and the extra Drizzle
// metadata buys nothing here because the relational query API is not used for the
// filter builder (doc 08 §5.9). The columns remain FK-constrained and queryable.
// ---------------------------------------------------------------------------

export const crmObjectsRelations = relations(crmObjects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [crmObjects.orgId],
    references: [organizations.id],
  }),
  fields: many(crmFields),
  records: many(crmRecords),
}));

export const crmFieldsRelations = relations(crmFields, ({ one, many }) => ({
  object: one(crmObjects, {
    fields: [crmFields.objectId],
    references: [crmObjects.id],
  }),
  values: many(crmRecordValues),
  relations: many(crmRelations),
}));

export const crmRecordsRelations = relations(crmRecords, ({ one, many }) => ({
  object: one(crmObjects, {
    fields: [crmRecords.objectId],
    references: [crmObjects.id],
  }),
  createdBy: one(users, {
    fields: [crmRecords.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [crmRecords.updatedById],
    references: [users.id],
  }),
  values: many(crmRecordValues),
}));

export const crmRecordValuesRelations = relations(crmRecordValues, ({ one }) => ({
  record: one(crmRecords, {
    fields: [crmRecordValues.recordId],
    references: [crmRecords.id],
  }),
  field: one(crmFields, {
    fields: [crmRecordValues.fieldId],
    references: [crmFields.id],
  }),
}));

export const crmRelationsRelations = relations(crmRelations, ({ one }) => ({
  field: one(crmFields, {
    fields: [crmRelations.fieldId],
    references: [crmFields.id],
  }),
  sourceRecord: one(crmRecords, {
    fields: [crmRelations.sourceRecordId],
    references: [crmRecords.id],
    relationName: "relationSourceRecord",
  }),
  targetObject: one(crmObjects, {
    fields: [crmRelations.targetObjectId],
    references: [crmObjects.id],
  }),
  targetRecord: one(crmRecords, {
    fields: [crmRelations.targetRecordId],
    references: [crmRecords.id],
    relationName: "relationTargetRecord",
  }),
  targetMeeting: one(meetings, {
    fields: [crmRelations.targetMeetingId],
    references: [meetings.id],
  }),
}));
