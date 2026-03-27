"use client"

import { useState, useCallback } from "react"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ClientRecord } from "@/actions/admin-clients"
import { getClients } from "@/actions/admin-clients"
import { ClientDetailSheet } from "./client-detail-sheet"

const TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Guest", value: "guest" },
] as const

function TypeBadge({ type }: { type: "registered" | "guest" }) {
  const isRegistered = type === "registered"
  return (
    <span
      className="inline-block rounded-none px-2 py-0.5 font-mono text-xs uppercase tracking-wider"
      style={{
        color: isRegistered ? "#f5f5f0" : "#888888",
        backgroundColor: "#222222",
      }}
    >
      {type}
    </span>
  )
}

interface ClientListTableProps {
  initialClients: ClientRecord[]
  initialTotalPages: number
}

export function ClientListTable({
  initialClients,
  initialTotalPages,
}: ClientListTableProps) {
  const [clients, setClients] = useState(initialClients)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<"all" | "registered" | "guest">(
    "all"
  )
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // Sheet state
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(
    null
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchClients = useCallback(
    async (opts: {
      search?: string
      type?: "all" | "registered" | "guest"
      page?: number
    }) => {
      setLoading(true)
      try {
        const result = await getClients({
          search: opts.search || undefined,
          type: opts.type || "all",
          page: opts.page || 1,
        })
        setClients(result.clients)
        setTotalPages(result.totalPages)
      } catch {
        // Keep existing data on error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  function handleTypeChange(type: "all" | "registered" | "guest") {
    setTypeFilter(type)
    setPage(1)
    fetchClients({ search, type, page: 1 })
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
    // Debounce: only fetch after typing stops
    const timeout = setTimeout(() => {
      fetchClients({ search: value, type: typeFilter, page: 1 })
    }, 300)
    return () => clearTimeout(timeout)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchClients({ search, type: typeFilter, page: newPage })
  }

  function handleRowClick(client: ClientRecord) {
    setSelectedClient(client)
    setSheetOpen(true)
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value as any)}
            className={`rounded-none border px-3 py-1 font-mono text-xs uppercase transition-colors ${
              typeFilter === tab.value
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search name or email..."
            className="w-48 bg-transparent font-mono text-xs text-[#f5f5f0] placeholder:text-[#444] outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Name
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Email
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Type
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Purchases
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Spend
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Bookings
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                First Seen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center"
                >
                  <div className="font-mono text-sm text-[#666]">
                    No Clients Yet
                  </div>
                  <div className="mt-1 font-mono text-xs text-[#444]">
                    Clients appear here after they register, make a purchase, or
                    book a session.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer border-[#222] hover:bg-[#111]"
                  onClick={() => handleRowClick(c)}
                >
                  <TableCell className="font-mono text-sm text-[#f5f5f0]">
                    {c.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {c.email}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={c.type} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {c.purchaseCount}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#f5f5f0]">
                    ${c.totalSpend.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {c.bookingCount}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#666]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="mt-2 text-center font-mono text-xs text-[#444]">
          Loading...
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-[#666]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-none border border-[#333] px-3 py-1 font-mono text-xs text-[#888] disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, page + 1))
              }
              disabled={page >= totalPages}
              className="rounded-none border border-[#333] px-3 py-1 font-mono text-xs text-[#888] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <ClientDetailSheet
        client={selectedClient}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
