import {
  BrandEmailShell,
  DetailList,
  EmailDivider,
  EmailText,
  MutedEmailText,
  NoticeBox,
} from "@/lib/email/theme"

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
    <BrandEmailShell
      preview={`Reminder: your ${serviceName} session is tomorrow.`}
      eyebrow="Session reminder"
      title="Tomorrow at Glitch"
      footerNote="Glitch Studios - Music and video production."
    >
      <EmailText>Hey {clientName || "there"},</EmailText>
      <EmailText>
        Quick reminder that your Glitch Studios session is tomorrow. Your
        booking details are below.
      </EmailText>
      <DetailList
        items={[
          { label: "Service", value: serviceName },
          { label: "Date", value: date },
          { label: "Time", value: time },
          { label: "Room", value: roomName },
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

export default BookingReminderEmail
