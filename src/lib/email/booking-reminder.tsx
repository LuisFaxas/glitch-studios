import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from "@react-email/components"

interface BookingReminderProps {
  clientName: string
  serviceName: string
  roomName: string
  date: string
  time: string
  address: string
  prepInstructions: string | null
}

export function BookingReminderEmail({
  clientName,
  serviceName,
  roomName,
  date,
  time,
  address,
  prepInstructions,
}: BookingReminderProps) {
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
            REMINDER: SESSION TOMORROW
          </Heading>

          <Text style={{ fontSize: "15px" }}>
            Hey {clientName}, just a reminder that your session is tomorrow.
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

          <Text style={{ fontSize: "13px", color: "#888", marginTop: "16px" }}>
            {address}
          </Text>

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
