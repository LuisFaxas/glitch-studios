import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES } from "@/lib/brand"
import {
  BrandEmailShell,
  EmailButton,
  EmailText,
  MutedEmailText,
} from "@/lib/email/theme"

interface PasswordResetEmailProps {
  name: string
  url: string
  brand?: Brand
}

export function PasswordResetEmail({
  name,
  url,
  brand = "studios",
}: PasswordResetEmailProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]

  return (
    <BrandEmailShell
      brand={brand}
      preview={`Reset your ${brandName} password. This link expires in 1 hour.`}
      eyebrow="Account security"
      title="Reset password"
      footerNote="This link expires in 1 hour."
    >
      <EmailText>Hey {name || "there"},</EmailText>
      <EmailText>
        Someone requested a password reset for your {brandName} account. If that
        was you, use the button below.
      </EmailText>
      <EmailButton href={url}>Reset password</EmailButton>
      <MutedEmailText>
        If you did not request this, ignore this email. Your password will not
        change.
      </MutedEmailText>
    </BrandEmailShell>
  )
}

export default PasswordResetEmail
