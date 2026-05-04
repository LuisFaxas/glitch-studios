import {
  BrandEmailShell,
  DetailList,
  EmailButton,
  EmailDivider,
  EmailText,
  MutedEmailText,
  NoticeBox,
  formatCurrency,
} from "@/lib/email/theme"

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
  const balanceDue =
    Number.parseFloat(totalPrice) - Number.parseFloat(depositAmount)

  return (
    <BrandEmailShell
      preview={`Your ${serviceName} session at Glitch Studios is confirmed.`}
      eyebrow="Session booked"
      title="Booking confirmed"
      footerNote="Glitch Studios - Music and video production."
    >
      <EmailText>Hey {clientName || "there"},</EmailText>
      <EmailText>
        Your session is confirmed. Add it to your calendar and review the
        details below before you come in.
      </EmailText>
      <EmailButton href={icsUrl}>Add to calendar</EmailButton>
      <DetailList
        items={[
          { label: "Service", value: serviceName },
          { label: "Date", value: date },
          { label: "Time", value: time },
          { label: "Room", value: roomName },
          { label: "Deposit paid", value: formatCurrency(depositAmount) },
          { label: "Balance due", value: formatCurrency(balanceDue) },
        ]}
      />
      {prepInstructions ? (
        <NoticeBox label="Prep instructions">{prepInstructions}</NoticeBox>
      ) : null}
      <EmailDivider />
      <MutedEmailText>{address}</MutedEmailText>
    </BrandEmailShell>
  )
}

export default BookingConfirmationEmail
