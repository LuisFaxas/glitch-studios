"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { submitContactForm } from "@/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <Label htmlFor="name" className="text-gray-300">
          Your Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          disabled={isLoading}
          placeholder="John Doe"
          className="bg-gray-800 border-gray-800 focus:border-white text-white"
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          placeholder="you@example.com"
          className="bg-gray-800 border-gray-800 focus:border-white text-white"
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceInterest" className="text-gray-300">
          What are you interested in?
        </Label>
        <select
          id="serviceInterest"
          name="serviceInterest"
          disabled={isLoading}
          defaultValue={preselectedService}
          className="w-full h-8 rounded-lg border border-gray-800 bg-gray-800 px-2.5 py-1 text-sm text-white transition-colors outline-none focus:border-white focus:ring-3 focus:ring-white/10 disabled:opacity-50"
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
        <Label htmlFor="message" className="text-gray-300">
          Your Message
        </Label>
        <textarea
          id="message"
          name="message"
          required
          disabled={isLoading}
          placeholder="Tell us about your project..."
          className="w-full bg-gray-800 border border-gray-800 focus:border-white text-white rounded-lg p-3 min-h-[150px] resize-y text-sm transition-colors outline-none focus:ring-3 focus:ring-white/10 disabled:opacity-50 placeholder:text-gray-600"
        />
        {errors.message && (
          <p className="text-destructive text-sm">{errors.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </form>
  )
}
