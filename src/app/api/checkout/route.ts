import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { calculateBundleDiscount } from "@/actions/bundles"

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      )
    }

    const { items } = (body ?? {}) as { items?: unknown }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Env validation — surface specific missing vars so Vercel logs name the culprit.
    const missing: string[] = []
    if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY")
    if (!process.env.NEXT_PUBLIC_SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL")
    if (missing.length) {
      console.error("[checkout] missing env vars:", missing)
      return NextResponse.json(
        {
          error: `Server misconfigured (${missing.join(", ")})`,
          code: "ENV_MISSING",
        },
        { status: 500 },
      )
    }

    // Check for bundle discount (BEAT-10)
    const beatIds = (items as { beatId?: string }[]).map((i) => i.beatId)
    const bundleDiscount = await calculateBundleDiscount(
      beatIds.filter((x): x is string => typeof x === "string"),
    )

    const line_items = (items as Array<Record<string, unknown>>).map(
      (item) => ({
        price_data: {
          currency: "usd" as const,
          product_data: {
            name: `${item.beatTitle} - ${item.licenseTierDisplay}`,
            metadata: {
              beatId: String(item.beatId ?? ""),
              licenseTier: String(item.licenseTier ?? ""),
            },
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: 1,
      }),
    )

    const discounts =
      bundleDiscount && bundleDiscount.discountPercent > 0
        ? [
            {
              coupon: await getOrCreateBundleCoupon(
                bundleDiscount.discountPercent,
                bundleDiscount.bundleName ?? "Bundle",
              ),
            },
          ]
        : undefined

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items,
      discounts,
      mode: "payment",
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        items: JSON.stringify(
          (items as Array<Record<string, unknown>>).map((i) => ({
            beatId: i.beatId,
            beatTitle: i.beatTitle,
            licenseTier: i.licenseTier,
            price: i.price,
          })),
        ),
        bundleId: bundleDiscount?.bundleId ?? "",
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error("[checkout] Stripe session create failed:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
        code: (err as { code?: string })?.code,
      },
      { status: 500 },
    )
  }
}

// Helper: create or reuse a Stripe coupon for bundle discounts
async function getOrCreateBundleCoupon(
  percentOff: number,
  name: string,
): Promise<string> {
  const couponId = `bundle-${percentOff}pct`
  try {
    await stripe.coupons.retrieve(couponId)
    return couponId
  } catch {
    const coupon = await stripe.coupons.create({
      id: couponId,
      percent_off: percentOff,
      duration: "once",
      name: `${name} (${percentOff}% off)`,
    })
    return coupon.id
  }
}
