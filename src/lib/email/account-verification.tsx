import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES } from "@/lib/brand"
import {
  BrandEmailShell,
  EmailButton,
  EmailText,
  MutedEmailText,
} from "@/lib/email/theme"

interface AccountVerificationEmailProps {
  name: string
  url: string
  brand?: Brand
}

export function AccountVerificationEmail({
  name,
  url,
  brand = "studios",
}: AccountVerificationEmailProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]
  const intro =
    brand === "tech"
      ? "Confirm your email to activate your account and continue on GlitchTech."
      : "Confirm your email to activate your account and unlock beat downloads, bookings, and order history."

  return (
    <BrandEmailShell
      brand={brand}
      preview={`Confirm your email to finish signing up for ${brandName}.`}
      eyebrow="Account security"
      title="Verify email"
      footerNote="This link expires in 1 hour."
    >
      <EmailText>Hey {name || "there"},</EmailText>
      <EmailText>
        Welcome to {brandName}. {intro}
      </EmailText>
      <EmailButton href={url}>Verify email</EmailButton>
      <MutedEmailText>
        If you did not create this account, you can ignore this email.
      </MutedEmailText>
    </BrandEmailShell>
  )
}

export default AccountVerificationEmail
