"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  ClientRecord,
  ClientDetail,
  ClientDetailOrder,
  ClientDetailBooking,
} from "@/actions/admin-clients"
import { getClientDetail } from "@/actions/admin-clients"

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { text: string; bg: string }> = {
    completed: { text: "#f5f5f0", bg: "#222222" },
    confirmed: { text: "#f5f5f0", bg: "#222222" },
    pending: { text: "#888888", bg: "#222222" },
    cancelled: { text: "#dc2626", bg: "#222222" },
    refunded: { text: "#f59e0b", bg: "#222222" },
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

interface ClientDetailSheetProps {
  client: ClientRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailSheet({
  client,
  open,
  onOpenChange,
}: ClientDetailSheetProps) {
  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client && open) {
      setLoading(true)
      getClientDetail(client.id)
        .then((d) => setDetail(d))
        .catch(() => setDetail(null))
        .finally(() => setLoading(false))
    } else {
      setDetail(null)
    }
  }, [client, open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-[#222] bg-[#000] sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-lg uppercase text-[#f5f5f0]">
            {client?.name || "Client"}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-[#888]">
            <span>{client?.email}</span>
            {client && <TypeBadge type={client.type} />}
          </SheetDescription>
          {client && (
            <div className="mt-1 font-mono text-[10px] text-[#555]">
              First seen: {new Date(client.createdAt).toLocaleDateString()}
            </div>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-mono text-xs text-[#444]">Loading...</span>
          </div>
        ) : detail ? (
          <div className="mt-4 flex flex-col gap-6 px-4 pb-8">
            {/* Purchase History */}
            <section>
              <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-wider text-[#f5f5f0]">
                Purchase History
              </h3>
              {detail.purchases.length === 0 ? (
                <p className="font-mono text-xs text-[#444]">
                  No purchases yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#222] hover:bg-transparent">
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Date
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Items
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Total
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.purchases.map((p) => (
                        <TableRow
                          key={p.id}
                          className="border-[#222] hover:bg-[#111]"
                        >
                          <TableCell className="font-mono text-xs text-[#ccc]">
                            {p.date}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate font-mono text-xs text-[#ccc]">
                            {p.items}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[#f5f5f0]">
                            {p.total}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Booking History */}
            <section>
              <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-wider text-[#f5f5f0]">
                Booking History
              </h3>
              {detail.bookings.length === 0 ? (
                <p className="font-mono text-xs text-[#444]">
                  No bookings yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#222] hover:bg-transparent">
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Service
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Date
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Time
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Room
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-[#666]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.bookings.map((b) => (
                        <TableRow
                          key={b.id}
                          className="border-[#222] hover:bg-[#111]"
                        >
                          <TableCell className="font-mono text-xs text-[#ccc]">
                            {b.serviceName}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[#ccc]">
                            {b.date}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[#ccc]">
                            {b.startTime}-{b.endTime}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[#ccc]">
                            {b.roomName}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        ) : (
          !loading && (
            <div className="flex items-center justify-center py-12">
              <span className="font-mono text-xs text-[#444]">
                Select a client to view details
              </span>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  )
}
