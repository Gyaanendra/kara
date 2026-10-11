import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CrmService, CreateCrmObjectDto, CreateCrmFieldDto } from "./crm.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";

@Controller("crm")
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get("objects")
  async listObjects(@CurrentTenant() tenant: TenantContext) {
    return this.crmService.listObjects(tenant.orgId);
  }

  @Post("objects")
  async createObject(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateCrmObjectDto) {
    return this.crmService.createObject(tenant.orgId, dto);
  }

  @Get("objects/:slug")
  async getObject(@CurrentTenant() tenant: TenantContext, @Param("slug") slug: string) {
    return this.crmService.getObjectBySlug(tenant.orgId, slug);
  }

  @Post("objects/:slug/fields")
  async addField(
    @CurrentTenant() tenant: TenantContext,
    @Param("slug") slug: string,
    @Body() dto: CreateCrmFieldDto,
  ) {
    return this.crmService.addField(tenant.orgId, slug, dto);
  }

  @Get("records/:slug")
  async listRecords(@CurrentTenant() tenant: TenantContext, @Param("slug") slug: string) {
    return this.crmService.listRecords(tenant.orgId, slug);
  }

  @Post("records/:slug")
  async createRecord(
    @CurrentTenant() tenant: TenantContext,
    @Param("slug") slug: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.crmService.createRecord(tenant.orgId, tenant.userId!, slug, data);
  }

  @Patch("records/:slug/:recordId")
  async updateRecord(
    @CurrentTenant() tenant: TenantContext,
    @Param("slug") slug: string,
    @Param("recordId") recordId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.crmService.updateRecord(tenant.orgId, slug, recordId, data);
  }

  @Delete("records/:slug/:recordId")
  async deleteRecord(
    @CurrentTenant() tenant: TenantContext,
    @Param("slug") slug: string,
    @Param("recordId") recordId: string,
  ) {
    return this.crmService.deleteRecord(tenant.orgId, slug, recordId);
  }
}
