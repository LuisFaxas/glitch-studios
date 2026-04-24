"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod/v4"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    newPassword?: string
    confirmPassword?: string
  }>({})

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <GlitchLogo size="md" />
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
            Invalid or Expired Link
          </h1>
        </div>
        <p className="text-center text-sm text-gray-300">
          This password reset link is invalid or has expired. Request a new one
          to continue.
        </p>
        <Link
          href="/forgot-password"
          className="block text-center text-white underline underline-offset-4 hover:text-pure-white"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const newPassword = (formData.get("newPassword") as string | null) ?? ""
    const confirmPassword =
      (formData.get("confirmPassword") as string | null) ?? ""

    const result = schema.safeParse({ newPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors: {
        newPassword?: string
        confirmPassword?: string
      } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "newPassword" | "confirmPassword"
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.resetPassword({
        newPassword,
        token: token!,
      })
      if (error) {
        toast.error(error.message ?? "Reset failed. Request a new link.")
        return
      }
      toast.success("Password updated. Please sign in.")
      router.push("/login")
    } catch {
      toast.error("Reset failed. Request a new link.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <GlitchLogo size="md" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
          Set a New Password
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
