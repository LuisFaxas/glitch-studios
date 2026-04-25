"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { AuthFormCard } from "@/components/auth/auth-form-card"
import { PasswordField } from "@/components/auth/password-field"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function ExpiredView() {
  return (
    <AuthFormCard heading="Set a new password">
      <Alert variant="destructive">
        <AlertDescription className="text-[16px] leading-[1.5] font-sans">
          This reset link expired. Request a new one.
        </AlertDescription>
      </Alert>
      <Link
        href="/forgot-password"
        className="inline-flex items-center justify-center h-9 px-2.5 rounded-lg bg-[var(--foreground)] text-black font-sans text-sm font-medium"
      >
        Send a new link
      </Link>
    </AuthFormCard>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  if (!token || expired) {
    return <ExpiredView />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (newPassword.length < 8) {
      setError(
        "Use at least 8 characters with a mix of letters, numbers, and symbols.",
      )
      return
    }

    setPending(true)
    try {
      const result = await authClient.resetPassword({ newPassword, token })
      if (result && "error" in result && result.error) {
        setExpired(true)
        setPending(false)
        return
      }
      toast.success("Password updated. Sign in with your new password.")
      router.push("/login")
    } catch {
      setExpired(true)
      setPending(false)
    }
  }

  return (
    <AuthFormCard
      heading="Set a new password"
      subhead="Choose a new password for your account."
      footer={
        <p>
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <EnumSafeFormError message={error} />
        <PasswordField
          id="new-password"
          name="newPassword"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          required
          disabled={pending}
        />
        <PasswordField
          id="confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
          disabled={pending}
        />
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="bg-[var(--foreground)] text-black font-sans"
        >
          {pending ? "Setting..." : "Set new password"}
        </Button>
      </form>
    </AuthFormCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
