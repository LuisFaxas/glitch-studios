"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { AuthFormCard } from "@/components/auth/auth-form-card"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      // Always succeed in the UI — enumeration-safe per AUTH-29 / UI-SPEC.
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } catch {
      // Even on framework errors, do not leak. Submitted view shows the
      // same enumeration-safe success message.
    } finally {
      setSubmitted(true)
      setPending(false)
    }
  }

  return (
    <AuthFormCard
      heading="Forgot your password?"
      subhead={
        !submitted
          ? "Enter the email on your account. If we recognize it, we'll send a reset link."
          : undefined
      }
      footer={
        <p>
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {submitted ? (
        <Alert>
          <AlertDescription className="text-[16px] leading-[1.5] font-sans">
            If we recognize that email, a reset link is on its way. Check your inbox.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <EnumSafeFormError message={error} />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="bg-[var(--foreground)] text-black font-sans"
          >
            {pending ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthFormCard>
  )
}
