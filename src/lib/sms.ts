import twilio from "twilio"

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

/**
 * Send an SMS message via Twilio.
 * Gracefully degrades when Twilio credentials are not configured --
 * logs a warning and returns without error.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.warn("[SMS] Twilio not configured, skipping SMS to", to)
    return
  }

  if (!client) {
    console.warn("[SMS] Twilio client not initialized, skipping SMS to", to)
    return
  }

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })
  } catch (error) {
    console.error("[SMS] Failed to send SMS:", error)
    // Don't throw -- SMS failure should not break booking flow
  }
}
