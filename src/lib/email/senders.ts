import "server-only"

import type { Brand } from "@/lib/brand"

const STUDIOS_TRANSACTIONAL_EMAIL_FROM =
  process.env.STUDIOS_EMAIL_FROM ||
  "Glitch Studios <noreply@mail.glitchstudios.io>"

const TECH_TRANSACTIONAL_EMAIL_FROM =
  process.env.TECH_EMAIL_FROM || "GlitchTech <noreply@glitchtech.io>"

export function getTransactionalEmailFrom(brand: Brand = "studios"): string {
  return brand === "tech"
    ? TECH_TRANSACTIONAL_EMAIL_FROM
    : STUDIOS_TRANSACTIONAL_EMAIL_FROM
}

export function getNewsletterEmailFrom(brand: Brand = "studios"): string {
  if (brand === "tech") {
    return (
      process.env.TECH_NEWSLETTER_EMAIL_FROM || TECH_TRANSACTIONAL_EMAIL_FROM
    )
  }

  return (
    process.env.STUDIOS_NEWSLETTER_EMAIL_FROM ||
    STUDIOS_TRANSACTIONAL_EMAIL_FROM
  )
}

export const BOOKING_EMAIL_FROM =
  process.env.STUDIOS_BOOKING_EMAIL_FROM || STUDIOS_TRANSACTIONAL_EMAIL_FROM

export const TRANSACTIONAL_EMAIL_FROM = getTransactionalEmailFrom("studios")

export const NEWSLETTER_EMAIL_FROM = getNewsletterEmailFrom("studios")

export const ADMIN_REPLY_TO_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  "office@glitchstudios.io"
