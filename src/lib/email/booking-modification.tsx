import {
  BrandEmailShell,
  DetailList,
  EmailButton,
  EmailText,
  MutedEmailText,
  NoticeBox,
} from "@/lib/email/theme"

interface BookingModificationEmailProps {
  name: string
  bookingId: string
  service: string
  oldDate: string
  newDate: string | null
  reason?: string
}

export function BookingModificationEmail({
  name,
  bookingId,
  service,
  oldDate,
  newDate,
  reason,
}: BookingModificationEmailProps) {
  const cancelled = newDate === null
  const preview = cancelled
    ? "Your Glitch Studios booking has been cancelled."
    : "Your Glitch Studios booking has been rescheduled."

  return (
    <BrandEmailShell
      preview={preview}
      eyebrow="Booking update"
      title={cancelled ? "Booking cancelled" : "Booking rescheduled"}
    >
      <EmailText>Hey {name || "there"},</EmailText>
      <EmailText>
        {cancelled
          ? `Your booking for ${service} has been cancelled.`
          : `Your booking for ${service} has been moved.`}
      </EmailText>
      <DetailList
        items={[
          { label: "Booking reference", value: bookingId },
          { label: "Service", value: service },
          { label: "Original time", value: oldDate },
          {
            label: cancelled ? "Status" : "New time",
            value: cancelled ? "Cancelled" : newDate,
          },
        ]}
      />
      {reason ? (
        <NoticeBox label="Note from the studio">{reason}</NoticeBox>
      ) : null}
      <EmailButton href="https://glitchstudios.io/dashboard/bookings">
        View bookings
      </EmailButton>
      <MutedEmailText>
        Reply to this email if this change was not expected.
      </MutedEmailText>
    </BrandEmailShell>
  )
}

export default BookingModificationEmail
