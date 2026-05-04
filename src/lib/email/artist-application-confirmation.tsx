import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES, BRAND_HOME_URLS } from "@/lib/brand"

interface ArtistApplicationConfirmationEmailProps {
  name: string
  brand: Brand
}

export function ArtistApplicationConfirmationEmail({
  name,
  brand,
}: ArtistApplicationConfirmationEmailProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]
  const homeUrl = BRAND_HOME_URLS[brand]
  const role = brand === "tech" ? "contributor" : "artist"

  return (
    <Html>
      <Head />
      <Preview>{`We received your ${brandName} ${role} application.`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>Application received</Heading>
            <Text style={textStyle}>Hey {name || "there"},</Text>
            <Text style={textStyle}>
              We received your {brandName} {role} application. A real person
              will review it and reply by email if we approve, decline, or need
              more information.
            </Text>
            <Text style={mutedTextStyle}>
              Expected review window: 1-3 business days.
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              Sent by {brandName} ·{" "}
              <Link href={homeUrl} style={linkStyle}>
                {homeUrl.replace("https://", "")}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: "#000000",
  color: "#f5f5f0",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  padding: "32px 0",
} as const

const containerStyle = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #222",
  maxWidth: "560px",
  padding: "32px",
} as const

const headingStyle = {
  color: "#f5f5f0",
  fontSize: "24px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  margin: "0 0 24px",
} as const

const textStyle = {
  color: "#f5f5f0",
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "0 0 16px",
} as const

const mutedTextStyle = {
  color: "#888",
  fontSize: "12px",
  margin: "16px 0 0",
} as const

const hrStyle = {
  border: "none",
  borderTop: "1px solid #222",
  margin: "32px 0 16px",
} as const

const footerStyle = {
  color: "#555",
  fontSize: "11px",
  margin: 0,
} as const

const linkStyle = {
  color: "#888",
  textDecoration: "underline",
} as const

export default ArtistApplicationConfirmationEmail
