import type { Permission, Role } from '../types';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: ['catalogue:read', 'playback:create', 'download:create', 'billing:manage'],
  SUPPORT: ['catalogue:read', 'users:read', 'users:support', 'audit:read'],
  EDITOR: ['catalogue:read', 'catalogue:write', 'editorial:publish', 'admin:read'],
  RIGHTS_MANAGER: ['catalogue:read', 'rights:read', 'rights:write', 'admin:read'],
  ADMIN: [
    'catalogue:read',
    'catalogue:write',
    'rights:read',
    'rights:write',
    'editorial:publish',
    'users:read',
    'users:support',
    'admin:read',
    'admin:write',
    'audit:read',
    'billing:manage',
  ],
  OWNER: [
    'catalogue:read',
    'catalogue:write',
    'rights:read',
    'rights:write',
    'editorial:publish',
    'users:read',
    'users:support',
    'admin:read',
    'admin:write',
    'audit:read',
    'playback:create',
    'download:create',
    'billing:manage',
  ],
};

export function permissionsForRoles(roles: Role[]): Set<Permission> {
  return new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role]));
}

export function hasPermission(roles: Role[], permission: Permission): boolean {
  return permissionsForRoles(roles).has(permission);
}
