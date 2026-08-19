import Stripe from "stripe"

function cleanStripeEnv(value: string | undefined): string {
  return (value ?? "").replace(/\\n/g, "").trim()
}

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const secretKey = cleanStripeEnv(process.env.STRIPE_SECRET_KEY)
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }

  stripeClient ??= new Stripe(secretKey, {
    typescript: true,
  })

  return stripeClient
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver)
  },
})
