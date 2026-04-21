"use server"

import { db } from "@/lib/db"
import {
  techBenchmarkRuns,
  techBenchmarkTests,
  techProducts,
} from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export interface BenchmarkRunInput {
  productId: string
  testId: string
  score: number
  notes: string | null
  /** Power mode for the run. Defaults to 'ac' for manual admin entries. */
  mode?: "ac" | "battery"
}

export interface BenchmarkRunRow {
  id: string
  productId: string
  productName: string | null
  testId: string
  testName: string | null
  unit: string | null
  score: string
  notes: string | null
  recordedAt: Date
}

export async function listBenchmarkRuns(): Promise<BenchmarkRunRow[]> {
  const rows = await db
    .select({
      id: techBenchmarkRuns.id,
      productId: techBenchmarkRuns.productId,
      productName: techProducts.name,
      testId: techBenchmarkRuns.testId,
      testName: techBenchmarkTests.name,
      unit: techBenchmarkTests.unit,
      score: techBenchmarkRuns.score,
      notes: techBenchmarkRuns.notes,
      recordedAt: techBenchmarkRuns.recordedAt,
    })
    .from(techBenchmarkRuns)
    .leftJoin(techProducts, eq(techBenchmarkRuns.productId, techProducts.id))
    .leftJoin(techBenchmarkTests, eq(techBenchmarkRuns.testId, techBenchmarkTests.id))
    .orderBy(desc(techBenchmarkRuns.recordedAt))
  return rows
}

export async function createRun(data: BenchmarkRunInput): Promise<{ id: string }> {
  const session = await requirePermission("manage_content")
  if (!Number.isFinite(data.score)) throw new Error("Score must be numeric")
  const [inserted] = await db
    .insert(techBenchmarkRuns)
    .values({
      productId: data.productId,
      testId: data.testId,
      mode: data.mode ?? "ac",
      runUuid: crypto.randomUUID(),
      score: String(data.score),
      notes: data.notes?.trim() || null,
      createdBy: session.user.id,
    })
    .returning({ id: techBenchmarkRuns.id })
  revalidatePath("/admin/tech/benchmarks")
  revalidatePath(`/admin/tech/products/${data.productId}/edit`)
  return { id: inserted.id }
}

export async function deleteRun(id: string): Promise<void> {
  await requirePermission("manage_content")
  const run = await db.query.techBenchmarkRuns.findFirst({
    where: eq(techBenchmarkRuns.id, id),
  })
  await db.delete(techBenchmarkRuns).where(eq(techBenchmarkRuns.id, id))
  revalidatePath("/admin/tech/benchmarks")
  if (run?.productId) {
    revalidatePath(`/admin/tech/products/${run.productId}/edit`)
  }
}
