"use client"
import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function ResendVerificationButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false)

  const handleResend = async () => {
    setPending(true)
    try {
      const fn = (
        authClient as unknown as {
          sendVerificationEmail?: (args: {
            email: string
            callbackURL?: string
          }) => Promise<unknown>
        }
      ).sendVerificationEmail
      if (typeof fn === "function") {
        await fn({ email, callbackURL: "/verify-email?status=success" })
      }
      toast.success("Verification email sent. Check your inbox.")
    } catch {
      toast.error("Couldn't resend right now. Try again in a moment.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      onClick={handleResend}
      disabled={pending}
      size="lg"
      className="bg-[var(--foreground)] text-black font-sans"
    >
      {pending ? "Sending..." : "Resend verification email"}
    </Button>
  )
}
