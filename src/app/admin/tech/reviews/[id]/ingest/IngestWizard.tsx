"use client"

import { useState, useRef } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import {
  ingestBenchmarkRunsDryRun,
  commitBenchmarkIngest,
} from "@/actions/admin-tech-ingest"
import type {
  DryRunResult,
  ValidatedSession,
  CommitResult,
  PreviewRow,
} from "@/actions/admin-tech-ingest"

// --- Wizard state type ---

type WizardStep = "upload" | "preview" | "done"

// Disciplines in display order (D-04)
const DISCIPLINES = [
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
] as const

const DISCIPLINE_LABELS: Record<string, string> = {
  cpu: "CPU",
  gpu: "GPU",
  llm: "LLM / AI",
  video: "Video Export",
  dev: "Dev / Compile",
  python: "Python",
  games: "Games",
  memory: "Memory",
  storage: "Storage",
  thermal: "Thermal",
  wireless: "Wireless + Ports",
  display: "Display",
  battery_life: "Battery Life",
}

interface Props {
  reviewId: string
  productId: string
  reviewSlug: string
}

export function IngestWizard({ reviewId, productId, reviewSlug }: Props) {
  const [step, setStep] = useState<WizardStep>("upload")
  const [mode, setMode] = useState<"ac" | "battery">("ac")
  const [loading, setLoading] = useState(false)
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null)
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null)
  const [confirmSupersede, setConfirmSupersede] = useState(false)
  const [ambientOverrideChecked, setAmbientOverrideChecked] = useState(false)
  const [ambientOverrideReason, setAmbientOverrideReason] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [headerError, setHeaderError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function resetWizard(toStep: WizardStep = "upload") {
    setStep(toStep)
    setDryRun(null)
    setCommitResult(null)
    setConfirmSupersede(false)
    setAmbientOverrideChecked(false)
    setAmbientOverrideReason("")
    setExpandedRows(new Set())
    setHeaderError(null)
    if (toStep === "upload" && fileRef.current) {
      fileRef.current.value = ""
    }
  }

  // --- Step 1: Upload → dry-run ---
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error("Select a JSONL file first.")
      return
    }
    setLoading(true)
    setHeaderError(null)
    try {
      const text = await file.text()
      const result = await ingestBenchmarkRunsDryRun(reviewId, text)
      if (!result.ok) {
        // D-03: header hard-block — surface error on Step 1, do not advance
        setHeaderError(result.error ?? "Dry-run failed.")
        toast.error(result.error ?? "Dry-run failed.")
        setDryRun(null)
        return
      }
      setDryRun(result)
      setStep("preview")
      toast.success(
        `Dry-run complete: ${result.matchedCount} matched · ${result.duplicateCount} duplicate · ${result.unknownCount} unknown`,
      )
    } catch (err) {
      console.error(err)
      toast.error("Unexpected error during dry-run.")
    } finally {
      setLoading(false)
    }
  }

  // --- Step 2 → 3: Commit ---
  async function handleCommit() {
    if (!dryRun || !dryRun.ok) return
    setLoading(true)
    try {
      const validatedSession: ValidatedSession = {
        reviewId,
        productId,
        runUuid: dryRun.runUuid,
        ambientTempC: dryRun.ambientTempC,
        macosBuild: dryRun.macosBuild,
        lpmEnabled: dryRun.lpmEnabled,
        hostname: dryRun.hostname,
        startedAt: dryRun.startedAt,
        // Send matched + duplicate rows only — unknown rows are skipped on commit
        rows: dryRun.rows.filter(
          (r) => r.status === "matched" || r.status === "duplicate",
        ),
        rubricVersion: "1.1",
        sourceFile: fileRef.current?.files?.[0]?.name ?? null,
      }

      const sourceFile = fileRef.current?.files?.[0]?.name ?? undefined
      const ambientOverride =
        ambientOverrideChecked &&
        ambientOverrideReason.trim().length >= 10
          ? { reason: ambientOverrideReason.trim() }
          : undefined

      const result = await commitBenchmarkIngest(reviewId, validatedSession, {
        confirmSupersede,
        ambientOverride,
        sourceFile,
      })

      setCommitResult(result)
      if (result.ok) {
        setStep("done")
        toast.success(
          `Ingested ${result.inserted} runs · BPR: ${
            result.bprTier ? result.bprTier.toUpperCase() : "pending"
          }`,
        )
      } else {
        toast.error(result.error ?? "Commit failed.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Unexpected error during commit.")
    } finally {
      setLoading(false)
    }
  }

  // --- Derived state ---
  const totalCommittable = dryRun
    ? dryRun.matchedCount + dryRun.duplicateCount
    : 0
  const ambientGateOk =
    !dryRun?.ambientBlocked ||
    (ambientOverrideChecked && ambientOverrideReason.trim().length >= 10)
  const supersedeGateOk =
    !dryRun || dryRun.duplicateCount === 0 || confirmSupersede
  const commitEnabled =
    !!dryRun?.ok && totalCommittable > 0 && ambientGateOk && supersedeGateOk

  // --- Render helpers ---
  function rowsByDiscipline(disc: string): PreviewRow[] {
    return dryRun?.rows.filter((r) => r.discipline === disc) ?? []
  }

  function disciplinePill(disc: string) {
    const rows = rowsByDiscipline(disc)
    const m = rows.filter((r) => r.status === "matched").length
    const d = rows.filter((r) => r.status === "duplicate").length
    const u = rows.filter((r) => r.status === "unknown").length
    return `${m} matched · ${d} dup · ${u} unknown`
  }

  function statusIcon(status: PreviewRow["status"]) {
    if (status === "matched")
      return (
        <span className="text-green-500 font-bold" aria-label="matched">
          ✓
        </span>
      )
    if (status === "duplicate")
      return (
        <span className="text-yellow-500 font-bold" aria-label="duplicate">
          ⟳
        </span>
      )
    return (
      <span className="text-red-500 font-bold" aria-label="unknown">
        ✗
      </span>
    )
  }

  function toggleRowExpanded(lineIndex: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(lineIndex)) next.delete(lineIndex)
      else next.add(lineIndex)
      return next
    })
  }

  const disciplinesWithRows = DISCIPLINES.filter(
    (d) => rowsByDiscipline(d).length > 0,
  )

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        {(["upload", "preview", "done"] as WizardStep[]).map((s, i) => (
          <span
            key={s}
            className={step === s ? "font-semibold text-foreground" : ""}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {/* --- STEP 1: Upload --- */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload JSONL File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label
                  htmlFor="jsonl-file"
                  className="block text-sm font-medium mb-1"
                >
                  JSONL File
                </label>
                <input
                  ref={fileRef}
                  id="jsonl-file"
                  type="file"
                  accept=".jsonl,application/jsonl,application/x-ndjson,text/plain"
                  className="block w-full text-sm border rounded-md px-3 py-2 bg-background"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Exported from the Mac bench harness (first line: header
                  object, subsequent lines: result rows).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <div className="flex gap-4">
                  {(["ac", "battery"] as const).map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={m}
                        checked={mode === m}
                        onChange={() => setMode(m)}
                      />
                      <span>{m === "ac" ? "AC (plugged in)" : "Battery"}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per-row mode is read from each JSONL entry. This selector is
                  informational and records the intended session mode.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rubric version
                </label>
                <div className="text-sm">
                  <Badge variant="secondary">v1.1</Badge>
                </div>
              </div>

              {headerError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-500 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200"
                >
                  <div className="font-medium">Header validation failed</div>
                  <div className="mt-1">{headerError}</div>
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Running dry-run…" : "Preview Import"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* --- STEP 2: Preview --- */}
      {step === "preview" && dryRun && (
        <div className="space-y-4">
          {/* Header metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Session Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>
                <span className="font-medium">Run UUID:</span>{" "}
                <span className="font-mono text-xs">{dryRun.runUuid}</span>
              </div>
              <div>
                <span className="font-medium">macOS Build:</span>{" "}
                {dryRun.macosBuild}
              </div>
              <div>
                <span className="font-medium">Ambient Temp:</span>{" "}
                {dryRun.ambientTempC}°C{" "}
                {dryRun.ambientBlocked ? (
                  <Badge variant="destructive" className="ml-1">
                    ABOVE THRESHOLD
                  </Badge>
                ) : null}
              </div>
              <div>
                <span className="font-medium">LPM:</span>{" "}
                {dryRun.lpmEnabled ? "Yes" : "No"}
                {" · "}
                <span className="font-medium">Host:</span> {dryRun.hostname}
              </div>
              <div>
                <span className="font-medium">Started:</span> {dryRun.startedAt}
              </div>
              <div className="font-medium pt-2">
                Total: {dryRun.matchedCount} matched ·{" "}
                {dryRun.duplicateCount} duplicate · {dryRun.unknownCount}{" "}
                unknown
              </div>
            </CardContent>
          </Card>

          {/* D-09: Ambient block banner */}
          {dryRun.ambientBlocked && (
            <div
              role="alert"
              className="rounded-md border border-amber-500 bg-amber-50 dark:bg-amber-950 p-4 space-y-3"
            >
              <p className="font-medium text-amber-900 dark:text-amber-100">
                ⚠ Ambient {dryRun.ambientTempC}°C exceeds 26°C threshold —
                results may be thermally throttled.
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={ambientOverrideChecked}
                  onCheckedChange={(v) => setAmbientOverrideChecked(!!v)}
                />
                <span className="text-sm">Override and ingest anyway</span>
              </label>
              {ambientOverrideChecked && (
                <div className="space-y-1">
                  <Textarea
                    placeholder="Override reason (required, ≥10 chars) — e.g. 'AC unit failed mid-session, rerun impractical before deadline'"
                    value={ambientOverrideReason}
                    onChange={(e) => setAmbientOverrideReason(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {ambientOverrideReason.trim().length} / 10 characters
                    {ambientOverrideReason.trim().length < 10
                      ? " — too short"
                      : " — ok"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* D-07: Supersede banner */}
          {dryRun.duplicateCount > 0 && (
            <div className="rounded-md border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-4 space-y-3">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                {dryRun.duplicateCount} rows will mark previous benchmarks as
                superseded.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer select-none">
                  Show details ▾
                </summary>
                <ul className="mt-2 space-y-1 pl-4 list-disc">
                  {dryRun.rows
                    .filter((r) => r.status === "duplicate")
                    .map((r) => (
                      <li key={r.lineIndex}>
                        <span className="font-medium">
                          {r.testName ?? `${r.tool}:${r.field}`}
                        </span>{" "}
                        ({r.mode}) — existing:{" "}
                        {r.existingScore !== null
                          ? r.existingScore.toLocaleString()
                          : "?"}{" "}
                        → new: {r.score.toLocaleString()} {r.unit}
                      </li>
                    ))}
                </ul>
              </details>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={confirmSupersede}
                  onCheckedChange={(v) => setConfirmSupersede(!!v)}
                />
                <span className="text-sm">
                  I confirm superseding {dryRun.duplicateCount} previous runs
                </span>
              </label>
            </div>
          )}

          {/* D-04: Discipline accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Preview by Discipline</CardTitle>
            </CardHeader>
            <CardContent>
              {disciplinesWithRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rows parsed from this file.
                </p>
              ) : (
                <Accordion multiple className="w-full">
                  {disciplinesWithRows.map((disc) => {
                    const rows = rowsByDiscipline(disc)
                    return (
                      <AccordionItem key={disc} value={disc}>
                        <AccordionTrigger className="text-sm font-medium">
                          <span className="flex-1 text-left">
                            {DISCIPLINE_LABELS[disc] ?? disc}
                          </span>
                          <span className="ml-4 mr-2 text-muted-foreground text-xs font-normal">
                            {disciplinePill(disc)}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {rows.map((row) => (
                              <li key={row.lineIndex} className="text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="pt-0.5">
                                    {statusIcon(row.status)}
                                  </span>
                                  <button
                                    type="button"
                                    className="text-left hover:underline flex-1"
                                    onClick={() =>
                                      toggleRowExpanded(row.lineIndex)
                                    }
                                  >
                                    {row.testName ??
                                      `${row.tool}:${row.field}`}{" "}
                                    ({row.mode}) —{" "}
                                    {row.score.toLocaleString()} {row.unit}
                                  </button>
                                </div>
                                {/* D-06: inline error message under red rows */}
                                {row.status === "unknown" &&
                                  row.errorReason && (
                                    <p className="text-red-500 text-xs mt-0.5 pl-6">
                                      {row.errorReason}
                                    </p>
                                  )}
                                {/* Expanded raw JSONL view */}
                                {expandedRows.has(row.lineIndex) && (
                                  <pre className="mt-1 ml-6 text-xs bg-muted rounded p-2 overflow-x-auto">
                                    {JSON.stringify(
                                      {
                                        discipline: row.discipline,
                                        tool: row.tool,
                                        field: row.field,
                                        mode: row.mode,
                                        score: row.score,
                                        unit: row.unit,
                                        testId: row.testId,
                                        testName: row.testName,
                                        status: row.status,
                                        existingRunId: row.existingRunId,
                                        existingScore: row.existingScore,
                                      },
                                      null,
                                      2,
                                    )}
                                  </pre>
                                )}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Gate status / Commit button */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => resetWizard("upload")}
              disabled={loading}
            >
              ← Back
            </Button>
            <Button onClick={handleCommit} disabled={!commitEnabled || loading}>
              {loading
                ? "Committing…"
                : `Commit ${totalCommittable} Run${totalCommittable === 1 ? "" : "s"}`}
            </Button>
            {!commitEnabled && totalCommittable > 0 && (
              <span className="text-xs text-muted-foreground">
                {!ambientGateOk && "Confirm ambient override · "}
                {!supersedeGateOk && "Confirm supersede · "}
                to enable commit
              </span>
            )}
            {totalCommittable === 0 && (
              <span className="text-xs text-muted-foreground">
                No committable rows (all unknown/invalid).
              </span>
            )}
          </div>
        </div>
      )}

      {/* --- STEP 3: Done --- */}
      {step === "done" && commitResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ {commitResult.inserted} run
              {commitResult.inserted === 1 ? "" : "s"} inserted ·{" "}
              {commitResult.superseded} superseded.
            </p>
            {commitResult.bprScore !== null ? (
              <p>
                BPR Score:{" "}
                <strong>{commitResult.bprScore.toFixed(1)}%</strong>{" "}
                {commitResult.bprTier && (
                  <Badge className="ml-1">
                    {commitResult.bprTier.toUpperCase()}
                  </Badge>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground">
                BPR not yet computed — needs at least 5 eligible disciplines
                with both AC and Battery data.
              </p>
            )}
            <p className="text-muted-foreground text-xs font-mono">
              Batch ID: {commitResult.batchId}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" onClick={() => resetWizard("upload")}>
                Import Another File
              </Button>
              <Link
                href={`/admin/tech/reviews/${reviewId}/edit`}
                className={buttonVariants({ variant: "secondary" })}
              >
                ← Back to Review
              </Link>
              {reviewSlug && (
                <a
                  href={`/tech/reviews/${reviewSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants()}
                >
                  View Published →
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
