import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { CurrentTenant, TenantContext } from "./tenant.decorator.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  async getMe(@CurrentTenant() tenant: TenantContext) {
    return this.authService.getMe(tenant.userId!);
  }

  @Get("organization")
  async getOrganization(@CurrentTenant() tenant: TenantContext) {
    return this.authService.getOrganization(tenant.orgId);
  }
}
