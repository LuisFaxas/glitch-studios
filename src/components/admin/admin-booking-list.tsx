"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import type { AdminBookingRow } from "@/app/admin/bookings/actions"

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
] as const

const PAGE_SIZE = 20

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { text: string; bg: string }> = {
    confirmed: { text: "#f5f5f0", bg: "#222222" },
    pending: { text: "#888888", bg: "#222222" },
    cancelled: { text: "#dc2626", bg: "#222222" },
    completed: { text: "#22c55e", bg: "#222222" },
    no_show: { text: "#f59e0b", bg: "#222222" },
  }
  const colors = colorMap[status] || colorMap.pending
  return (
    <span
      className="inline-block rounded-none px-2 py-0.5 font-mono text-xs uppercase tracking-wider"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {status.replace("_", " ")}
    </span>
  )
}

interface AdminBookingListProps {
  initialBookings: AdminBookingRow[]
}

export function AdminBookingList({ initialBookings }: AdminBookingListProps) {
  const [bookingsList, setBookingsList] = useState(initialBookings)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = bookingsList

    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(term) ||
          b.guestEmail.toLowerCase().includes(term)
      )
    }

    return list
  }, [bookingsList, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function handleConfirm(bookingId: string) {
    setActionLoading(bookingId)
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to confirm")
        return
      }
      toast.success("Booking confirmed")
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b))
      )
    } catch {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel(bookingId: string) {
    const reason = prompt("Cancel reason (optional):")
    setActionLoading(bookingId)
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: reason || undefined, isAdmin: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel")
        return
      }
      toast.success("Booking cancelled")
      setBookingsList((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "cancelled", cancellationReason: reason || null }
            : b
        )
      )
    } catch {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(0)
            }}
            className={`rounded-none border px-3 py-1 font-mono text-xs uppercase transition-colors ${
              statusFilter === tab.value
                ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000]"
                : "border-[#333] text-[#888] hover:bg-[#222]"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 border border-[#333] px-2 py-1">
          <Search className="h-3 w-3 text-[#666]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Search client..."
            className="w-40 bg-transparent font-mono text-xs text-[#f5f5f0] placeholder:text-[#444] outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Client
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Service
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Room
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Date/Time
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Status
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center font-mono text-sm text-[#444]"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((b) => (
                <TableRow
                  key={b.id}
                  className="border-[#222] hover:bg-[#111]"
                >
                  <TableCell>
                    <div className="font-mono text-sm text-[#f5f5f0]">
                      {b.guestName}
                    </div>
                    <div className="font-mono text-[10px] text-[#666]">
                      {b.guestEmail}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {b.serviceName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {b.roomName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    <div>{b.date}</div>
                    <div className="text-[#666]">
                      {b.startTime}-{b.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {b.status === "pending" && (
                        <button
                          onClick={() => handleConfirm(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-none border border-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase text-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#000] disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-none border border-[#dc2626] px-2 py-0.5 font-mono text-[10px] uppercase text-[#dc2626] hover:bg-[#dc2626] hover:text-[#000] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-[#666]">
            Page {page + 1} of {totalPages} ({filtered.length} bookings)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-none border border-[#333] px-3 py-1 font-mono text-xs text-[#888] disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-none border border-[#333] px-3 py-1 font-mono text-xs text-[#888] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
