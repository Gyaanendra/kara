import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { CurrentTenant, TenantContext } from "../auth/tenant.decorator.js";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("presigned-upload")
  async getPresignedUpload(
    @CurrentTenant() tenant: TenantContext,
    @Body("meetingId") meetingId: string,
    @Body("filename") filename?: string,
  ) {
    return this.storageService.getPresignedUploadUrl(tenant.orgId, meetingId, filename);
  }

  /**
   * S3 keys contain slashes and special characters (e.g. recordings/org_123/meet_456/audio.webm).
   * Query parameter `?key=...` is the industry-standard convention avoiding path-to-regexp errors.
   */
  @Get("presigned-download")
  async getPresignedDownload(@Query("key") key: string) {
    return this.storageService.getPresignedDownloadUrl(key);
  }
}
