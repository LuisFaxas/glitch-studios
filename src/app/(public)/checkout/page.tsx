"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type {
  StripeCheckoutOptions,
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementReadyEvent,
} from "@stripe/stripe-js"
import {
  CheckoutProvider,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout"
import {
  ArrowRight,
  CreditCard,
  LockKeyhole,
  Music2,
  ShieldCheck,
} from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { getStripe } from "@/lib/stripe-client"

const stripePromise = getStripe()
const checkoutClientSecretCache = new Map<string, Promise<string>>()

const checkoutAppearance: NonNullable<
  StripeCheckoutOptions["elementsOptions"]
>["appearance"] = {
  theme: "night",
  variables: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSizeBase: "15px",
    fontSizeSm: "13px",
    fontWeightMedium: "700",
    spacingUnit: "5px",
    gridRowSpacing: "14px",
    gridColumnSpacing: "12px",
    borderRadius: "2px",
    colorPrimary: "#f5f5f0",
    colorBackground: "#090909",
    colorText: "#f5f5f0",
    colorTextSecondary: "#9a9a9a",
    colorTextPlaceholder: "#5f5f5f",
    colorDanger: "#ff4f64",
    colorSuccess: "#67e8a5",
    iconColor: "#f5f5f0",
    iconCardCvcColor: "#9a9a9a",
  },
  rules: {
    ".Input": {
      backgroundColor: "#050505",
      border: "1px solid #303030",
      boxShadow: "none",
      color: "#f5f5f0",
      padding: "13px 14px",
    },
    ".Input:focus": {
      border: "1px solid #f5f5f0",
      boxShadow: "0 0 0 1px #f5f5f0",
    },
    ".Input--invalid": {
      border: "1px solid #ff4f64",
      boxShadow: "none",
    },
    ".Label": {
      color: "#b8b8b2",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
    },
    ".Tab": {
      backgroundColor: "#050505",
      border: "1px solid #303030",
      color: "#f5f5f0",
      boxShadow: "none",
    },
    ".Tab--selected": {
      borderColor: "#f5f5f0",
      boxShadow: "0 0 0 1px #f5f5f0",
    },
  },
}

const expressCheckoutOptions = {
  buttonHeight: 48,
  buttonTheme: {
    applePay: "white-outline" as const,
    googlePay: "white" as const,
    paypal: "black" as const,
  },
  buttonType: {
    applePay: "buy" as const,
    googlePay: "buy" as const,
    paypal: "pay" as const,
  },
  layout: {
    maxColumns: 2,
    maxRows: 2,
    overflow: "auto" as const,
  },
  paymentMethodOrder: undefined,
  paymentMethods: {
    amazonPay: "auto" as const,
    applePay: "auto" as const,
    googlePay: "auto" as const,
    klarna: "auto" as const,
    link: "auto" as const,
    paypal: "auto" as const,
  },
}

function getIsMobileCheckout() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(max-width: 767px)").matches
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function getCheckoutClientSecret(
  cartFingerprint: string,
  items: ReturnType<typeof useCart>["items"]
) {
  const cached = checkoutClientSecretCache.get(cartFingerprint)
  if (cached) return cached

  const clientSecret = fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  })
    .then(async (response) => {
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
    })
    .catch((error) => {
      checkoutClientSecretCache.delete(cartFingerprint)
      throw error
    })

  checkoutClientSecretCache.set(cartFingerprint, clientSecret)
  return clientSecret
}

function CheckoutForm({ total }: { total: number }) {
  const checkoutState = useCheckout()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [hasExpressCheckout, setHasExpressCheckout] = useState<boolean | null>(
    null
  )
  const [isMobileCheckout, setIsMobileCheckout] = useState(getIsMobileCheckout)

  const canSubmit = checkoutState.type === "success" && !isPaying
  const paymentElementOptions = useMemo(
    () => ({
      layout: isMobileCheckout
        ? {
            type: "auto" as const,
            paymentMethodLogoPosition: "end" as const,
          }
        : {
            type: "accordion" as const,
            defaultCollapsed: false,
            radios: "if_multiple" as const,
            spacedAccordionItems: false,
            visibleAccordionItemsCount: 5,
            paymentMethodLogoPosition: "end" as const,
          },
      ...(isMobileCheckout
        ? {
            paymentMethodOrder: ["card"],
            wallets: {
              applePay: "never" as const,
              googlePay: "never" as const,
              link: "never" as const,
            },
            terms: {
              card: "never" as const,
            },
          }
        : {}),
    }),
    [isMobileCheckout]
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const updateIsMobile = () => setIsMobileCheckout(mediaQuery.matches)

    updateIsMobile()
    mediaQuery.addEventListener("change", updateIsMobile)
    return () => mediaQuery.removeEventListener("change", updateIsMobile)
  }, [])

  function handleExpressReady(event: StripeExpressCheckoutElementReadyEvent) {
    setHasExpressCheckout(
      Boolean(
        event.availablePaymentMethods &&
        Object.values(event.availablePaymentMethods).some(Boolean)
      )
    )
  }

  async function confirmPayment(options?: {
    expressCheckoutConfirmEvent?: StripeExpressCheckoutElementConfirmEvent
  }) {
    setMessage("")

    if (checkoutState.type === "loading") return
    if (checkoutState.type === "error") {
      setMessage(checkoutState.error.message)
      return
    }

    setIsPaying(true)
    const confirmEmail =
      email || options?.expressCheckoutConfirmEvent?.billingDetails?.email
    const result = await checkoutState.checkout.confirm({
      ...options,
      ...(confirmEmail ? { email: confirmEmail } : {}),
    })

    if (result.type === "error") {
      setMessage(result.error.message)
      options?.expressCheckoutConfirmEvent?.paymentFailed({
        reason: "fail",
        message: result.error.message,
      })
      setIsPaying(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await confirmPayment()
  }

  async function handleExpressConfirm(
    event: StripeExpressCheckoutElementConfirmEvent
  ) {
    await confirmPayment({ expressCheckoutConfirmEvent: event })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[640px] space-y-5"
      aria-label="Beat checkout"
    >
      <div className="space-y-2">
        <label
          htmlFor="checkout-email"
          className="font-mono text-[12px] font-bold text-[#b8b8b2] uppercase"
        >
          Email
        </label>
        <input
          id="checkout-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="h-12 w-full border border-[#303030] bg-[#050505] px-3 font-sans text-[15px] text-[#f5f5f0] transition-colors outline-none placeholder:text-[#5f5f5f] focus:border-[#f5f5f0]"
          placeholder="you@example.com"
        />
      </div>

      <div
        className={
          hasExpressCheckout === false
            ? "hidden"
            : "space-y-3 border-b border-[#202020] pb-5"
        }
      >
        <ExpressCheckoutElement
          options={expressCheckoutOptions}
          onReady={handleExpressReady}
          onConfirm={handleExpressConfirm}
          onLoadError={() => setHasExpressCheckout(false)}
        />
        <p className="font-mono text-[11px] font-bold text-[#777] uppercase">
          Or use payment details
        </p>
      </div>

      <div className="rounded-[2px] border border-[#303030] bg-[#090909] p-3 max-[767px]:-mx-4 sm:p-4">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {message && (
        <p
          role="alert"
          className="font-sans text-[13px] leading-5 text-[#ff6b7a]"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-[52px] w-full items-center justify-center gap-2 border border-[#f5f5f0] bg-[#f5f5f0] px-4 font-mono text-[13px] font-bold whitespace-nowrap text-black uppercase transition-colors hover:bg-transparent hover:text-[#f5f5f0] disabled:cursor-not-allowed disabled:border-[#333] disabled:bg-[#1a1a1a] disabled:text-[#666] max-[767px]:w-[calc(100%-150px)]"
      >
        <LockKeyhole className="hidden h-4 w-4 sm:block" aria-hidden="true" />
        {isPaying ? "Processing" : `Pay ${formatCurrency(total)}`}
        <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, total, isMounted } = useCart()

  const cartFingerprint = useMemo(
    () =>
      items
        .map((item) => `${item.beatId}:${item.licenseTier}:${item.price}`)
        .join("|"),
    [items]
  )

  const checkoutOptions = useMemo<StripeCheckoutOptions | null>(() => {
    if (!isMounted || items.length === 0) return null

    return {
      clientSecret: getCheckoutClientSecret(cartFingerprint, items),
      elementsOptions: {
        appearance: checkoutAppearance,
        loader: "auto",
      },
    }
  }, [cartFingerprint, isMounted, items])

  if (!isMounted) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-h-[420px] border border-[#222] bg-[#080808]" />
          <div className="min-h-[320px] border border-[#222] bg-[#0d0d0d]" />
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-mono text-[28px] font-bold text-[#f5f5f0] uppercase">
          Checkout
        </h1>
        <p className="mb-6 max-w-sm font-sans text-[15px] leading-6 text-[#888]">
          Your cart is empty. Add some beats first.
        </p>
        <Link
          href="/beats"
          className="inline-flex h-12 items-center justify-center gap-2 border border-[#f5f5f0] bg-[#111] px-6 font-mono text-[13px] font-bold text-[#f5f5f0] uppercase transition-colors hover:bg-[#f5f5f0] hover:text-black"
        >
          <Music2 className="h-4 w-4" aria-hidden="true" />
          Browse Beats
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6">
        <p className="font-mono text-[12px] font-bold text-[#888] uppercase">
          Glitch Studios
        </p>
        <h1 className="font-mono text-[28px] font-bold text-[#f5f5f0] uppercase sm:text-[34px]">
          Checkout
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section
          id="checkout"
          className="border border-[#242424] bg-[#080808] p-4 sm:p-5 lg:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
            <div>
              <p className="font-mono text-[12px] font-bold text-[#888] uppercase">
                Payment
              </p>
              <p className="mt-1 font-sans text-[14px] text-[#f5f5f0]">
                {items.length} {items.length === 1 ? "license" : "licenses"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-[#303030] bg-[#050505]">
              <CreditCard
                className="h-5 w-5 text-[#f5f5f0]"
                aria-hidden="true"
              />
            </div>
          </div>

          <CheckoutProvider
            key={cartFingerprint}
            stripe={stripePromise}
            options={checkoutOptions!}
          >
            <CheckoutForm total={total} />
          </CheckoutProvider>
        </section>

        <aside className="space-y-4 max-[767px]:mt-20 lg:sticky lg:top-6">
          <div className="relative aspect-[1.58/1] overflow-hidden border border-[#343434] bg-[#0b0b0b] p-5">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,245,240,0.16),transparent_32%),repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_9px)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold text-[#a6a6a0] uppercase">
                    Glitch Pass
                  </p>
                  <p className="mt-1 font-mono text-[18px] font-bold text-[#f5f5f0] uppercase">
                    Beat License
                  </p>
                </div>
                <div className="grid h-9 w-11 grid-cols-2 gap-[3px] border border-[#666] bg-[#161616] p-[5px]">
                  <span className="bg-[#f5f5f0]" />
                  <span className="bg-[#555]" />
                  <span className="bg-[#555]" />
                  <span className="bg-[#f5f5f0]" />
                </div>
              </div>

              <div
                className="mx-auto grid w-24 grid-cols-3 gap-2"
                aria-hidden="true"
              >
                <span className="h-7 border border-[#f5f5f0] bg-black" />
                <span className="h-7 border border-[#f5f5f0] bg-[#f5f5f0]" />
                <span className="h-7 border border-[#f5f5f0] bg-black" />
                <span className="col-span-3 h-[3px] bg-[#f5f5f0]" />
              </div>

              <div className="flex items-end justify-between gap-4">
                <p className="font-mono text-[15px] font-bold text-[#f5f5f0]">
                  4242 **** **** 4242
                </p>
                <p className="font-mono text-[12px] font-bold text-[#a6a6a0] uppercase">
                  Test
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[#242424] bg-[#0d0d0d]">
            <div className="border-b border-[#242424] p-4">
              <p className="font-mono text-[12px] font-bold text-[#888] uppercase">
                Order
              </p>
            </div>
            <div className="divide-y divide-[#202020]">
              {items.map((item) => (
                <div
                  key={`${item.beatId}-${item.licenseTier}`}
                  className="grid grid-cols-[1fr_auto] gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[14px] font-semibold text-[#f5f5f0]">
                      {item.beatTitle}
                    </p>
                    <p className="mt-1 font-mono text-[11px] font-bold text-[#777] uppercase">
                      {item.licenseTierDisplay}
                    </p>
                  </div>
                  <p className="font-mono text-[13px] font-bold text-[#f5f5f0]">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-[#242424] p-4">
              <p className="font-mono text-[12px] font-bold text-[#888] uppercase">
                Total
              </p>
              <p className="font-mono text-[22px] font-bold text-[#f5f5f0]">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex min-h-16 items-center gap-2 border border-[#242424] bg-[#080808] p-3">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-[#f5f5f0]"
                aria-hidden="true"
              />
              <p className="font-mono text-[11px] leading-4 font-bold text-[#b8b8b2] uppercase">
                License Ready
              </p>
            </div>
            <div className="flex min-h-16 items-center gap-2 border border-[#242424] bg-[#080808] p-3">
              <LockKeyhole
                className="h-4 w-4 shrink-0 text-[#f5f5f0]"
                aria-hidden="true"
              />
              <p className="font-mono text-[11px] leading-4 font-bold text-[#b8b8b2] uppercase">
                Secure Pay
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
