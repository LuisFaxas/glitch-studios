"use server"

import { db } from "@/lib/db"
import {
  techCategories,
  techProducts,
} from "@/db/schema"
import { eq, isNull, asc, count } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { slugify } from "@/lib/slugify"
import { revalidatePath } from "next/cache"

export interface CategoryTreeNode {
  id: string
  parentId: string | null
  level: number
  name: string
  slug: string
  sortOrder: number
  productCount: number
  children: CategoryTreeNode[]
}

export async function listCategoriesTree(): Promise<CategoryTreeNode[]> {
  const rows = await db
    .select({
      id: techCategories.id,
      parentId: techCategories.parentId,
      level: techCategories.level,
      name: techCategories.name,
      slug: techCategories.slug,
      sortOrder: techCategories.sortOrder,
    })
    .from(techCategories)
    .orderBy(asc(techCategories.level), asc(techCategories.sortOrder), asc(techCategories.name))

  const productRows = await db
    .select({
      categoryId: techProducts.categoryId,
      total: count(techProducts.id),
    })
    .from(techProducts)
    .groupBy(techProducts.categoryId)

  const productCounts = new Map(productRows.map((r) => [r.categoryId, Number(r.total)]))

  const byId = new Map<string, CategoryTreeNode>()
  for (const r of rows) {
    byId.set(r.id, {
      ...r,
      productCount: productCounts.get(r.id) ?? 0,
      children: [],
    })
  }

  const roots: CategoryTreeNode[] = []
  for (const node of byId.values()) {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      const parent = byId.get(node.parentId)
      if (parent) parent.children.push(node)
    }
  }
  return roots
}

export async function createCategory(input: {
  parentId: string | null
  name: string
}): Promise<{ id: string }> {
  await requirePermission("manage_settings")
  const name = input.name.trim()
  if (!name) throw new Error("Name is required")

  let level = 0
  if (input.parentId) {
    const parent = await db.query.techCategories.findFirst({
      where: eq(techCategories.id, input.parentId),
    })
    if (!parent) throw new Error("Parent category not found")
    if (parent.level >= 2) throw new Error("Cannot nest deeper than 3 levels")
    level = parent.level + 1
  }

  const siblingWhere = input.parentId
    ? eq(techCategories.parentId, input.parentId)
    : isNull(techCategories.parentId)
  const siblings = await db
    .select({ sortOrder: techCategories.sortOrder })
    .from(techCategories)
    .where(siblingWhere)
  const nextSort = siblings.length
    ? Math.max(...siblings.map((s) => s.sortOrder)) + 100
    : 100

  let slug = slugify(name)
  if (!slug) throw new Error("Name produces an empty slug")
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`
    const exists = await db.query.techCategories.findFirst({
      where: eq(techCategories.slug, candidate),
    })
    if (!exists) {
      slug = candidate
      break
    }
    suffix++
  }

  const [inserted] = await db
    .insert(techCategories)
    .values({
      parentId: input.parentId,
      level,
      name,
      slug,
      sortOrder: nextSort,
    })
    .returning({ id: techCategories.id })

  revalidatePath("/admin/tech/categories")
  return { id: inserted.id }
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await requirePermission("manage_settings")
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Name is required")
  await db
    .update(techCategories)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(techCategories.id, id))
  revalidatePath("/admin/tech/categories")
}

export async function reorderCategories(
  _parentId: string | null,
  orderedIds: string[],
): Promise<void> {
  await requirePermission("manage_settings")
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    await db
      .update(techCategories)
      .set({ sortOrder: (i + 1) * 100, updatedAt: new Date() })
      .where(eq(techCategories.id, id))
  }
  revalidatePath("/admin/tech/categories")
}

export async function deleteCategory(id: string): Promise<void> {
  await requirePermission("manage_settings")

  const children = await db.query.techCategories.findFirst({
    where: eq(techCategories.parentId, id),
  })
  if (children) throw new Error("Category has subcategories. Move or delete them first.")

  const [productCount] = await db
    .select({ total: count(techProducts.id) })
    .from(techProducts)
    .where(eq(techProducts.categoryId, id))
  if (Number(productCount.total) > 0) {
    throw new Error(
      `Category has ${productCount.total} products. Reassign or delete them first.`,
    )
  }

  await db.delete(techCategories).where(eq(techCategories.id, id))
  revalidatePath("/admin/tech/categories")
}
