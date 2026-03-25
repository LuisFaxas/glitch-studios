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

interface PurchaseReceiptProps {
  orderId: string
  buyerName: string
  items: {
    beatTitle: string
    licenseTier: string
    price: number
    downloadUrl: string
  }[]
  total: number
}

export function PurchaseReceiptEmail({
  orderId,
  buyerName,
  items,
  total,
}: PurchaseReceiptProps) {
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
          <Text style={{ fontSize: "15px" }}>
            Thank you for your purchase, {buyerName}!
          </Text>
          <Text style={{ fontSize: "13px", color: "#888" }}>
            Order #{orderId}
          </Text>
          <Hr style={{ borderColor: "#222" }} />
          {items.map((item, i) => (
            <Section
              key={i}
              style={{ padding: "12px 0", borderBottom: "1px solid #222" }}
            >
              <Text
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  fontFamily: "monospace",
                }}
              >
                {item.beatTitle}
              </Text>
              <Text style={{ fontSize: "11px", color: "#888" }}>
                {item.licenseTier} — ${item.price.toFixed(2)}
              </Text>
              <Link
                href={item.downloadUrl}
                style={{ color: "#f5f5f0", fontSize: "13px" }}
              >
                Download Files
              </Link>
            </Section>
          ))}
          <Hr style={{ borderColor: "#222" }} />
          <Text
            style={{
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "monospace",
            }}
          >
            Total: ${total.toFixed(2)}
          </Text>
          <Text
            style={{ fontSize: "11px", color: "#888", marginTop: "24px" }}
          >
            Download links expire in 24 hours. Access your purchases anytime
            from your account dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
