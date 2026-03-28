"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { getOrderDownloadUrls } from "@/actions/orders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrderWithItems } from "@/types/beats"
import { LICENSE_TIER_DISPLAY, type LicenseTier } from "@/types/beats"

interface PurchaseHistoryProps {
  orders: OrderWithItems[]
}

interface DownloadState {
  loading: boolean
  urls: Record<string, string> | null
}

export function PurchaseHistory({ orders }: PurchaseHistoryProps) {
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({})

  if (orders.length === 0) {
    return (
      <div className="border border-[#222] bg-[#111] px-6 py-12 text-center">
        <p className="font-mono text-[14px] text-[#888] mb-4">
          No purchases yet. Browse the beat store to find your next favorite.
        </p>
        <Link
          href="/beats"
          className="inline-block bg-[#111] border border-[#222] px-4 py-2 font-mono text-[11px] uppercase text-[#f5f5f0] hover:bg-[#1a1a1a] hover:border-[#444] transition-colors"
        >
          Browse Beats
        </Link>
      </div>
    )
  }

  async function handleDownload(orderId: string, itemId: string) {
    const key = `${orderId}-${itemId}`
    setDownloads((prev) => ({
      ...prev,
      [key]: { loading: true, urls: null },
    }))

    try {
      const urls = await getOrderDownloadUrls(orderId, itemId)
      if (!urls) {
        toast.error(
          "Download failed. Your files are safe -- try again from your purchase history."
        )
        setDownloads((prev) => ({
          ...prev,
          [key]: { loading: false, urls: null },
        }))
        return
      }
      setDownloads((prev) => ({
        ...prev,
        [key]: { loading: false, urls },
      }))
    } catch {
      toast.error(
        "Download failed. Your files are safe -- try again from your purchase history."
      )
      setDownloads((prev) => ({
        ...prev,
        [key]: { loading: false, urls: null },
      }))
    }
  }

  const fileLabels: Record<string, string> = {
    mp3: "MP3",
    wav: "WAV",
    stems: "Stems",
    license: "License PDF",
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-[#222] bg-[#111] mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#0a0a0a]">
            <span className="font-mono text-[12px] text-[#888] uppercase">
              {format(new Date(order.createdAt), "MMM d, yyyy")}
            </span>
            <span className="font-mono text-[14px] text-[#f5f5f0]">
              ${(Number(order.totalCents) / 100).toFixed(2)}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222] hover:bg-transparent">
                <TableHead className="font-mono text-[11px] uppercase text-[#666]">
                  Beat
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-[#666]">
                  License
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-[#666]">
                  Price
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-[#666]">
                  Downloads
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const key = `${order.id}-${item.id}`
                const dl = downloads[key]
                return (
                  <TableRow
                    key={item.id}
                    className="border-b border-[#222] hover:bg-[#0a0a0a]"
                  >
                    <TableCell className="font-mono text-[13px] text-[#f5f5f0]">
                      {item.beat.title}
                    </TableCell>
                    <TableCell className="font-mono text-[12px] text-[#888]">
                      {LICENSE_TIER_DISPLAY[item.licenseTier as LicenseTier] ??
                        item.licenseTier}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-[#f5f5f0]">
                      ${Number(item.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {dl?.urls ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(dl.urls).map(([type, url]) => (
                            <a
                              key={type}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#111] border border-[#222] px-3 py-1.5 font-mono text-[11px] uppercase text-[#f5f5f0] hover:bg-[#1a1a1a] hover:border-[#444] transition-colors"
                            >
                              {fileLabels[type] ?? type}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownload(order.id, item.id)}
                          disabled={dl?.loading}
                          className="bg-[#111] border border-[#222] px-3 py-1.5 font-mono text-[11px] uppercase text-[#f5f5f0] hover:bg-[#1a1a1a] hover:border-[#444] transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                          {dl?.loading ? "Loading..." : "Download"}
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
