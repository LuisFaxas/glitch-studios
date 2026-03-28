import "server-only"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "./auth"
import { db } from "./db"
import { adminRoles, adminRolePermissions } from "@/db/schema"

import { ALL_PERMISSIONS, type Permission } from "./permissions-shared"
export type { Permission }
export { ALL_PERMISSIONS }

/**
 * Backwards-compatible admin check.
 * Accepts BOTH old "admin" role AND new roles (owner/editor/manager/custom).
 * Rejects only the "user" role.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role === "user") {
    throw new Error("Unauthorized: admin access required")
  }
  return session
}

/**
 * Permission-specific check for Phase 4+ features.
 * Owner and legacy "admin" bypass all permission checks.
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAdmin()

  // Owner and legacy admin bypass all permission checks
  if (session.user.role === "owner" || session.user.role === "admin") {
    return session
  }

  // For other roles: look up permissions from the adminRoles table
  const roleName = session.user.role as string
  const userRole = await db.query.adminRoles.findFirst({
    where: eq(adminRoles.name, roleName),
    with: { permissions: true },
  })

  if (!userRole?.permissions.some((p) => p.permission === permission)) {
    throw new Error("Permission denied")
  }

  return session
}

/**
 * Returns all permissions for current user (for client-side UI gating).
 * Returns null if user is not an admin.
 */
export async function getSessionPermissions(): Promise<{
  permissions: Permission[]
  role: string
} | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role === "user") return null

  // Owner and legacy admin get all permissions
  if (session.user.role === "owner" || session.user.role === "admin") {
    return { permissions: ALL_PERMISSIONS, role: session.user.role }
  }

  // For other roles: look up permissions from the adminRoles table
  const roleName = session.user.role as string
  const userRole = await db.query.adminRoles.findFirst({
    where: eq(adminRoles.name, roleName),
    with: { permissions: true },
  })

  return {
    permissions:
      userRole?.permissions.map((p) => p.permission as Permission) ?? [],
    role: roleName,
  }
}
