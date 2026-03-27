"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { getBroadcasts } from "@/actions/admin-newsletter"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"

type BroadcastRow = Awaited<ReturnType<typeof getBroadcasts>>["broadcasts"][number]

interface NewsletterListTableProps {
  initialBroadcasts: BroadcastRow[]
  initialTotalPages: number
}

const statusStyles: Record<string, string> = {
  sent: "text-[#f5f5f0] bg-[#222222]",
  partial_failure: "text-[#aaaaaa] bg-[#222222]",
  failed: "text-[#dc2626] bg-[#222222]",
}

const statusLabels: Record<string, string> = {
  sent: "Sent",
  partial_failure: "Partial Failure",
  failed: "Failed",
}

const segmentLabels: Record<string, string> = {
  all: "All",
  beat_buyers: "Beat Buyers",
  studio_clients: "Studio Clients",
}

export function NewsletterListTable({
  initialBroadcasts,
  initialTotalPages,
}: NewsletterListTableProps) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  function goToPage(p: number) {
    startTransition(async () => {
      const result = await getBroadcasts(p)
      setBroadcasts(result.broadcasts)
      setTotalPages(result.totalPages)
      setPage(p)
    })
  }

  if (broadcasts.length === 0 && page === 1) {
    return (
      <div className="text-center py-16">
        <p className="font-mono text-lg font-bold text-[#f5f5f0] uppercase tracking-wider mb-2">
          No Broadcasts Yet
        </p>
        <p className="text-[15px] text-[#555] mb-6">
          Compose your first newsletter to reach your subscribers.
        </p>
        <Link href="/admin/newsletter/compose">
          <Button className="bg-[#f5f5f0] text-[#000] hover:bg-[#e5e5e0] gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em]">
            <Send className="size-4" />
            Compose
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-[#222222]">
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Subject
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Segment
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Sent
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555] text-right">
              Recipients
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {broadcasts.map((broadcast) => (
            <TableRow key={broadcast.id} className="border-[#222222] hover:bg-[#111111]">
              <TableCell className="text-[15px] text-[#f5f5f0] max-w-[300px] truncate">
                {broadcast.subject}
              </TableCell>
              <TableCell className="text-[15px] text-[#888]">
                {segmentLabels[broadcast.segment] ?? broadcast.segment}
              </TableCell>
              <TableCell className="text-[15px] text-[#888]">
                {broadcast.sentAt
                  ? format(new Date(broadcast.sentAt), "MMM d, yyyy")
                  : "-"}
              </TableCell>
              <TableCell className="text-[15px] text-[#f5f5f0] text-right font-mono">
                {broadcast.recipientCount}
              </TableCell>
              <TableCell>
                {broadcast.status === "partial_failure" && broadcast.errorMessage ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span
                          className={`inline-block font-mono text-[13px] px-2 py-0.5 ${statusStyles[broadcast.status] ?? ""}`}
                        >
                          {statusLabels[broadcast.status] ?? broadcast.status}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{broadcast.errorMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span
                    className={`inline-block font-mono text-[13px] px-2 py-0.5 ${statusStyles[broadcast.status ?? "sent"] ?? ""}`}
                  >
                    {statusLabels[broadcast.status ?? "sent"] ?? broadcast.status}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isPending}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-mono text-[13px] text-[#888]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || isPending}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
