import {
  Body,
  Button,
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

interface ArtistApprovalInviteEmailProps {
  name: string
  url: string
  brand: "studios" | "tech"
}

export function ArtistApprovalInviteEmail({
  name,
  url,
  brand,
}: ArtistApprovalInviteEmailProps) {
  const brandName = brand === "tech" ? "GlitchTech" : "Glitch Studios"
  const role = brand === "tech" ? "contributor" : "artist"
  const intro =
    brand === "tech"
      ? `Your application to contribute to ${brandName} has been approved.`
      : `Your application to join ${brandName} as an ${role} has been approved.`
  const homeUrl =
    brand === "tech" ? "https://glitchtech.io" : "https://glitchstudios.io"

  return (
    <Html>
      <Head />
      <Preview>{`You're approved — set your password for ${brandName}.`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>{`Welcome to ${brandName}`}</Heading>
            <Text style={textStyle}>{`Hi ${name || "there"},`}</Text>
            <Text style={textStyle}>
              {intro} Set your password to activate your account and sign in.
            </Text>
            <Button href={url} style={buttonStyle}>
              Set your password
            </Button>
            <Text style={mutedTextStyle}>
              {`If you didn't apply to ${brandName}, you can ignore this email.`}
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

const buttonStyle = {
  backgroundColor: "#f5f5f0",
  color: "#000000",
  padding: "12px 24px",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  textDecoration: "none",
  display: "inline-block",
  margin: "16px 0",
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

export default ArtistApprovalInviteEmail
