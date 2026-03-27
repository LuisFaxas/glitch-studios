"use server"

import { db } from "@/lib/db"
import { contactSubmissions } from "@/db/schema"
import { z } from "zod/v4"
import { Resend } from "resend"
import { AdminContactNotificationEmail } from "@/lib/email/admin-contact-notification"

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  serviceInterest: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    serviceInterest: (formData.get("serviceInterest") as string) || undefined,
    message: formData.get("message") as string,
  }

  const result = contactSchema.safeParse(raw)
  if (!result.success) {
    return {
      success: false as const,
      message: "Please check your details and try again.",
      errors: z.treeifyError(result.error),
    }
  }

  try {
    await db.insert(contactSubmissions).values({
      name: result.data.name,
      email: result.data.email,
      serviceInterest: result.data.serviceInterest || null,
      message: result.data.message,
    })

    // Send admin notification email (failure should NOT break form submission)
    try {
      await resend.emails.send({
        from: "Glitch Studios <noreply@glitchstudios.com>",
        to: process.env.ADMIN_EMAIL || "admin@glitchstudios.com",
        subject: `New Contact: ${result.data.name} - ${result.data.serviceInterest || "General Inquiry"}`,
        react: AdminContactNotificationEmail({
          senderName: result.data.name,
          senderEmail: result.data.email,
          serviceInterest: result.data.serviceInterest || "Not specified",
          message: result.data.message,
          submittedAt: new Date().toISOString(),
        }),
      })
    } catch {
      console.error("Failed to send admin notification email")
    }

    return {
      success: true as const,
      message: "Message sent. We will get back to you within 24 hours.",
    }
  } catch {
    return {
      success: false as const,
      message:
        "Something went wrong. Please try again or email us directly.",
    }
  }
}
