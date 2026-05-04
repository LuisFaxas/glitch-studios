import {
  BrandEmailShell,
  DetailList,
  EmailButton,
  EmailText,
  NoticeBox,
} from "@/lib/email/theme"

interface AdminContactNotificationEmailProps {
  senderName: string
  senderEmail: string
  serviceInterest: string
  message: string
  submittedAt: string
}

export function AdminContactNotificationEmail({
  senderName,
  senderEmail,
  serviceInterest,
  message,
  submittedAt,
}: AdminContactNotificationEmailProps) {
  const formattedDate = new Date(submittedAt).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })

  return (
    <BrandEmailShell
      preview={`New contact form submission from ${senderName}.`}
      eyebrow="Admin notification"
      title="New contact"
      footerNote="Internal Glitch Studios notification."
    >
      <EmailText>
        A new contact form submission landed in the admin inbox.
      </EmailText>
      <DetailList
        items={[
          { label: "From", value: `${senderName} (${senderEmail})` },
          { label: "Interest", value: serviceInterest || "Not specified" },
          { label: "Submitted", value: formattedDate },
        ]}
      />
      <NoticeBox label="Message">{message}</NoticeBox>
      <EmailButton href="https://glitchstudios.io/admin/inbox">
        View in dashboard
      </EmailButton>
    </BrandEmailShell>
  )
}

export default AdminContactNotificationEmail
