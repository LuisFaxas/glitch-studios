"use client"
import { useMemo, useState } from "react"
import type { InferSelectModel } from "drizzle-orm"
import { artistApplications } from "@/db/schema"
import { ApplicationDetailSheet } from "./application-detail-sheet"
import { Badge } from "@/components/ui/badge"

type Application = InferSelectModel<typeof artistApplications>

interface ApplicationListTableProps {
  applications: Application[]
}

const STATUS_FILTERS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "info_requested",
] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]

export function ApplicationListTable({ applications }: ApplicationListTableProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [active, setActive] = useState<Application | null>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return applications
    return applications.filter((a) => a.status === filter)
  }, [applications, filter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-[12px] font-mono uppercase tracking-[0.08em] border ${
              filter === f
                ? "bg-[var(--foreground)] text-black border-[var(--foreground)]"
                : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)]"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full text-[16px] font-sans">
          <thead className="bg-[#111111] text-[12px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
            <tr>
              <th className="text-left p-3">Brand</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Tags</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                onClick={() => setActive(row)}
                className="cursor-pointer hover:bg-[#111111] border-t border-[var(--border)]"
              >
                <td className="p-3">
                  <Badge>
                    {row.brand === "tech" ? "GlitchTech" : "Studios"}
                  </Badge>
                </td>
                <td className="p-3">{row.name}</td>
                <td className="p-3 text-[var(--muted-foreground)]">{row.email}</td>
                <td className="p-3 text-[var(--muted-foreground)]">
                  {new Date(row.submittedAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-[var(--muted-foreground)] truncate max-w-[200px]">
                  {(row.focusTags as string[]).join(", ")}
                </td>
                <td className="p-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-[var(--muted-foreground)]"
                >
                  No applications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <ApplicationDetailSheet
          application={active}
          open={!!active}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variant: "default" | "outline" | "destructive" | "secondary" =
    status === "approved"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : "outline"
  return <Badge variant={variant}>{status}</Badge>
}
