import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { calculateBundleDiscount } from "@/actions/bundles"

export async function POST(request: Request) {
  const { items } = await request.json()
  // items: CartItem[]

  // Check for bundle discount (BEAT-10)
  const beatIds = items.map((i: any) => i.beatId)
  const bundleDiscount = await calculateBundleDiscount(beatIds)

  const line_items = items.map((item: any) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: `${item.beatTitle} - ${item.licenseTierDisplay}`,
        metadata: {
          beatId: item.beatId,
          licenseTier: item.licenseTier,
        },
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }))

  // Apply bundle discount as a coupon if applicable
  const discounts =
    bundleDiscount && bundleDiscount.discountPercent > 0
      ? [
          {
            coupon: await getOrCreateBundleCoupon(
              bundleDiscount.discountPercent,
              bundleDiscount.bundleName ?? "Bundle"
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
        items.map((i: any) => ({
          beatId: i.beatId,
          beatTitle: i.beatTitle,
          licenseTier: i.licenseTier,
          price: i.price,
        }))
      ),
      bundleId: bundleDiscount?.bundleId ?? "",
    },
  })

  return NextResponse.json({ clientSecret: session.client_secret })
}

// Helper: create or reuse a Stripe coupon for bundle discounts
async function getOrCreateBundleCoupon(
  percentOff: number,
  name: string
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
