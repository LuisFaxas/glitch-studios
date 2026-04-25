"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryState, parseAsInteger } from "nuqs"
import { toast } from "sonner"
import { signUp } from "@/lib/auth-client"
import { checkEmailUniqueness } from "@/actions/auth-customer-register"
import { AuthSplitFrame } from "@/components/auth/auth-split-frame"
import { WizardProgress } from "@/components/auth/wizard-progress"
import { PasswordField } from "@/components/auth/password-field"
import {
  SocialAuthRow,
  type SocialProvider,
} from "@/components/auth/social-auth-row"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface CustomerWizardProps {
  availableProviders: SocialProvider[]
  stats: { value: string; label: string }[]
}

interface Identity {
  name: string
  email: string
  password: string
}

const LABEL_CLASS =
  "font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"

const STEP_HEADING: Record<1 | 2 | 3, string> = {
  1: "Create your account",
  2: "Set your preferences",
  3: "You're one click away",
}

const STEP_SUBHEAD: Record<1 | 2 | 3, string> = {
  1: "We'll send a verification email before your account is active.",
  2: "Pick what we send. You can change this anytime in settings.",
  3: "Confirm and we'll spin up your account.",
}

const HIGHLIGHT: Record<
  1 | 2 | 3,
  {
    eyebrow: string
    title: string
    points: { label: string; description: string }[]
  }
> = {
  1: {
    eyebrow: "Member benefits",
    title: "What you get with a Glitch account",
    points: [
      {
        label: "License the catalog",
        description:
          "Browse, preview, and license beats in any tier — MP3 lease through exclusive.",
      },
      {
        label: "Book studio time",
        description:
          "Reserve sessions, mixing, mastering, or video at the rooms that fit.",
      },
      {
        label: "One place for everything",
        description:
          "Receipts, downloads, license PDFs, booking history — all under one login.",
      },
    ],
  },
  2: {
    eyebrow: "Stay in the loop",
    title: "Newsletter — but actually worth opening",
    points: [
      {
        label: "New beat drops",
        description: "First look at fresh catalog entries before they go public.",
      },
      {
        label: "Studio specials",
        description: "Session-block discounts and seasonal mixing/mastering deals.",
      },
      {
        label: "No spam, no rentals",
        description:
          "We email weekly at most, never share your address, unsubscribe one click.",
      },
    ],
  },
  3: {
    eyebrow: "Final step",
    title: "What happens next",
    points: [
      {
        label: "Verify your email",
        description:
          "We'll send a verification link the second you click Create account.",
      },
      {
        label: "Pick up where you left off",
        description:
          "Cart, saved beats, and recent activity follow you in once verified.",
      },
      {
        label: "Cancel anytime",
        description:
          "Delete your account from the dashboard whenever — no clawback.",
      },
    ],
  },
}

const GENERIC_ERROR =
  "Something glitched on our side. Try again in a moment."

export function CustomerWizard({ availableProviders, stats }: CustomerWizardProps) {
  const router = useRouter()
  const [stepRaw, setStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  )
  const step: 1 | 2 | 3 = stepRaw === 2 ? 2 : stepRaw === 3 ? 3 : 1

  const [identity, setIdentity] = useState<Identity | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [beatDrops, setBeatDrops] = useState(false)
  const [studioNews, setStudioNews] = useState(false)
  const [tcsAccepted, setTcsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (step >= 2 && !identity) {
      setStep(1)
    }
  }, [step, identity, setStep])

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(
        "Use at least 8 characters with a mix of letters, numbers, and symbols.",
      )
      return
    }

    setPending(true)
    const result = await checkEmailUniqueness({ email })
    setPending(false)
    if (result.taken) {
      setError(
        "That email is already in use. Sign in, or reset your password.",
      )
      return
    }
    setIdentity({ name, email, password })
    setStep(2)
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity) {
      setStep(1)
      return
    }
    setError(null)
    setPending(true)
    try {
      const result = await signUp.email({
        name: identity.name,
        email: identity.email,
        password: identity.password,
      })
      if (result && "error" in result && result.error) {
        setError(GENERIC_ERROR)
        setPending(false)
        return
      }
      void beatDrops
      void studioNews
      toast.success("Account created. Check your inbox to verify.")
      router.push("/verify-email")
    } catch {
      setError(GENERIC_ERROR)
      setPending(false)
    }
  }

  const highlight = HIGHLIGHT[step]

  return (
    <AuthSplitFrame
      wordmark="Join the studio"
      eyebrow={highlight.eyebrow}
      highlight={{ title: highlight.title, points: highlight.points }}
      stats={stats}
    >
      <div className="flex flex-col gap-6">
        <WizardProgress current={step} total={3} />

        <header className="flex flex-col gap-2">
          <h1 className="font-mono text-[22px] uppercase leading-[1.15] tracking-[0.04em] font-semibold text-[#f5f5f0]">
            {STEP_HEADING[step]}
          </h1>
          <p className="font-sans text-[15px] leading-[1.5] text-[var(--muted-foreground)]">
            {STEP_SUBHEAD[step]}
          </p>
        </header>

        {step === 1 && (
          <>
            <SocialAuthRow
              availableProviders={availableProviders}
              callbackURL="/"
            />
            {availableProviders.length > 0 && (
              <div className="flex items-center gap-3 my-2">
                <Separator className="flex-1" />
                <span className="font-mono uppercase tracking-[0.08em] text-[12px] text-[var(--muted-foreground)]">
                  or continue with email
                </span>
                <Separator className="flex-1" />
              </div>
            )}
            <form
              onSubmit={handleStep1Submit}
              className="flex flex-col gap-4"
            >
              <EnumSafeFormError message={error} />
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className={LABEL_CLASS}>
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className={LABEL_CLASS}>
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
                {pending ? "Checking..." : "Continue"}
              </Button>
            </form>
          </>
        )}

        {step === 2 && identity && (
          <div className="flex flex-col gap-4">
            <label
              htmlFor="beatDrops"
              className="flex items-start gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] p-4 text-[15px] font-sans cursor-pointer hover:border-[#333]"
            >
              <Checkbox
                id="beatDrops"
                checked={beatDrops}
                onCheckedChange={(c) => setBeatDrops(c === true)}
                disabled={pending}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-1">
                <span className="text-[#f5f5f0]">New beat drops</span>
                <span className="text-[13px] text-[var(--muted-foreground)]">
                  First look at fresh catalog entries before they go public.
                </span>
              </span>
            </label>

            <label
              htmlFor="studioNews"
              className="flex items-start gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] p-4 text-[15px] font-sans cursor-pointer hover:border-[#333]"
            >
              <Checkbox
                id="studioNews"
                checked={studioNews}
                onCheckedChange={(c) => setStudioNews(c === true)}
                disabled={pending}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-1">
                <span className="text-[#f5f5f0]">Studio news & specials</span>
                <span className="text-[13px] text-[var(--muted-foreground)]">
                  Session-block discounts, mixing/mastering deals, studio updates.
                </span>
              </span>
            </label>

            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              Weekly at most · Unsubscribe one click
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={pending}
              >
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => setStep(3)}
                disabled={pending}
                className="bg-[var(--foreground)] text-black font-sans"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && identity && (
          <form onSubmit={handleStep3Submit} className="flex flex-col gap-5">
            <EnumSafeFormError message={error} />
            <dl className="flex flex-col gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] p-4">
              <div className="flex flex-col gap-1">
                <dt className={LABEL_CLASS}>Name</dt>
                <dd className="text-[16px] font-sans text-[#f5f5f0]">
                  {identity.name}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className={LABEL_CLASS}>Email</dt>
                <dd className="text-[16px] font-sans text-[#f5f5f0]">
                  {identity.email}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className={LABEL_CLASS}>Newsletter</dt>
                <dd className="text-[14px] font-sans text-[var(--muted-foreground)]">
                  {beatDrops && studioNews
                    ? "Beat drops + studio news"
                    : beatDrops
                      ? "Beat drops"
                      : studioNews
                        ? "Studio news"
                        : "Skipped"}
                </dd>
              </div>
            </dl>
            <label
              htmlFor="tcs"
              className="flex items-start gap-3 text-[15px] font-sans cursor-pointer"
            >
              <Checkbox
                id="tcs"
                checked={tcsAccepted}
                onCheckedChange={(c) => setTcsAccepted(c === true)}
                disabled={pending}
                required
                className="mt-0.5"
              />
              <span className="text-[#f5f5f0]">
                I agree to the Terms of Service and Privacy Policy.
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={() => setStep(2)}
                disabled={pending}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={pending || !tcsAccepted}
                className="bg-[var(--foreground)] text-black font-sans"
              >
                {pending ? "Creating..." : "Create account"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthSplitFrame>
  )
}
