"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"

export type SocialProvider = "google" | "github" | "facebook"

interface SocialAuthRowProps {
  availableProviders: SocialProvider[]
  callbackURL?: string
}

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: "Continue with Google",
  facebook: "Continue with Meta",
  github: "Continue with GitHub",
}

export function SocialAuthRow({
  availableProviders,
  callbackURL = "/dashboard",
}: SocialAuthRowProps) {
  const [pending, setPending] = useState<SocialProvider | null>(null)

  if (availableProviders.length === 0) return null

  const handleClick = async (provider: SocialProvider) => {
    setPending(provider)
    try {
      await signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: `/login?social_error=1&attempted=${provider}`,
      })
    } catch {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {availableProviders.map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            size="lg"
            disabled={pending !== null}
            onClick={() => handleClick(p)}
            className="bg-[#111111] border-[var(--border)] text-[16px] font-sans"
          >
            <span className="font-sans">{PROVIDER_LABEL[p]}</span>
          </Button>
        ))}
      </div>
      <p className="text-[12px] leading-[1.5] text-[var(--muted-foreground)] font-sans">
        By continuing, you agree to the{" "}
        <a href="/terms" className="underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
