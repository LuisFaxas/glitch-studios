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

interface BookingConfirmationProps {
  clientName: string
  serviceName: string
  roomName: string
  date: string
  time: string
  depositAmount: string
  totalPrice: string
  address: string
  prepInstructions: string | null
  icsUrl: string
}

export function BookingConfirmationEmail({
  clientName,
  serviceName,
  roomName,
  date,
  time,
  depositAmount,
  totalPrice,
  address,
  prepInstructions,
  icsUrl,
}: BookingConfirmationProps) {
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
            SESSION BOOKED
          </Heading>

          <Text style={{ fontSize: "15px" }}>
            Hey {clientName}, your session is confirmed!
          </Text>

          <Hr style={{ borderColor: "#222" }} />

          <Section style={{ padding: "16px 0" }}>
            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              SERVICE
            </Text>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                margin: "0 0 12px 0",
              }}
            >
              {serviceName}
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              DATE
            </Text>
            <Text
              style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 12px 0" }}
            >
              {date}
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              TIME
            </Text>
            <Text
              style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 12px 0" }}
            >
              {time}
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              ROOM
            </Text>
            <Text
              style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 12px 0" }}
            >
              {roomName}
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              DEPOSIT PAID
            </Text>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                margin: "0 0 12px 0",
              }}
            >
              ${depositAmount}
            </Text>

            <Text style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
              BALANCE DUE
            </Text>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                margin: "0 0 12px 0",
              }}
            >
              ${(parseFloat(totalPrice) - parseFloat(depositAmount)).toFixed(2)}
            </Text>
          </Section>

          {prepInstructions && (
            <>
              <Hr style={{ borderColor: "#222" }} />
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
                  PREP INSTRUCTIONS
                </Text>
                <Text style={{ fontSize: "15px", margin: "0" }}>
                  {prepInstructions}
                </Text>
              </Section>
            </>
          )}

          <Hr style={{ borderColor: "#222" }} />

          <Section style={{ padding: "16px 0" }}>
            <Link
              href={icsUrl}
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
              Add to Calendar
            </Link>
          </Section>

          <Text style={{ fontSize: "13px", color: "#888", marginTop: "16px" }}>
            {address}
          </Text>

          <Hr style={{ borderColor: "#222" }} />

          <Text
            style={{ fontSize: "11px", color: "#555", marginTop: "24px" }}
          >
            Glitch Studios &mdash; Music &amp; Video Production
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
