"use client"

import { useState } from "react"
import { z } from "zod/v4"
import { toast } from "sonner"
import { subscribeNewsletter } from "@/actions/newsletter"

const emailSchema = z.email("Please enter a valid email address")

export function NewsletterForm() {
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
      const response = await subscribeNewsletter(email)
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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="email"
        type="email"
        placeholder="Enter your email"
        required
        disabled={isLoading}
        className="flex-1 h-10 bg-[#111111] border border-[#333333] rounded-none px-3 text-sm text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 md:px-6 h-10 font-mono font-bold text-xs md:text-sm uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isLoading ? "..." : "Join"}
      </button>
    </form>
  )
}
