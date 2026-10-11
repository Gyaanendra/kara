import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.module.js";
import { schema, eq } from "@kara/db";
import type { KaraDatabase } from "@kara/db";

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: KaraDatabase) {}

  async getMe(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        memberships: {
          with: {
            organization: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getOrganization(orgId: string) {
    const org = await this.db.query.organizations.findFirst({
      where: eq(schema.organizations.id, orgId),
    });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }
    return org;
  }
}
