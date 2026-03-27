import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Hr,
  Section,
} from "@react-email/components"

interface NewsletterBroadcastEmailProps {
  body: string
  unsubscribeUrl: string
}

export function NewsletterBroadcastEmail({
  body,
  unsubscribeUrl,
}: NewsletterBroadcastEmailProps) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#000000",
          color: "#f5f5f0",
          fontFamily: "Inter, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}
        >
          {/* Header */}
          <Heading
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              fontWeight: "700",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 24px 0",
            }}
          >
            GLITCH STUDIOS
          </Heading>

          <Hr style={{ borderColor: "#222" }} />

          {/* Body - Tiptap HTML injected */}
          <Section style={{ padding: "24px 0" }}>
            <div
              dangerouslySetInnerHTML={{ __html: body }}
              style={{
                color: "#f5f5f0",
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            />
          </Section>

          <Hr style={{ borderColor: "#222" }} />

          {/* Footer */}
          <Section style={{ padding: "24px 0", textAlign: "center" }}>
            <Text
              style={{
                fontSize: "11px",
                color: "#555",
                margin: "0 0 8px 0",
              }}
            >
              Glitch Studios &mdash; Music &amp; Video Production
            </Text>
            <Link
              href={unsubscribeUrl}
              style={{
                fontSize: "11px",
                color: "#555",
                textDecoration: "underline",
              }}
            >
              Unsubscribe from this list
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
