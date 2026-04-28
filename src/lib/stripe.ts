import Stripe from "stripe"

function cleanStripeEnv(value: string | undefined): string {
  return (value ?? "").replace(/\\n/g, "").trim()
}

export const stripe = new Stripe(cleanStripeEnv(process.env.STRIPE_SECRET_KEY), {
  typescript: true,
})
