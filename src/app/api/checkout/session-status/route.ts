import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  if (!sessionId)
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 })

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return NextResponse.json({
    status: session.status,
    customerEmail: session.customer_details?.email,
    paymentStatus: session.payment_status,
  })
}
