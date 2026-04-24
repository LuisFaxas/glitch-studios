"use client"

import { useCallback } from "react"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { useCart } from "@/components/cart/cart-provider"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
)

export default function CheckoutPage() {
  const { items } = useCart()

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
    if (!response.ok) {
      let msg = `Checkout failed (${response.status})`
      try {
        const body = await response.json()
        if (body?.error) msg = body.error
      } catch {
        /* body not JSON — keep generic message */
      }
      throw new Error(msg)
    }
    const { clientSecret } = await response.json()
    if (!clientSecret) throw new Error("No clientSecret in response")
    return clientSecret as string
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Checkout
        </h1>
        <p className="mb-6 font-sans text-[15px] text-[#888]">
          Your cart is empty. Add some beats first.
        </p>
        <Link
          href="/beats"
          className="border border-[#f5f5f0] bg-[#111] px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
        >
          Browse beats
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
        Checkout
      </h1>
      <div
        id="checkout"
        className="border border-[#222] bg-[#111] p-4 rounded-none"
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
