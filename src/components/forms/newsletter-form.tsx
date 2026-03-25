"use client"

import { useState } from "react"
import { z } from "zod/v4"
import { toast } from "sonner"
import { subscribeNewsletter } from "@/actions/newsletter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
      <Input
        name="email"
        type="email"
        placeholder="Enter your email"
        required
        disabled={isLoading}
        className="flex-1"
      />
      <Button type="submit" size="default" disabled={isLoading}>
        {isLoading ? "..." : "Join the List"}
      </Button>
    </form>
  )
}
