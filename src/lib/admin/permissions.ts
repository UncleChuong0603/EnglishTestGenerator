export const ADMIN_ROLES = ["ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = ["ADMIN_DASHBOARD_READ", "USER_READ", "USER_STATUS_MANAGE", "PLAN_MANAGE", "AUDIT_READ"] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = { ADMIN: ADMIN_PERMISSIONS };
