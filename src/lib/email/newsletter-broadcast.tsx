import { Link, Section, Text } from "@react-email/components"
import { BrandEmailShell, EmailDivider } from "@/lib/email/theme"

interface NewsletterBroadcastEmailProps {
  body: string
  unsubscribeUrl: string
}

export function NewsletterBroadcastEmail({
  body,
  unsubscribeUrl,
}: NewsletterBroadcastEmailProps) {
  return (
    <BrandEmailShell
      preview="New update from Glitch Studios."
      eyebrow="Glitch Studios"
      title="Studio update"
      footerNote="You are receiving this because you subscribed to Glitch Studios updates."
    >
      <Section
        dangerouslySetInnerHTML={{ __html: body }}
        style={newsletterBodyStyle}
      />
      <EmailDivider />
      <Text style={unsubscribeTextStyle}>
        Not your thing right now?{" "}
        <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
          Unsubscribe
        </Link>
        .
      </Text>
    </BrandEmailShell>
  )
}

const newsletterBodyStyle = {
  color: "#eeeeea",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: "15px",
  lineHeight: "1.65",
} as const

const unsubscribeTextStyle = {
  color: "#85857f",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
} as const

const unsubscribeLinkStyle = {
  color: "#b8b8b1",
  textDecoration: "underline",
} as const

export default NewsletterBroadcastEmail
