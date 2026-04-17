"use server"

import { db } from "@/lib/db"
import {
  techSpecTemplates,
  techSpecFields,
  techBenchmarkTemplates,
  techBenchmarkTests,
} from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export interface SpecFieldInput {
  id?: string
  name: string
  type: "text" | "number" | "enum" | "boolean"
  unit: string | null
  enumOptions: string[] | null
}

export interface SpecTemplateData {
  id: string
  categoryId: string
  fields: {
    id: string
    name: string
    type: "text" | "number" | "enum" | "boolean"
    unit: string | null
    enumOptions: string[] | null
    sortOrder: number
  }[]
}

export async function getSpecTemplate(categoryId: string): Promise<SpecTemplateData | null> {
  const template = await db.query.techSpecTemplates.findFirst({
    where: eq(techSpecTemplates.categoryId, categoryId),
  })
  if (!template) return null

  const fields = await db
    .select({
      id: techSpecFields.id,
      name: techSpecFields.name,
      type: techSpecFields.type,
      unit: techSpecFields.unit,
      enumOptions: techSpecFields.enumOptions,
      sortOrder: techSpecFields.sortOrder,
    })
    .from(techSpecFields)
    .where(eq(techSpecFields.templateId, template.id))
    .orderBy(asc(techSpecFields.sortOrder))

  return {
    id: template.id,
    categoryId: template.categoryId,
    fields: fields.map((f) => ({
      ...f,
      enumOptions: f.enumOptions as string[] | null,
    })),
  }
}

export async function saveSpecTemplate(
  categoryId: string,
  fields: SpecFieldInput[],
): Promise<void> {
  await requirePermission("manage_settings")

  const names = new Set<string>()
  for (const f of fields) {
    const trimmed = f.name.trim()
    if (!trimmed) throw new Error("Field name is required")
    if (names.has(trimmed.toLowerCase())) {
      throw new Error(`Duplicate field name: ${trimmed}`)
    }
    names.add(trimmed.toLowerCase())
    if (f.type === "number" && !f.unit?.trim()) {
      throw new Error(`Field "${trimmed}" of type number requires a unit`)
    }
    if (f.type === "enum") {
      const opts = (f.enumOptions ?? []).map((o) => o.trim()).filter(Boolean)
      if (opts.length < 2) {
        throw new Error(`Field "${trimmed}" of type enum requires at least 2 options`)
      }
    }
  }

  let template = await db.query.techSpecTemplates.findFirst({
    where: eq(techSpecTemplates.categoryId, categoryId),
  })
  if (!template) {
    const [created] = await db
      .insert(techSpecTemplates)
      .values({ categoryId })
      .returning()
    template = created
  }

  await db.delete(techSpecFields).where(eq(techSpecFields.templateId, template.id))

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    await db.insert(techSpecFields).values({
      templateId: template.id,
      name: f.name.trim(),
      type: f.type,
      unit: f.type === "number" ? f.unit!.trim() : null,
      enumOptions:
        f.type === "enum"
          ? (f.enumOptions ?? []).map((o) => o.trim()).filter(Boolean)
          : null,
      sortOrder: (i + 1) * 100,
    })
  }

  revalidatePath("/admin/tech/categories")
}

export interface BenchmarkTestInput {
  id?: string
  name: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
}

export interface BenchmarkTemplateData {
  id: string
  categoryId: string
  tests: {
    id: string
    name: string
    unit: string
    direction: "higher_is_better" | "lower_is_better"
    sortOrder: number
  }[]
}

export async function getBenchmarkTemplate(
  categoryId: string,
): Promise<BenchmarkTemplateData | null> {
  const template = await db.query.techBenchmarkTemplates.findFirst({
    where: eq(techBenchmarkTemplates.categoryId, categoryId),
  })
  if (!template) return null

  const tests = await db
    .select({
      id: techBenchmarkTests.id,
      name: techBenchmarkTests.name,
      unit: techBenchmarkTests.unit,
      direction: techBenchmarkTests.direction,
      sortOrder: techBenchmarkTests.sortOrder,
    })
    .from(techBenchmarkTests)
    .where(eq(techBenchmarkTests.templateId, template.id))
    .orderBy(asc(techBenchmarkTests.sortOrder))

  return { id: template.id, categoryId: template.categoryId, tests }
}

export async function saveBenchmarkTemplate(
  categoryId: string,
  tests: BenchmarkTestInput[],
): Promise<void> {
  await requirePermission("manage_settings")

  const names = new Set<string>()
  for (const t of tests) {
    if (!t.name.trim()) throw new Error("Test name is required")
    if (!t.unit.trim()) throw new Error(`Test "${t.name}" requires a unit`)
    if (names.has(t.name.trim().toLowerCase())) {
      throw new Error(`Duplicate test name: ${t.name}`)
    }
    names.add(t.name.trim().toLowerCase())
  }

  let template = await db.query.techBenchmarkTemplates.findFirst({
    where: eq(techBenchmarkTemplates.categoryId, categoryId),
  })
  if (!template) {
    const [created] = await db
      .insert(techBenchmarkTemplates)
      .values({ categoryId })
      .returning()
    template = created
  }

  await db
    .delete(techBenchmarkTests)
    .where(eq(techBenchmarkTests.templateId, template.id))

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    await db.insert(techBenchmarkTests).values({
      templateId: template.id,
      name: t.name.trim(),
      unit: t.unit.trim(),
      direction: t.direction,
      sortOrder: (i + 1) * 100,
    })
  }

  revalidatePath("/admin/tech/categories")
}
