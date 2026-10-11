import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq, and } from "@kara/db";
import type { KaraDatabase } from "@kara/db";
import { CustomFieldType } from "@kara/shared-types";

export class CreateCrmObjectDto {
  name!: string;
  slug!: string;
  singularName!: string;
  pluralName!: string;
  description?: string;
  icon?: string;
  colorHex?: string;
}

export class CreateCrmFieldDto {
  name!: string;
  slug!: string;
  type!: CustomFieldType;
  description?: string;
  isRequired?: boolean;
  options?: Array<{ label: string; value: string; color?: string }>;
}

@Injectable()
export class CrmService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async listObjects(orgId: string) {
    return this.db.query.crmObjects.findMany({
      where: eq(schema.crmObjects.orgId, orgId),
      with: { fields: true },
    });
  }

  async getObjectBySlug(orgId: string, slug: string) {
    const obj = await this.db.query.crmObjects.findFirst({
      where: and(eq(schema.crmObjects.orgId, orgId), eq(schema.crmObjects.slug, slug)),
      with: { fields: true },
    });
    if (!obj) {
      throw new NotFoundException(`CRM Object with slug '${slug}' not found`);
    }
    return obj;
  }

  async createObject(orgId: string, dto: CreateCrmObjectDto) {
    const [obj] = await this.db
      .insert(schema.crmObjects)
      .values({
        orgId,
        name: dto.name,
        slug: dto.slug,
        singularName: dto.singularName,
        pluralName: dto.pluralName,
        description: dto.description,
        icon: dto.icon ?? "database",
        colorHex: dto.colorHex,
      })
      .returning();
    return obj;
  }

  async addField(orgId: string, objectSlug: string, dto: CreateCrmFieldDto) {
    const obj = await this.getObjectBySlug(orgId, objectSlug);
    const [field] = await this.db
      .insert(schema.crmFields)
      .values({
        orgId,
        objectId: obj.id,
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        description: dto.description,
        isRequired: dto.isRequired ?? false,
        options: dto.options,
      })
      .returning();
    return field;
  }

  async listRecords(orgId: string, objectSlug: string) {
    const obj = await this.getObjectBySlug(orgId, objectSlug);
    return this.db.query.crmRecords.findMany({
      where: and(eq(schema.crmRecords.orgId, orgId), eq(schema.crmRecords.objectId, obj.id)),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      limit: 100,
    });
  }

  async createRecord(orgId: string, userId: string, objectSlug: string, data: Record<string, unknown>) {
    const obj = await this.getObjectBySlug(orgId, objectSlug);
    const [record] = await this.db
      .insert(schema.crmRecords)
      .values({
        orgId,
        objectId: obj.id,
        data,
        createdById: userId,
      })
      .returning();
    return record;
  }

  async updateRecord(orgId: string, objectSlug: string, recordId: string, data: Record<string, unknown>) {
    const obj = await this.getObjectBySlug(orgId, objectSlug);
    const [updated] = await this.db
      .update(schema.crmRecords)
      .set({
        data,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.crmRecords.orgId, orgId), eq(schema.crmRecords.id, recordId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Record ${recordId} not found`);
    }
    return updated;
  }

  async deleteRecord(orgId: string, objectSlug: string, recordId: string) {
    await this.db
      .delete(schema.crmRecords)
      .where(and(eq(schema.crmRecords.orgId, orgId), eq(schema.crmRecords.id, recordId)));
    return { success: true };
  }
}
