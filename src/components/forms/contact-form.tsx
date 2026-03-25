"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { submitContactForm } from "@/actions/contact"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface ContactFormProps {
  services: { name: string; slug: string }[]
}

export function ContactForm({ services }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get("service") || ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await submitContactForm(formData)
      if (result.success) {
        toast.success(result.message)
        formRef.current?.reset()
      } else {
        toast.error(result.message)
        if ("errors" in result && result.errors) {
          const fieldErrors: Record<string, string | undefined> = {}
          const tree = result.errors as Record<string, unknown>
          if (tree && typeof tree === "object" && "properties" in tree) {
            const properties = (tree as { properties: Record<string, { errors?: string[] }> }).properties
            for (const [key, value] of Object.entries(properties)) {
              if (value?.errors?.[0]) {
                fieldErrors[key] = value.errors[0]
              }
            }
          }
          setErrors(fieldErrors)
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#888888] font-mono text-xs uppercase tracking-[0.05em]">
          Your Name
        </Label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isLoading}
          placeholder="John Doe"
          className="w-full h-10 bg-[#0a0a0a] border border-[#333333] rounded-none px-3 text-sm text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors disabled:opacity-50"
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#888888] font-mono text-xs uppercase tracking-[0.05em]">
          Email Address
        </Label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          placeholder="you@example.com"
          className="w-full h-10 bg-[#0a0a0a] border border-[#333333] rounded-none px-3 text-sm text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors disabled:opacity-50"
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceInterest" className="text-[#888888] font-mono text-xs uppercase tracking-[0.05em]">
          What are you interested in?
        </Label>
        <select
          id="serviceInterest"
          name="serviceInterest"
          disabled={isLoading}
          defaultValue={preselectedService}
          className="w-full h-10 rounded-none border border-[#333333] bg-[#0a0a0a] px-3 text-sm text-[#f5f5f0] transition-colors outline-none focus:border-[#f5f5f0] disabled:opacity-50"
        >
          <option value="">Select a service (optional)</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
        {errors.serviceInterest && (
          <p className="text-destructive text-sm">{errors.serviceInterest}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-[#888888] font-mono text-xs uppercase tracking-[0.05em]">
          Your Message
        </Label>
        <textarea
          id="message"
          name="message"
          required
          disabled={isLoading}
          placeholder="Tell us about your project..."
          className="w-full bg-[#0a0a0a] border border-[#333333] rounded-none p-3 min-h-[150px] resize-y text-sm text-[#f5f5f0] transition-colors outline-none focus:border-[#f5f5f0] focus:ring-0 disabled:opacity-50 placeholder:text-[#555555]"
        />
        {errors.message && (
          <p className="text-destructive text-sm">{errors.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-8 py-3 font-mono font-bold text-sm uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </form>
  )
}
