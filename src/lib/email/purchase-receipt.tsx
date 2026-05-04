import { Section, Text } from "@react-email/components"
import {
  BrandEmailShell,
  DetailList,
  EmailButton,
  EmailText,
  MutedEmailText,
  formatCurrency,
} from "@/lib/email/theme"

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
  const downloadUrl =
    items[0]?.downloadUrl ?? "https://glitchstudios.io/dashboard/purchases"

  return (
    <BrandEmailShell
      preview={`Your Glitch Studios order #${orderId} is ready.`}
      eyebrow="Order receipt"
      title="Your files are ready"
      footerNote="Download links may expire. Your dashboard keeps the purchase record."
    >
      <EmailText>
        Thank you for your purchase, {buyerName || "there"}.
      </EmailText>
      <EmailText>
        Your license PDFs and download links are ready. Keep this receipt for
        your records.
      </EmailText>
      <EmailButton href={downloadUrl}>View downloads</EmailButton>
      <DetailList
        items={[
          { label: "Order", value: `#${orderId}` },
          { label: "Items", value: String(items.length) },
          { label: "Total", value: formatCurrency(total) },
        ]}
      />
      <Section style={itemsStyle}>
        {items.map((item) => (
          <Section
            key={`${item.beatTitle}-${item.licenseTier}`}
            style={itemStyle}
          >
            <Text style={itemTitleStyle}>{item.beatTitle}</Text>
            <Text style={itemMetaStyle}>
              {item.licenseTier} · {formatCurrency(item.price)}
            </Text>
          </Section>
        ))}
      </Section>
      <MutedEmailText>
        You can access purchase history and files from your Glitch Studios
        dashboard.
      </MutedEmailText>
    </BrandEmailShell>
  )
}

const itemsStyle = {
  border: "1px solid #242424",
  margin: "20px 0",
} as const

const itemStyle = {
  borderBottom: "1px solid #242424",
  padding: "14px 16px",
} as const

const itemTitleStyle = {
  color: "#f5f5f0",
  fontSize: "15px",
  fontWeight: 800,
  lineHeight: "1.4",
  margin: "0 0 5px",
} as const

const itemMetaStyle = {
  color: "#8f8f88",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: 0,
} as const

export default PurchaseReceiptEmail
