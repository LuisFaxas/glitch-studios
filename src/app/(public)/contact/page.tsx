import { Suspense } from "react"
import { db } from "@/lib/db"
import { services } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ContactForm } from "@/components/forms/contact-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Glitch Studios for studio sessions, mixing, mastering, video production, and more.",
}

export default async function ContactPage() {
  let servicesList: { name: string; slug: string }[] = []
  try {
    servicesList = await db
      .select({ name: services.name, slug: services.slug })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder))
  } catch {
    // Fallback to empty services list if DB unavailable
    servicesList = []
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4 text-white">
        Get in Touch
      </h1>
      <p className="text-gray-400 text-lg mb-12">
        Have a project in mind? Let us know what you are working on and we will
        get back to you within 24 hours.
      </p>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 md:p-12">
        <Suspense fallback={null}>
          <ContactForm services={servicesList} />
        </Suspense>
      </div>
    </div>
  )
}
