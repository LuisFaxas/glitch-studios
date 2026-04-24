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

interface AccountVerificationEmailProps {
  name: string
  url: string
}

export function AccountVerificationEmail({
  name,
  url,
}: AccountVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email to finish signing up for Glitch Studios.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>Verify email</Heading>
            <Text style={textStyle}>Hey {name || "there"},</Text>
            <Text style={textStyle}>
              Welcome to Glitch Studios. Confirm your email to activate your
              account and unlock beat downloads, bookings, and order history.
            </Text>
            <Button href={url} style={buttonStyle}>
              Verify Email
            </Button>
            <Text style={mutedTextStyle}>This link expires in 1 hour.</Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              Sent by Glitch Studios ·{" "}
              <Link href="https://glitchstudios.io" style={linkStyle}>
                glitchstudios.io
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

export default AccountVerificationEmail
