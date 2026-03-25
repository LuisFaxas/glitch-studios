"use server"

import { db } from "@/lib/db"
import { contactSubmissions } from "@/db/schema"
import { z } from "zod/v4"

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
