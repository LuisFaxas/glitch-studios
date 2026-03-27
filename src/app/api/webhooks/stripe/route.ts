import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import {
  orders,
  orderItems,
  beats,
  bookings,
  serviceBookingConfig,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { generateLicensePdf } from "@/lib/pdf-license"
import { getUploadUrl, getDownloadUrl } from "@/lib/r2"
import { Resend } from "resend"
import { PurchaseReceiptEmail } from "@/lib/email/purchase-receipt"
import { DEFAULT_LICENSE_TIERS } from "@/types/beats"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response("Webhook signature verification failed", {
      status: 400,
    })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // --- Booking deposit handling ---
    if (session.metadata?.type === "booking_deposit") {
      const bookingId = session.metadata.bookingId

      // Check idempotency: if booking already confirmed, skip
      const [existing] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1)

      if (!existing) {
        return new Response("Booking not found", { status: 200 })
      }

      if (existing.status === "confirmed") {
        return new Response("Already processed", { status: 200 })
      }

      // Determine new status from autoConfirm config
      const [config] = await db
        .select()
        .from(serviceBookingConfig)
        .where(eq(serviceBookingConfig.serviceId, existing.serviceId))
        .limit(1)

      const newStatus = config?.autoConfirm ? "confirmed" : "pending"

      await db
        .update(bookings)
        .set({
          status: newStatus,
          stripePaymentIntentId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))

      // If recurring series, update all bookings in the series
      if (existing.seriesId) {
        await db
          .update(bookings)
          .set({
            status: newStatus,
            stripePaymentIntentId: session.payment_intent as string,
            updatedAt: new Date(),
          })
          .where(eq(bookings.seriesId, existing.seriesId))
      }

      // Email sending deferred to Plan 06
      return new Response("Booking confirmed", { status: 200 })
    }

    // --- Beat purchase handling ---
    const customerEmail = session.customer_details?.email ?? ""
    const customerName = session.customer_details?.name ?? "Customer"
    const cartItems = JSON.parse(session.metadata?.items ?? "[]")

    // 1. Create order
    const [order] = await db
      .insert(orders)
      .values({
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        guestEmail: customerEmail,
        status: "completed",
        totalAmount: (session.amount_total! / 100).toFixed(2),
      })
      .returning()

    // 2. Create order items + generate PDFs
    for (const item of cartItems) {
      const tierDef = DEFAULT_LICENSE_TIERS.find(
        (t) => t.tier === item.licenseTier
      )

      // Generate license PDF
      const pdfBytes = await generateLicensePdf({
        buyerName: customerName,
        buyerEmail: customerEmail,
        beatTitle: item.beatTitle ?? "Beat",
        licenseTier: tierDef?.displayName ?? item.licenseTier,
        usageRights: tierDef?.usageRights ?? [],
        orderId: order.id,
        purchaseDate: new Date(),
      })

      // Upload PDF to R2
      const pdfKey = `licenses/${order.id}/${item.beatId}-${item.licenseTier}.pdf`
      const uploadUrl = await getUploadUrl(pdfKey, "application/pdf")
      await fetch(uploadUrl, {
        method: "PUT",
        body: Buffer.from(pdfBytes),
        headers: { "Content-Type": "application/pdf" },
      })

      // Insert order item
      await db.insert(orderItems).values({
        orderId: order.id,
        beatId: item.beatId,
        licenseTier: item.licenseTier,
        price: item.price.toFixed(2),
        licensePdfKey: pdfKey,
      })

      // Mark exclusive as sold
      if (item.licenseTier === "exclusive") {
        await db
          .update(beats)
          .set({ status: "sold_exclusive" })
          .where(eq(beats.id, item.beatId))
      }
    }

    // 3. Send receipt email (if RESEND_API_KEY is set)
    if (process.env.RESEND_API_KEY) {
      const dbOrderItems = await db
        .select({
          beatTitle: beats.title,
          licenseTier: orderItems.licenseTier,
          price: orderItems.price,
        })
        .from(orderItems)
        .innerJoin(beats, eq(orderItems.beatId, beats.id))
        .where(eq(orderItems.orderId, order.id))

      // Build email items -- compute tierDef per item independently
      const emailItems = dbOrderItems.map((dbItem) => {
        const itemTierDef = DEFAULT_LICENSE_TIERS.find(
          (t) => t.tier === dbItem.licenseTier
        )
        return {
          beatTitle: dbItem.beatTitle,
          licenseTier: itemTierDef?.displayName ?? dbItem.licenseTier,
          price: Number(dbItem.price),
          downloadUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id=${session.id}`,
        }
      })

      await resend.emails.send({
        from: "Glitch Studios <noreply@glitchstudios.com>",
        to: customerEmail,
        subject: `Your Glitch Studios Order #${order.id.slice(0, 8)}`,
        react: PurchaseReceiptEmail({
          orderId: order.id.slice(0, 8),
          buyerName: customerName,
          items: emailItems,
          total: Number(order.totalAmount),
        }),
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
