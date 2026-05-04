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
import type { CSSProperties, ReactNode } from "react"
import type { Brand } from "@/lib/brand"
import { BRAND_DISPLAY_NAMES, BRAND_HOME_URLS } from "@/lib/brand"

interface BrandEmailShellProps {
  brand?: Brand
  preview: string
  eyebrow?: string
  title: string
  children: ReactNode
  footerNote?: string
}

export function BrandEmailShell({
  brand = "studios",
  preview,
  eyebrow,
  title,
  children,
  footerNote,
}: BrandEmailShellProps) {
  const brandName = BRAND_DISPLAY_NAMES[brand]
  const homeUrl = BRAND_HOME_URLS[brand]
  const accent = brand === "tech" ? "#8ee7ff" : "#f5f5f0"
  const mutedAccent = brand === "tech" ? "#24404a" : "#2a2a26"

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={outerStyle}>
          <Section style={brandBarStyle}>
            <Text style={{ ...brandWordmarkStyle, color: accent }}>
              {brandName}
            </Text>
            <Text style={hostStyle}>{homeUrl.replace("https://", "")}</Text>
          </Section>

          <Section
            style={{
              ...cardStyle,
              borderTop: `3px solid ${accent}`,
              boxShadow: `0 0 0 1px ${mutedAccent}`,
            }}
          >
            {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
            <Heading style={headingStyle}>{title}</Heading>
            {children}
          </Section>

          <Text style={footerStyle}>
            Sent by {brandName} ·{" "}
            <Link href={homeUrl} style={footerLinkStyle}>
              {homeUrl.replace("https://", "")}
            </Link>
          </Text>
          {footerNote ? (
            <Text style={footerNoteStyle}>{footerNote}</Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export function EmailButton({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  )
}

export function EmailText({ children }: { children: ReactNode }) {
  return <Text style={textStyle}>{children}</Text>
}

export function MutedEmailText({ children }: { children: ReactNode }) {
  return <Text style={mutedTextStyle}>{children}</Text>
}

export function EmailDivider() {
  return <Hr style={dividerStyle} />
}

export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[]
}) {
  return (
    <Section style={detailListStyle}>
      {items.map((item) => (
        <Section key={item.label} style={detailRowStyle}>
          <Text style={detailLabelStyle}>{item.label}</Text>
          <Text style={detailValueStyle}>{item.value}</Text>
        </Section>
      ))}
    </Section>
  )
}

export function NoticeBox({
  label,
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <Section style={noticeStyle}>
      {label ? <Text style={noticeLabelStyle}>{label}</Text> : null}
      <Text style={noticeTextStyle}>{children}</Text>
    </Section>
  )
}

export function formatCurrency(value: number | string): string {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return "$0.00"
  return `$${parsed.toFixed(2)}`
}

const bodyStyle: CSSProperties = {
  backgroundColor: "#050505",
  color: "#f5f5f0",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  margin: 0,
  padding: "32px 0",
}

const outerStyle: CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
  padding: "0 20px",
}

const brandBarStyle: CSSProperties = {
  padding: "0 0 16px",
}

const brandWordmarkStyle: CSSProperties = {
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "18px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  lineHeight: "1.2",
  margin: "0",
  textTransform: "uppercase",
}

const hostStyle: CSSProperties = {
  color: "#777",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "6px 0 0",
}

const cardStyle: CSSProperties = {
  backgroundColor: "#0b0b0b",
  border: "1px solid #202020",
  padding: "32px",
}

const eyebrowStyle: CSSProperties = {
  color: "#8f8f88",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  lineHeight: "1.4",
  margin: "0 0 10px",
  textTransform: "uppercase",
}

const headingStyle: CSSProperties = {
  color: "#f5f5f0",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "26px",
  fontWeight: 800,
  letterSpacing: "0.04em",
  lineHeight: "1.2",
  margin: "0 0 22px",
  textTransform: "uppercase",
}

const textStyle: CSSProperties = {
  color: "#eeeeea",
  fontSize: "15px",
  lineHeight: "1.65",
  margin: "0 0 16px",
}

const mutedTextStyle: CSSProperties = {
  color: "#979790",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "14px 0 0",
}

const buttonStyle: CSSProperties = {
  backgroundColor: "#f5f5f0",
  color: "#050505",
  display: "inline-block",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  margin: "8px 0 18px",
  padding: "13px 20px",
  textDecoration: "none",
  textTransform: "uppercase",
}

const dividerStyle: CSSProperties = {
  border: "none",
  borderTop: "1px solid #242424",
  margin: "24px 0",
}

const detailListStyle: CSSProperties = {
  border: "1px solid #242424",
  margin: "20px 0",
}

const detailRowStyle: CSSProperties = {
  borderBottom: "1px solid #242424",
  padding: "14px 16px",
}

const detailLabelStyle: CSSProperties = {
  color: "#85857f",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  margin: "0 0 5px",
  textTransform: "uppercase",
}

const detailValueStyle: CSSProperties = {
  color: "#f5f5f0",
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: "1.45",
  margin: 0,
}

const noticeStyle: CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid #2d2d2a",
  margin: "18px 0",
  padding: "16px",
}

const noticeLabelStyle: CSSProperties = {
  ...detailLabelStyle,
  margin: "0 0 8px",
}

const noticeTextStyle: CSSProperties = {
  color: "#deded8",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: 0,
}

const footerStyle: CSSProperties = {
  color: "#777",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "18px 0 0",
  textAlign: "center",
}

const footerNoteStyle: CSSProperties = {
  color: "#555",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "6px 0 0",
  textAlign: "center",
}

const footerLinkStyle: CSSProperties = {
  color: "#9b9b94",
  textDecoration: "underline",
}
