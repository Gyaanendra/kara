import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export class TenantContext {
  orgId!: string;
  userId?: string;
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.headers["x-org-id"] || request.query?.orgId || "org_76a82f1024344d4db6d8a588";
    const userId = request.headers["x-user-id"] || request.query?.userId || "usr_fbf08831baea4ddfba03eb3a";
    const ctxObj = new TenantContext();
    ctxObj.orgId = String(orgId);
    ctxObj.userId = String(userId);
    return ctxObj;
  },
);
