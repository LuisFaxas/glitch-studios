"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient, signIn } from "@/lib/auth-client"
import { AuthFormCard } from "@/components/auth/auth-form-card"
import {
  SocialAuthRow,
  type SocialProvider,
} from "@/components/auth/social-auth-row"
import { PasswordField } from "@/components/auth/password-field"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface LoginFormProps {
  availableProviders: SocialProvider[]
}

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Meta",
  github: "GitHub",
}

const GENERIC_BAD_CREDS =
  "That email and password don't match. Try again, or reset your password."

export function LoginForm({ availableProviders }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const urlError = searchParams.get("error")
  const socialError = searchParams.get("social_error")
  const attemptedRaw = searchParams.get("attempted")
  const attempted =
    attemptedRaw === "google" ||
    attemptedRaw === "facebook" ||
    attemptedRaw === "github"
      ? attemptedRaw
      : null
  const attemptedLabel = attempted
    ? PROVIDER_LABEL[attempted as SocialProvider]
    : "your social provider"

  const initialError =
    urlError === "account_not_linked"
      ? `An account with this email already exists with a different sign-in method. Sign in with that method, then link ${attemptedLabel} from settings.`
      : socialError === "1"
        ? "Social sign-in didn't complete. Try again, or use your email."
        : null

  const [error, setError] = useState<string | null>(initialError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const result = await signIn.email({ email, password })
      if (result && "error" in result && result.error) {
        setError(GENERIC_BAD_CREDS)
        setPending(false)
        return
      }
      const session = await authClient.getSession()
      const role = session.data?.user?.role
      router.push(role === "admin" || role === "owner" ? "/admin" : "/")
      router.refresh()
    } catch {
      setError(GENERIC_BAD_CREDS)
      setPending(false)
    }
  }

  return (
    <AuthFormCard
      heading="Welcome back"
      footer={
        <>
          <p>
            <Link href="/forgot-password" className="underline">
              Forgot your password?
            </Link>
          </p>
          <p>
            New here?{" "}
            <Link href="/register" className="underline">
              Create an account
            </Link>
          </p>
        </>
      }
    >
      <SocialAuthRow availableProviders={availableProviders} callbackURL="/" />

      {availableProviders.length > 0 && (
        <div className="flex items-center gap-3 my-2">
          <Separator className="flex-1" />
          <span className="font-mono uppercase tracking-[0.08em] text-[12px] text-[var(--muted-foreground)]">
            or continue with email
          </span>
          <Separator className="flex-1" />
        </div>
      )}

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

        <PasswordField
          id="password"
          name="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
          disabled={pending}
        />

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="bg-[var(--foreground)] text-black font-sans"
        >
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthFormCard>
  )
}
