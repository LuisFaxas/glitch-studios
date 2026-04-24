"use server"

import { eq, ne, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { adminRoles, adminRolePermissions } from "@/db/schema"
import { requirePermission, type Permission } from "@/lib/permissions"

export interface RoleWithPermissions {
  id: string
  name: string
  isDefault: boolean
  permissions: Permission[]
  createdAt: string
}

export interface AdminMember {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const DEFAULT_ROLES = ["owner", "editor", "manager"]

export async function getRoles(): Promise<RoleWithPermissions[]> {
  const roles = await db.query.adminRoles.findMany({
    with: { permissions: true },
    orderBy: (r, { asc }) => [asc(r.createdAt)],
  })

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    isDefault: r.isDefault ?? false,
    permissions: r.permissions.map((p) => p.permission as Permission),
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function createRole(
  name: string
): Promise<{ success: boolean; error?: string; role?: RoleWithPermissions }> {
  await requirePermission("manage_roles")

  const trimmed = name.trim().toLowerCase()
  if (!trimmed || trimmed.length < 2) {
    return { success: false, error: "Role name must be at least 2 characters" }
  }

  // Check uniqueness
  const existing = await db.query.adminRoles.findFirst({
    where: eq(adminRoles.name, trimmed),
  })
  if (existing) {
    return { success: false, error: "Role name already exists" }
  }

  try {
    const [inserted] = await db
      .insert(adminRoles)
      .values({ name: trimmed, isDefault: false })
      .returning()

    return {
      success: true,
      role: {
        id: inserted.id,
        name: inserted.name,
        isDefault: false,
        permissions: [],
        createdAt: inserted.createdAt.toISOString(),
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create role",
    }
  }
}

export async function deleteRole(
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  await requirePermission("manage_roles")

  const role = await db.query.adminRoles.findFirst({
    where: eq(adminRoles.id, roleId),
  })
  if (!role) return { success: false, error: "Role not found" }

  if (DEFAULT_ROLES.includes(role.name)) {
    return { success: false, error: "Cannot delete default roles" }
  }

  try {
    // Reassign users with this role to "user" role
    await db.execute(
      sql`UPDATE "user" SET role = 'user' WHERE role = ${role.name}`
    )

    // Delete role (cascade deletes permissions)
    await db.delete(adminRoles).where(eq(adminRoles.id, roleId))

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete role",
    }
  }
}

export async function updateRolePermissions(
  roleId: string,
  permissions: Permission[]
): Promise<{ success: boolean; error?: string }> {
  await requirePermission("manage_roles")

  const role = await db.query.adminRoles.findFirst({
    where: eq(adminRoles.id, roleId),
  })
  if (!role) return { success: false, error: "Role not found" }

  // Cannot modify owner role permissions
  if (role.name === "owner") {
    return { success: false, error: "Cannot modify owner role permissions" }
  }

  try {
    // Delete-and-reinsert pattern
    await db
      .delete(adminRolePermissions)
      .where(eq(adminRolePermissions.roleId, roleId))

    if (permissions.length > 0) {
      await db.insert(adminRolePermissions).values(
        permissions.map((p) => ({
          roleId,
          permission: p,
        }))
      )
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update permissions",
    }
  }
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  await requirePermission("manage_roles")

  const rows = await db.execute(sql`
    SELECT id, name, email, role, "createdAt" as created_at
    FROM "user"
    WHERE role != 'user'
    ORDER BY "createdAt" ASC
  `)

  return (rows as any[]).map((r) => ({
    id: r.id as string,
    name: (r.name as string) || (r.email as string).split("@")[0],
    email: r.email as string,
    role: r.role as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  }))
}

export async function assignRole(
  userId: string,
  roleName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission("manage_roles")

  // Cannot change another owner's role (only one owner)
  const targetUser = await db.execute(
    sql`SELECT id, role FROM "user" WHERE id = ${userId}`
  )
  const target = (targetUser as any[])[0]
  if (!target) return { success: false, error: "User not found" }

  if (target.role === "owner" && roleName !== "owner") {
    return { success: false, error: "Cannot change the owner's role" }
  }

  try {
    await db.execute(
      sql`UPDATE "user" SET role = ${roleName} WHERE id = ${userId}`
    )
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign role",
    }
  }
}

export async function removeAdminAccess(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requirePermission("manage_roles")

  // Cannot remove own admin access
  if (session.user.id === userId) {
    return { success: false, error: "Cannot remove your own admin access" }
  }

  // Cannot remove the last owner
  const targetUser = await db.execute(
    sql`SELECT id, role FROM "user" WHERE id = ${userId}`
  )
  const target = (targetUser as any[])[0]
  if (!target) return { success: false, error: "User not found" }

  if (target.role === "owner") {
    const ownerCount = await db.execute(
      sql`SELECT COUNT(*)::int as cnt FROM "user" WHERE role = 'owner'`
    )
    if (Number((ownerCount as any[])[0]?.cnt) <= 1) {
      return { success: false, error: "Cannot remove the last owner" }
    }
  }

  try {
    await db.execute(
      sql`UPDATE "user" SET role = 'user' WHERE id = ${userId}`
    )
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to remove admin access",
    }
  }
}
