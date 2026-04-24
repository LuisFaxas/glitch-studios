"use server"

import { db } from "@/lib/db"
import {
  techBenchmarkRuns,
  techBenchmarkTests,
  techReviews,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { z } from "zod"
import { RUBRIC_V1_1 } from "@/lib/tech/rubric-map"
import { computeBprScore } from "@/lib/tech/bpr"
import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"

// --- Types ---

export type PreviewRowStatus = "matched" | "duplicate" | "unknown"

export interface PreviewRow {
  lineIndex: number // 0-based index in parsed result lines array
  discipline: string
  tool: string
  field: string
  mode: "ac" | "battery"
  score: number
  unit: string
  testId: string | null // null if unknown rubric key
  testName: string | null
  status: PreviewRowStatus
  errorReason: string | null // D-06: inline error message for red rows
  existingRunId: string | null // for duplicate rows — old run that will be superseded
  existingScore: number | null // for duplicate rows — current score in DB
}

export interface DryRunResult {
  ok: boolean
  error: string | null // D-03: header hard-block message if present
  runUuid: string
  ambientTempC: number
  macosBuild: string
  lpmEnabled: boolean
  hostname: string
  startedAt: string
  rows: PreviewRow[]
  matchedCount: number
  duplicateCount: number
  unknownCount: number
  ambientBlocked: boolean // true when ambient_temp_c > 26 (D-09)
}

export interface ValidatedSession {
  reviewId: string
  productId: string
  runUuid: string
  ambientTempC: number
  macosBuild: string
  lpmEnabled: boolean
  hostname: string
  startedAt: string
  rows: PreviewRow[] // only matched + duplicate rows (unknown rows are skipped on commit)
  rubricVersion: string
  sourceFile: string | null
}

export interface CommitResult {
  ok: boolean
  error: string | null
  inserted: number
  superseded: number
  bprScore: number | null
  bprTier: string | null
  batchId: string
}

// --- Zod schemas (D-01 header, D-02 result line) ---

const HeaderSchema = z.object({
  type: z.literal("header"),
  run_uuid: z.string().uuid(),
  ambient_temp_c: z.number(),
  macos_build: z.string().min(1),
  lpm_enabled: z.boolean(),
  hostname: z.string().min(1),
  started_at: z.string().datetime(),
})

const BenchmarkDisciplineEnum = z.enum([
  "cpu",
  "gpu",
  "llm",
  "video",
  "dev",
  "python",
  "games",
  "memory",
  "storage",
  "thermal",
  "wireless",
  "display",
  "battery_life",
])

const ResultLineSchema = z.object({
  discipline: BenchmarkDisciplineEnum,
  tool: z.string().min(1),
  field: z.string().min(1),
  mode: z.enum(["ac", "battery"]),
  score: z.number().finite().nonnegative(),
  unit: z.string().min(1),
  timestamp: z.string().datetime(),
})

// --- Helper: empty DryRunResult for hard-block error returns ---

function emptyDryRun(error: string, header?: z.infer<typeof HeaderSchema>): DryRunResult {
  return {
    ok: false,
    error,
    runUuid: header?.run_uuid ?? "",
    ambientTempC: header?.ambient_temp_c ?? 0,
    macosBuild: header?.macos_build ?? "",
    lpmEnabled: header?.lpm_enabled ?? false,
    hostname: header?.hostname ?? "",
    startedAt: header?.started_at ?? "",
    rows: [],
    matchedCount: 0,
    duplicateCount: 0,
    unknownCount: 0,
    ambientBlocked: false,
  }
}

// --- ingestBenchmarkRunsDryRun ---

export async function ingestBenchmarkRunsDryRun(
  reviewId: string,
  jsonlText: string,
): Promise<DryRunResult> {
  await requirePermission("manage_content")

  // 1. Parse lines — skip blanks
  const lines = jsonlText.split("\n").filter((l) => l.trim().length > 0)

  if (lines.length === 0) {
    return emptyDryRun("File is empty — no lines found.")
  }

  // 2. Parse + validate header (D-03: hard-block if malformed)
  let headerRaw: unknown
  try {
    headerRaw = JSON.parse(lines[0])
  } catch {
    return emptyDryRun("Header parse error: line 1 is not valid JSON.")
  }
  const headerResult = HeaderSchema.safeParse(headerRaw)
  if (!headerResult.success) {
    const missing = headerResult.error.issues
      .map((e) => e.path.join("."))
      .join(", ")
    return emptyDryRun(
      `Header validation failed — missing or invalid fields: ${missing}. Re-export from Mac harness.`,
    )
  }
  const header = headerResult.data

  // 3. Get productId from review
  const review = await db.query.techReviews.findFirst({
    where: eq(techReviews.id, reviewId),
    columns: { id: true, productId: true },
  })
  if (!review) {
    return emptyDryRun(`Review ${reviewId} not found.`, header)
  }

  // 4. Parse result lines (lines[1..] — D-02 per-line Zod)
  const resultLines = lines.slice(1)
  const previewRows: PreviewRow[] = []

  for (let i = 0; i < resultLines.length; i++) {
    const lineIndex = i
    let parsed: unknown
    try {
      parsed = JSON.parse(resultLines[i])
    } catch {
      previewRows.push({
        lineIndex,
        discipline: "?",
        tool: "?",
        field: "?",
        mode: "ac",
        score: 0,
        unit: "",
        testId: null,
        testName: null,
        status: "unknown",
        errorReason: `Line ${i + 2}: not valid JSON`,
        existingRunId: null,
        existingScore: null,
      })
      continue
    }

    const lineResult = ResultLineSchema.safeParse(parsed)
    if (!lineResult.success) {
      const reason = lineResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ")
      const raw = parsed as Record<string, unknown>
      previewRows.push({
        lineIndex,
        discipline: String(raw?.discipline ?? "?"),
        tool: String(raw?.tool ?? "?"),
        field: String(raw?.field ?? "?"),
        mode: "ac",
        score: 0,
        unit: "",
        testId: null,
        testName: null,
        status: "unknown",
        errorReason: reason,
        existingRunId: null,
        existingScore: null,
      })
      continue
    }

    const line = lineResult.data
    const rubricKey = `${line.discipline}:${line.tool}:${line.field}`
    const rubricEntry = RUBRIC_V1_1[rubricKey]

    if (!rubricEntry) {
      previewRows.push({
        lineIndex,
        discipline: line.discipline,
        tool: line.tool,
        field: line.field,
        mode: line.mode,
        score: line.score,
        unit: line.unit,
        testId: null,
        testName: null,
        status: "unknown",
        errorReason: `Unknown rubric key: "${rubricKey}" — not in RUBRIC_V1_1`,
        existingRunId: null,
        existingScore: null,
      })
      continue
    }

    // Look up test id by name + discipline in DB
    const [test] = await db
      .select({ id: techBenchmarkTests.id, name: techBenchmarkTests.name })
      .from(techBenchmarkTests)
      .where(
        and(
          eq(techBenchmarkTests.name, rubricEntry.name),
          eq(techBenchmarkTests.discipline, line.discipline),
        ),
      )
      .limit(1)

    if (!test) {
      previewRows.push({
        lineIndex,
        discipline: line.discipline,
        tool: line.tool,
        field: line.field,
        mode: line.mode,
        score: line.score,
        unit: line.unit,
        testId: null,
        testName: rubricEntry.name,
        status: "unknown",
        errorReason: `Test "${rubricEntry.name}" not found in tech_benchmark_tests — run rubric seed`,
        existingRunId: null,
        existingScore: null,
      })
      continue
    }

    // Check for existing non-superseded run for this (product, test, mode)
    const [existingRun] = await db
      .select({
        id: techBenchmarkRuns.id,
        score: techBenchmarkRuns.score,
      })
      .from(techBenchmarkRuns)
      .where(
        and(
          eq(techBenchmarkRuns.productId, review.productId),
          eq(techBenchmarkRuns.testId, test.id),
          eq(techBenchmarkRuns.mode, line.mode),
          eq(techBenchmarkRuns.superseded, false),
        ),
      )
      .limit(1)

    const status: PreviewRowStatus = existingRun ? "duplicate" : "matched"
    previewRows.push({
      lineIndex,
      discipline: line.discipline,
      tool: line.tool,
      field: line.field,
      mode: line.mode,
      score: line.score,
      unit: line.unit,
      testId: test.id,
      testName: test.name,
      status,
      errorReason: null,
      existingRunId: existingRun?.id ?? null,
      existingScore: existingRun ? parseFloat(existingRun.score) : null,
    })
  }

  const matchedCount = previewRows.filter((r) => r.status === "matched").length
  const duplicateCount = previewRows.filter(
    (r) => r.status === "duplicate",
  ).length
  const unknownCount = previewRows.filter((r) => r.status === "unknown").length
  const ambientBlocked = header.ambient_temp_c > 26

  return {
    ok: true,
    error: null,
    runUuid: header.run_uuid,
    ambientTempC: header.ambient_temp_c,
    macosBuild: header.macos_build,
    lpmEnabled: header.lpm_enabled,
    hostname: header.hostname,
    startedAt: header.started_at,
    rows: previewRows,
    matchedCount,
    duplicateCount,
    unknownCount,
    ambientBlocked,
  }
}

// --- commitBenchmarkIngest ---

export async function commitBenchmarkIngest(
  reviewId: string,
  validatedSession: ValidatedSession,
  opts: {
    confirmSupersede: boolean
    ambientOverride?: { reason: string }
    sourceFile?: string
  },
): Promise<CommitResult> {
  const session = await requirePermission("manage_content")

  // D-15 Step 1: Re-validate server-side (defense against client tampering)
  if (
    !validatedSession.reviewId ||
    !validatedSession.productId ||
    !validatedSession.runUuid
  ) {
    return {
      ok: false,
      error: "Invalid session — missing required fields.",
      inserted: 0,
      superseded: 0,
      bprScore: null,
      bprTier: null,
      batchId: "",
    }
  }

  const duplicateRows = validatedSession.rows.filter(
    (r) => r.status === "duplicate",
  )
  if (duplicateRows.length > 0 && !opts.confirmSupersede) {
    return {
      ok: false,
      error: `Supersede not confirmed — ${duplicateRows.length} existing runs would be superseded. Check the confirmation checkbox.`,
      inserted: 0,
      superseded: 0,
      bprScore: null,
      bprTier: null,
      batchId: "",
    }
  }

  // D-09: ambient override requires reason of >=10 chars when ambientTempC > 26
  if (validatedSession.ambientTempC > 26 && !opts.ambientOverride?.reason) {
    return {
      ok: false,
      error: `Ambient temperature ${validatedSession.ambientTempC}°C exceeds 26°C threshold. Provide an override reason.`,
      inserted: 0,
      superseded: 0,
      bprScore: null,
      bprTier: null,
      batchId: "",
    }
  }
  if (
    opts.ambientOverride?.reason &&
    opts.ambientOverride.reason.trim().length < 10
  ) {
    return {
      ok: false,
      error: "Override reason must be at least 10 characters.",
      inserted: 0,
      superseded: 0,
      bprScore: null,
      bprTier: null,
      batchId: "",
    }
  }

  const rowsToProcess = validatedSession.rows.filter(
    (r) =>
      (r.status === "matched" || r.status === "duplicate") && r.testId !== null,
  )

  if (rowsToProcess.length === 0) {
    return {
      ok: false,
      error: "No rows to insert — all lines were unknown or invalid.",
      inserted: 0,
      superseded: 0,
      bprScore: null,
      bprTier: null,
      batchId: "",
    }
  }

  const batchId = randomUUID()
  // D-09: run_flagged reason applied to EVERY row if ambient override
  const runFlagged = opts.ambientOverride?.reason?.trim() ?? null

  let insertedCount = 0
  let supersededCount = 0

  // D-15 Step 2: Open transaction (D-08: supersede + insert + BPR update atomic)
  await db.transaction(async (tx) => {
    // D-15 Step 3: Mark duplicate rows superseded
    for (const row of duplicateRows) {
      if (!row.existingRunId) continue
      await tx
        .update(techBenchmarkRuns)
        .set({ superseded: true })
        .where(eq(techBenchmarkRuns.id, row.existingRunId))
      supersededCount++
    }

    // D-15 Step 4: Insert all new rows
    for (const row of rowsToProcess) {
      if (!row.testId) continue
      await tx.insert(techBenchmarkRuns).values({
        productId: validatedSession.productId,
        testId: row.testId,
        mode: row.mode,
        runUuid: validatedSession.runUuid,
        rubricVersion: validatedSession.rubricVersion,
        ingestBatchId: batchId,
        score: String(row.score),
        ambientTempC:
          validatedSession.ambientTempC !== undefined &&
          validatedSession.ambientTempC !== null
            ? String(validatedSession.ambientTempC)
            : null,
        macosBuild: validatedSession.macosBuild,
        runFlagged, // D-09: set on EVERY row if ambient override, null otherwise
        sourceFile: opts.sourceFile ?? validatedSession.sourceFile ?? null,
        createdBy: session.user.id,
      })
      insertedCount++
    }

    // D-15 Step 5: Recompute BPR within the same transaction. Pass `tx` so
    // computeBprScore queries run on the same connection and can see the
    // uncommitted rows just inserted above. Without tx, a new pool connection
    // would use READ COMMITTED and miss the uncommitted inserts.
    const bprResult = await computeBprScore(
      validatedSession.productId,
      { rubricVersion: validatedSession.rubricVersion },
      tx,
    )

    const bprDisciplineCount = Object.values(bprResult.perDiscipline).filter(
      (v) => v !== null,
    ).length

    // Update tech_reviews.bpr_score + bpr_tier atomically within the same transaction
    await tx
      .update(techReviews)
      .set({
        bprScore: bprResult.score !== null ? String(bprResult.score) : null,
        bprTier: bprResult.tier ?? null,
        bprDisciplineCount,
      })
      .where(eq(techReviews.id, validatedSession.reviewId))
  })

  // Fetch final BPR values + slug to return to UI + revalidate review detail
  const updatedReview = await db.query.techReviews.findFirst({
    where: eq(techReviews.id, validatedSession.reviewId),
    columns: { bprScore: true, bprTier: true, slug: true },
  })

  // D-15 Step 6: revalidatePath after commit
  if (updatedReview?.slug) {
    revalidatePath(`/tech/reviews/${updatedReview.slug}`)
  }
  revalidatePath("/tech/reviews") // reviews list
  revalidatePath("/tech") // homepage spotlight
  revalidatePath("/admin/tech/reviews") // admin list
  revalidatePath(`/admin/tech/reviews/${reviewId}/edit`) // admin edit page
  // Leaderboard placeholder — no-op on non-existent route, safe per D-15 note
  revalidatePath("/tech/categories/laptops/rankings")

  return {
    ok: true,
    error: null,
    inserted: insertedCount,
    superseded: supersededCount,
    bprScore:
      updatedReview?.bprScore !== null && updatedReview?.bprScore !== undefined
        ? parseFloat(updatedReview.bprScore)
        : null,
    bprTier: updatedReview?.bprTier ?? null,
    batchId,
  }
}
