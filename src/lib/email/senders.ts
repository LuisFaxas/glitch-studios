import "server-only"

// Sender domains must exist in the active Resend account/API key. For the
// Phase 48 testing pass, glitchtech.io is the verified single-domain account.
const DEFAULT_EMAIL_FROM = "Glitch Studios <noreply@glitchtech.io>"

export const TRANSACTIONAL_EMAIL_FROM =
  process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || DEFAULT_EMAIL_FROM

export const BOOKING_EMAIL_FROM =
  process.env.BOOKING_EMAIL_FROM || TRANSACTIONAL_EMAIL_FROM

export const NEWSLETTER_EMAIL_FROM =
  process.env.NEWSLETTER_EMAIL_FROM || TRANSACTIONAL_EMAIL_FROM

export const ADMIN_REPLY_TO_EMAIL =
  process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "office@glitchstudios.io"
