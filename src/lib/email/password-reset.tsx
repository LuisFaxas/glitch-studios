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

interface PasswordResetEmailProps {
  name: string
  url: string
}

export function PasswordResetEmail({ name, url }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Glitch Studios password — link expires in 1 hour.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>Reset password</Heading>
            <Text style={textStyle}>Hey {name || "there"},</Text>
            <Text style={textStyle}>
              Someone requested a password reset for your Glitch Studios account.
              If that was you, click the button below. Otherwise ignore this
              email — your password will not change.
            </Text>
            <Button href={url} style={buttonStyle}>
              Reset Password
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

export default PasswordResetEmail
