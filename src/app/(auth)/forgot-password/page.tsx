"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod/v4"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.email("Please enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string | null) ?? ""

    const result = schema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setSent(true)
      toast.success("If that email exists, a reset link is on its way.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <GlitchLogo size="md" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
          Reset Password
        </h1>
      </div>

      {sent ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-300">
            Check your email for a reset link. If you don&apos;t see one within
            a few minutes, request a new link.
          </p>
          <Button
            type="button"
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => setSent(false)}
          >
            Send another link
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="text-white underline underline-offset-4 hover:text-pure-white"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
