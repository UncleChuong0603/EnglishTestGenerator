import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_PERMISSIONS, type AdminPermission, type AdminRole } from "./permissions";

export async function hasRole(userId: string, role: AdminRole) {
  const [row] = await db.select({ id: userRoles.id }).from(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role), isNull(userRoles.revokedAt))).limit(1);
  return Boolean(row);
}

export async function getCurrentActor() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await db.select({ role: userRoles.role }).from(userRoles).where(and(eq(userRoles.userId, user.id), isNull(userRoles.revokedAt)));
  const roles = rows.map((row) => row.role).filter((role): role is AdminRole => role === "ADMIN");
  return { ...user, roles, permissions: [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role]))] };
}

export async function requireAdmin(permission: AdminPermission = "ADMIN_DASHBOARD_READ") {
  const actor = await getCurrentActor();
  if (!actor) redirect("/sign-in?next=/admin");
  if (!actor.permissions.includes(permission)) redirect("/admin/access-denied");
  return actor;
}
