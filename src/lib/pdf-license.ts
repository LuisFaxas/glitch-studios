import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function generateLicensePdf(params: {
  buyerName: string
  buyerEmail: string
  beatTitle: string
  licenseTier: string
  usageRights: string[]
  orderId: string
  purchaseDate: Date
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  // Header
  page.drawText("GLITCH STUDIOS", {
    x: 50,
    y: 720,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  page.drawText("Beat License Agreement", { x: 50, y: 690, size: 16, font })

  // License details
  let y = 650
  const fields = [
    ["Order ID:", params.orderId],
    ["Date:", params.purchaseDate.toLocaleDateString("en-US")],
    ["Beat:", params.beatTitle],
    ["License:", params.licenseTier],
    ["Licensee:", params.buyerName],
    ["Email:", params.buyerEmail],
  ]
  for (const [label, value] of fields) {
    page.drawText(label, { x: 50, y, size: 11, font: boldFont })
    page.drawText(value, { x: 150, y, size: 11, font })
    y -= 20
  }

  // Usage rights
  y -= 20
  page.drawText("Usage Rights:", { x: 50, y, size: 12, font: boldFont })
  y -= 18
  for (const right of params.usageRights) {
    page.drawText(`  - ${right}`, { x: 50, y, size: 10, font })
    y -= 16
  }

  // Footer
  y -= 30
  page.drawText(
    "This license is non-transferable. For full terms, visit glitchstudios.com/terms.",
    { x: 50, y, size: 8, font }
  )

  return doc.save()
}
