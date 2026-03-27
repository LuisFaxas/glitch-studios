"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getSubscribers, removeSubscriber } from "@/actions/admin-newsletter"
import { Search, ChevronLeft, ChevronRight, UserMinus } from "lucide-react"

type SubscriberRow = Awaited<ReturnType<typeof getSubscribers>>["subscribers"][number]

interface SubscriberListTableProps {
  initialSubscribers: SubscriberRow[]
  initialTotalPages: number
  initialTotal: number
}

const TAG_LABELS: Record<string, string> = {
  beat_buyer: "buyer",
  studio_client: "client",
}

export function SubscriberListTable({
  initialSubscribers,
  initialTotalPages,
  initialTotal,
}: SubscriberListTableProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [removeTarget, setRemoveTarget] = useState<SubscriberRow | null>(null)
  const [isPending, startTransition] = useTransition()

  function fetchSubscribers(query: string, p: number) {
    startTransition(async () => {
      const result = await getSubscribers({
        search: query || undefined,
        page: p,
      })
      setSubscribers(result.subscribers)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setPage(p)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchSubscribers(search, 1)
  }

  function handleRemove() {
    if (!removeTarget) return
    startTransition(async () => {
      try {
        await removeSubscriber(removeTarget.id)
        toast.success("Subscriber removed")
        setRemoveTarget(null)
        fetchSubscribers(search, page)
      } catch {
        toast.error("Failed to remove subscriber")
      }
    })
  }

  if (subscribers.length === 0 && page === 1 && !search) {
    return (
      <div className="text-center py-16">
        <p className="font-mono text-lg font-bold text-[#f5f5f0] uppercase tracking-wider mb-2">
          No Subscribers Yet
        </p>
        <p className="text-[15px] text-[#555]">
          Subscribers appear here when visitors sign up through your newsletter form.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full bg-[#000] border border-[#333333] text-[#f5f5f0] text-[15px] pl-10 pr-4 py-2 font-sans placeholder:text-[#555] focus:outline-none focus:border-[#f5f5f0]"
          />
        </div>
      </form>

      <Table>
        <TableHeader>
          <TableRow className="border-[#222222]">
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Email
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Subscribed
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Tags
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Status
            </TableHead>
            <TableHead className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((sub) => (
            <TableRow key={sub.id} className="border-[#222222] hover:bg-[#111111]">
              <TableCell
                className={`text-[15px] ${sub.isActive ? "text-[#f5f5f0]" : "text-[#555555]"}`}
              >
                {sub.email}
              </TableCell>
              <TableCell
                className={`text-[15px] ${sub.isActive ? "text-[#888]" : "text-[#555555]"}`}
              >
                {format(new Date(sub.subscribedAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  {(sub.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block font-mono text-[13px] text-[#888888] bg-[#1a1a1a] border border-[#333333] px-2 py-0.5"
                    >
                      {TAG_LABELS[tag] ?? tag}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block font-mono text-[13px] px-2 py-0.5 ${
                    sub.isActive
                      ? "text-[#f5f5f0] bg-[#222222]"
                      : "text-[#555555] bg-[#111111]"
                  }`}
                >
                  {sub.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {sub.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveTarget(sub)}
                    className="text-[#555] hover:text-[#dc2626]"
                  >
                    <UserMinus className="size-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="font-mono text-[13px] text-[#555]">
            {total} total subscribers
          </span>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSubscribers(search, page - 1)}
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
              onClick={() => fetchSubscribers(search, page + 1)}
              disabled={page >= totalPages || isPending}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(val) => !val && setRemoveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Subscriber</DialogTitle>
            <DialogDescription>
              This subscriber will no longer receive newsletters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleRemove}
              disabled={isPending}
              className="bg-[#dc2626] text-white hover:bg-[#b91c1c]"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
