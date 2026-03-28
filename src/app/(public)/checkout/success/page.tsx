"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useCart } from "@/components/cart/cart-provider"
import { getOrderBySessionId, getOrderDownloadUrls } from "@/actions/orders"
import Link from "next/link"

type OrderData = Awaited<ReturnType<typeof getOrderBySessionId>>
type DownloadUrls = Record<string, string>

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin border-2 border-[#333] border-t-[#f5f5f0]" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { clearCart } = useCart()

  const [status, setStatus] = useState<"loading" | "confirmed" | "error">(
    "loading"
  )
  const [order, setOrder] = useState<OrderData>(null)
  const [downloadUrls, setDownloadUrls] = useState<
    Record<string, DownloadUrls>
  >({})
  const [cartCleared, setCartCleared] = useState(false)

  // Poll session status until payment is confirmed, then fetch order
  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      return
    }

    let cancelled = false
    let pollCount = 0
    const maxPolls = 30 // 30 attempts * 2s = 60s max

    async function pollStatus() {
      try {
        const res = await fetch(
          `/api/checkout/session-status?session_id=${sessionId}`
        )
        const data = await res.json()

        if (cancelled) return

        if (data.status === "complete" && data.paymentStatus === "paid") {
          // Payment confirmed -- fetch order details
          const orderData = await getOrderBySessionId(sessionId!)
          if (orderData) {
            setOrder(orderData)
            setStatus("confirmed")

            // Generate download URLs for each item
            const urls: Record<string, DownloadUrls> = {}
            for (const item of orderData.items) {
              const itemUrls = await getOrderDownloadUrls(
                orderData.id,
                item.id
              )
              if (itemUrls) urls[item.id] = itemUrls
            }
            setDownloadUrls(urls)
          } else {
            // Order not yet created by webhook -- retry
            pollCount++
            if (pollCount < maxPolls) {
              setTimeout(pollStatus, 2000)
            } else {
              setStatus("error")
            }
          }
        } else if (data.status === "expired") {
          setStatus("error")
        } else {
          // Still processing -- poll again
          pollCount++
          if (pollCount < maxPolls) {
            setTimeout(pollStatus, 2000)
          } else {
            setStatus("error")
          }
        }
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    pollStatus()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // Clear cart once on confirmation (separate effect to avoid re-clearing)
  useEffect(() => {
    if (status === "confirmed" && !cartCleared) {
      clearCart()
      setCartCleared(true)
    }
  }, [status, cartCleared, clearCart])

  // --- Loading state ---
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Processing Payment
        </h1>
        <p className="font-sans text-[15px] text-[#888]">
          Confirming your purchase...
        </p>
        <div className="mt-6 h-8 w-8 animate-spin border-2 border-[#333] border-t-[#f5f5f0]" />
      </div>
    )
  }

  // --- Error state ---
  if (status === "error" || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Payment Issue
        </h1>
        <p className="max-w-md font-sans text-[15px] text-[#888]">
          Payment didn&apos;t go through. Please try again or use a different
          payment method.
        </p>
        <Link
          href="/beats"
          className="mt-6 border border-[#222] bg-[#111] px-6 py-3 font-mono text-[13px] uppercase tracking-[0.05em] transition-colors hover:bg-[#1a1a1a]"
        >
          Back to Beats
        </Link>
      </div>
    )
  }

  // --- Confirmed state ---
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
        Order Confirmed
      </h1>
      <p className="mb-8 font-mono text-[13px] text-[#888]">
        Order #{order.id.slice(0, 8)}
      </p>

      <div className="space-y-4">
        {order.items.map((item) => {
          const urls = downloadUrls[item.id] ?? {}
          return (
            <div
              key={item.id}
              className="border border-[#222] bg-[#111] p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="font-mono text-[15px] font-bold uppercase">
                    {item.beatTitle}
                  </h2>
                  <p className="mt-1 font-sans text-[11px] text-[#888]">
                    {item.licenseTier} — ${Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {urls.mp3 && (
                  <a
                    href={urls.mp3}
                    download
                    className="border border-[#222] bg-[#111] px-4 py-2 font-mono text-[11px] uppercase transition-colors hover:bg-[#1a1a1a]"
                  >
                    MP3
                  </a>
                )}
                {urls.wav && (
                  <a
                    href={urls.wav}
                    download
                    className="border border-[#222] bg-[#111] px-4 py-2 font-mono text-[11px] uppercase transition-colors hover:bg-[#1a1a1a]"
                  >
                    WAV
                  </a>
                )}
                {urls.stems && (
                  <a
                    href={urls.stems}
                    download
                    className="border border-[#222] bg-[#111] px-4 py-2 font-mono text-[11px] uppercase transition-colors hover:bg-[#1a1a1a]"
                  >
                    Stems
                  </a>
                )}
                {urls.license && (
                  <a
                    href={urls.license}
                    download
                    className="border border-[#222] bg-[#111] px-4 py-2 font-mono text-[11px] uppercase transition-colors hover:bg-[#1a1a1a]"
                  >
                    License PDF
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 font-sans text-[11px] text-[#888]">
        <p>
          Download links expire in 24 hours. Access your purchases anytime from
          your account dashboard.
        </p>
      </div>

      {/* Guest account CTA (per D-16) */}
      {order.guestEmail && !order.userId && (
        <div className="mt-8 border border-[#222] bg-[#111] p-4">
          <p className="mb-3 font-sans text-[15px]">
            Create an account to access your downloads anytime and track future
            purchases.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#f5f5f0] px-6 py-3 font-mono text-[13px] uppercase tracking-[0.05em] text-[#000] transition-colors hover:bg-[#e0e0d8]"
          >
            Create Account
          </Link>
        </div>
      )}

      <p className="mt-4 font-sans text-[11px] text-[#555]">
        Download failed? Your files are safe — try again from your purchase
        history.
      </p>
    </div>
  )
}
