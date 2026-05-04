import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES } from "@/lib/brand"
import {
  BrandEmailShell,
  DetailList,
  EmailText,
  NoticeBox,
} from "@/lib/email/theme"

interface ArtistApplicationConfirmationEmailProps {
  name: string
  brand: Brand
}

export function ArtistApplicationConfirmationEmail({
  name,
  brand,
}: ArtistApplicationConfirmationEmailProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]
  const role = brand === "tech" ? "contributor" : "artist"

  return (
    <BrandEmailShell
      brand={brand}
      preview={`We received your ${brandName} ${role} application.`}
      eyebrow="Application received"
      title="Request received"
    >
      <EmailText>Hey {name || "there"},</EmailText>
      <EmailText>
        We received your {brandName} {role} application. A real person will
        review it and reply by email if we approve, decline, or need more
        information.
      </EmailText>
      <DetailList
        items={[
          { label: "Brand", value: brandName },
          { label: "Application type", value: role },
          { label: "Review window", value: "1-3 business days" },
        ]}
      />
      <NoticeBox>
        You do not need to submit again. If we need anything else, we will reply
        from the same brand identity that sent this email.
      </NoticeBox>
    </BrandEmailShell>
  )
}

export default ArtistApplicationConfirmationEmail
