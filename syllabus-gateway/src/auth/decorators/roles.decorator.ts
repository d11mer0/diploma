import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // ВИПРАВЛЕНО: UserRole -> Role

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
