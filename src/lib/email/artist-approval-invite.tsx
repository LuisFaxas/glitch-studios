import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES } from "@/lib/brand"
import {
  BrandEmailShell,
  EmailButton,
  EmailText,
  MutedEmailText,
  NoticeBox,
} from "@/lib/email/theme"

interface ArtistApprovalInviteEmailProps {
  name: string
  url: string
  brand: Brand
}

export function ArtistApprovalInviteEmail({
  name,
  url,
  brand,
}: ArtistApprovalInviteEmailProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]
  const role = brand === "tech" ? "contributor" : "artist"
  const intro =
    brand === "tech"
      ? `Your application to contribute to ${brandName} has been approved.`
      : `Your application to join ${brandName} as an ${role} has been approved.`

  return (
    <BrandEmailShell
      brand={brand}
      preview={`You're approved. Set your password for ${brandName}.`}
      eyebrow="Application approved"
      title={`Welcome to ${brandName}`}
      footerNote="This invite link is for your account only."
    >
      <EmailText>Hi {name || "there"},</EmailText>
      <EmailText>
        {intro} Set your password to activate your account and sign in.
      </EmailText>
      <EmailButton href={url}>Set password</EmailButton>
      <NoticeBox label="What happens next">
        After your password is set, you can sign in and continue from the
        dashboard for your brand.
      </NoticeBox>
      <MutedEmailText>
        If you did not apply to {brandName}, you can ignore this email.
      </MutedEmailText>
    </BrandEmailShell>
  )
}

export default ArtistApprovalInviteEmail
