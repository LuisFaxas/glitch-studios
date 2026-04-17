"use server"

import { db } from "@/lib/db"
import {
  techProducts,
  techProductSpecs,
  techSpecFields,
  techCategories,
  mediaAssets,
} from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { slugify } from "@/lib/slugify"
import { revalidatePath } from "next/cache"

export interface ProductSpecValue {
  fieldId: string
  value: string | number | boolean | null
}

export interface ProductFormInput {
  name: string
  slug: string | null
  manufacturer: string | null
  categoryId: string
  heroImageId: string | null
  summary: string | null
  priceUsd: number | null
  affiliateUrl: string | null
  releaseDate: string | null
  specs: ProductSpecValue[]
}

export interface ProductListRow {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  categoryId: string
  categoryName: string | null
  heroImageUrl: string | null
  priceUsd: string | null
  createdAt: Date
  updatedAt: Date
}

export async function listProducts(): Promise<ProductListRow[]> {
  const rows = await db
    .select({
      id: techProducts.id,
      name: techProducts.name,
      slug: techProducts.slug,
      manufacturer: techProducts.manufacturer,
      categoryId: techProducts.categoryId,
      categoryName: techCategories.name,
      heroImageUrl: mediaAssets.url,
      priceUsd: techProducts.priceUsd,
      createdAt: techProducts.createdAt,
      updatedAt: techProducts.updatedAt,
    })
    .from(techProducts)
    .leftJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
    .leftJoin(mediaAssets, eq(techProducts.heroImageId, mediaAssets.id))
    .orderBy(desc(techProducts.updatedAt))
  return rows
}

export async function getProduct(id: string) {
  const product = await db.query.techProducts.findFirst({
    where: eq(techProducts.id, id),
  })
  if (!product) return null

  const specRows = await db
    .select({
      fieldId: techProductSpecs.fieldId,
      valueText: techProductSpecs.valueText,
      valueNumber: techProductSpecs.valueNumber,
      valueBoolean: techProductSpecs.valueBoolean,
      fieldType: techSpecFields.type,
    })
    .from(techProductSpecs)
    .innerJoin(techSpecFields, eq(techProductSpecs.fieldId, techSpecFields.id))
    .where(eq(techProductSpecs.productId, id))

  const specs: ProductSpecValue[] = specRows.map((r) => ({
    fieldId: r.fieldId,
    value:
      r.fieldType === "number"
        ? r.valueNumber !== null
          ? Number(r.valueNumber)
          : null
        : r.fieldType === "boolean"
          ? r.valueBoolean
          : r.valueText,
  }))

  return { ...product, specs }
}

async function resolveUniqueProductSlug(base: string, excludeId?: string): Promise<string> {
  if (!base) throw new Error("Product name produces an empty slug")
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? base : `${base}-${suffix}`
    const row = await db.query.techProducts.findFirst({
      where: eq(techProducts.slug, candidate),
    })
    if (!row || row.id === excludeId) return candidate
    suffix++
  }
}

async function writeSpecValues(productId: string, specs: ProductSpecValue[]) {
  if (specs.length === 0) return
  const fieldIds = specs.map((s) => s.fieldId)
  const fields = await db.query.techSpecFields.findMany({
    where: inArray(techSpecFields.id, fieldIds),
  })
  const fieldById = new Map(fields.map((f) => [f.id, f]))

  for (const spec of specs) {
    const field = fieldById.get(spec.fieldId)
    if (!field) continue
    await db.insert(techProductSpecs).values({
      productId,
      fieldId: spec.fieldId,
      valueText:
        field.type === "text" || field.type === "enum"
          ? spec.value !== null && spec.value !== undefined
            ? String(spec.value)
            : null
          : null,
      valueNumber:
        field.type === "number" && spec.value !== null && spec.value !== undefined
          ? String(spec.value)
          : null,
      valueBoolean: field.type === "boolean" ? Boolean(spec.value) : null,
    })
  }
}

export async function createProduct(data: ProductFormInput): Promise<{ id: string }> {
  await requirePermission("manage_content")
  if (!data.name.trim()) throw new Error("Name is required")
  if (!data.categoryId) throw new Error("Category is required")

  const slugBase = data.slug?.trim() || slugify(data.name)
  const slug = await resolveUniqueProductSlug(slugBase)

  const [inserted] = await db
    .insert(techProducts)
    .values({
      name: data.name.trim(),
      slug,
      manufacturer: data.manufacturer?.trim() || null,
      categoryId: data.categoryId,
      heroImageId: data.heroImageId,
      summary: data.summary?.trim() || null,
      priceUsd: data.priceUsd !== null ? String(data.priceUsd) : null,
      affiliateUrl: data.affiliateUrl?.trim() || null,
      releaseDate: data.releaseDate,
    })
    .returning({ id: techProducts.id })

  await writeSpecValues(inserted.id, data.specs)

  revalidatePath("/admin/tech/products")
  return { id: inserted.id }
}

export async function updateProduct(id: string, data: ProductFormInput): Promise<void> {
  await requirePermission("manage_content")
  if (!data.name.trim()) throw new Error("Name is required")
  if (!data.categoryId) throw new Error("Category is required")

  const slugBase = data.slug?.trim() || slugify(data.name)
  const slug = await resolveUniqueProductSlug(slugBase, id)

  await db
    .update(techProducts)
    .set({
      name: data.name.trim(),
      slug,
      manufacturer: data.manufacturer?.trim() || null,
      categoryId: data.categoryId,
      heroImageId: data.heroImageId,
      summary: data.summary?.trim() || null,
      priceUsd: data.priceUsd !== null ? String(data.priceUsd) : null,
      affiliateUrl: data.affiliateUrl?.trim() || null,
      releaseDate: data.releaseDate,
      updatedAt: new Date(),
    })
    .where(eq(techProducts.id, id))

  await db.delete(techProductSpecs).where(eq(techProductSpecs.productId, id))
  await writeSpecValues(id, data.specs)

  revalidatePath("/admin/tech/products")
  revalidatePath(`/admin/tech/products/${id}/edit`)
}

export async function deleteProduct(id: string): Promise<void> {
  await requirePermission("manage_content")
  await db.delete(techProducts).where(eq(techProducts.id, id))
  revalidatePath("/admin/tech/products")
}
