import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
} from "@react-email/components"

interface AdminContactNotificationEmailProps {
  senderName: string
  senderEmail: string
  serviceInterest: string
  message: string
  submittedAt: string
}

export function AdminContactNotificationEmail({
  senderName,
  senderEmail,
  serviceInterest,
  message,
  submittedAt,
}: AdminContactNotificationEmailProps) {
  const formattedDate = new Date(submittedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#000",
          color: "#f5f5f0",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}
        >
          <Heading
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            GLITCH STUDIOS
          </Heading>

          <Heading
            as="h2"
            style={{
              fontFamily: "monospace",
              fontSize: "20px",
              fontWeight: "700",
              marginTop: "8px",
            }}
          >
            NEW CONTACT FORM SUBMISSION
          </Heading>

          <Hr style={{ borderColor: "#222" }} />

          <Section style={{ padding: "16px 0" }}>
            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              FROM
            </Text>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                margin: "0 0 12px 0",
              }}
            >
              {senderName} ({senderEmail})
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              SERVICE INTEREST
            </Text>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                margin: "0 0 12px 0",
              }}
            >
              {serviceInterest || "Not specified"}
            </Text>
          </Section>

          <Section
            style={{
              padding: "16px",
              border: "1px solid #222",
              margin: "16px 0",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                color: "#888",
                margin: "0 0 8px 0",
                fontFamily: "monospace",
                fontWeight: "700",
              }}
            >
              MESSAGE
            </Text>
            <Text
              style={{
                fontSize: "15px",
                margin: "0",
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </Text>
          </Section>

          <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
            Submitted: {formattedDate}
          </Text>

          <Hr style={{ borderColor: "#222" }} />

          <Section style={{ padding: "16px 0" }}>
            <Link
              href={`${process.env.NEXT_PUBLIC_URL || "https://glitchstudios.com"}/admin/inbox`}
              style={{
                display: "inline-block",
                backgroundColor: "#f5f5f0",
                color: "#000",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "12px 24px",
                textDecoration: "none",
              }}
            >
              View in Dashboard
            </Link>
          </Section>

          <Hr style={{ borderColor: "#222" }} />

          <Text
            style={{ fontSize: "11px", color: "#555", marginTop: "24px" }}
          >
            Glitch Studios Admin Notification
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
