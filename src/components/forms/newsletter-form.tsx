"use client"

import { useState } from "react"
import { z } from "zod/v4"
import { toast } from "sonner"
import {
  subscribeNewsletter,
  type NewsletterSource,
} from "@/actions/newsletter"

const emailSchema = z.email("Please enter a valid email address")

interface NewsletterFormProps {
  source?: NewsletterSource
  compact?: boolean
}

export function NewsletterForm({ source, compact }: NewsletterFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const response = await subscribeNewsletter(email, source)
      if (response.success) {
        toast.success(response.message)
        e.currentTarget.reset()
      } else {
        toast.info(response.message)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = `flex-1 min-w-0 ${compact ? "h-8" : "h-10"} bg-[#111111] border border-[#333333] rounded-none px-3 ${compact ? "text-xs" : "text-sm"} text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors disabled:opacity-50`

  const buttonClass = compact
    ? "shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 h-8 font-mono font-bold text-[10px] uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 whitespace-nowrap"
    : "shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 md:px-6 h-10 font-mono font-bold text-xs md:text-sm uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 whitespace-nowrap"

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" data-source={source}>
      <input
        name="email"
        type="email"
        placeholder="Enter your email"
        required
        disabled={isLoading}
        className={inputClass}
      />
      <button type="submit" disabled={isLoading} className={buttonClass}>
        {isLoading ? "..." : "Subscribe"}
      </button>
    </form>
  )
}
