import { loadStripe } from "@stripe/stripe-js"

let stripePromise: ReturnType<typeof loadStripe> | null = null

function cleanStripeEnv(value: string | undefined): string {
  return (value ?? "").replace(/\\n/g, "").trim()
}

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      cleanStripeEnv(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    )
  }
  return stripePromise
}
