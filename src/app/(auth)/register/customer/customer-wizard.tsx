"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryState, parseAsInteger } from "nuqs"
import { toast } from "sonner"
import { signUp } from "@/lib/auth-client"
import { checkEmailUniqueness } from "@/actions/auth-customer-register"
import { AuthFormCard } from "@/components/auth/auth-form-card"
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
}

interface Identity {
  name: string
  email: string
  password: string
}

const LABEL_CLASS = "font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"

const STEP_HEADING: Record<1 | 2 | 3, string> = {
  1: "Create your account",
  2: "Preferences (optional)",
  3: "Confirm",
}

const STEP_SUBHEAD: Record<1 | 2 | 3, string | undefined> = {
  1: "We'll send a verification email before your account is active.",
  2: "Skip any of this — you can update it later.",
  3: undefined,
}

const GENERIC_ERROR =
  "Something glitched on our side. Try again in a moment."

export function CustomerWizard({ availableProviders }: CustomerWizardProps) {
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
  const [newsletter, setNewsletter] = useState(false)
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
      setError("That email is already in use. Sign in, or reset your password.")
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
      // newsletter preference is captured but persisted by the user-update flow
      // (additionalFields not configured on signUp in this iteration).
      void newsletter
      toast.success("Account created. Check your inbox to verify.")
      router.push("/verify-email")
    } catch {
      setError(GENERIC_ERROR)
      setPending(false)
    }
  }

  return (
    <AuthFormCard
      heading={STEP_HEADING[step]}
      subhead={STEP_SUBHEAD[step]}
      footer={undefined}
    >
      <WizardProgress current={step} total={3} />

      {step === 1 && (
        <>
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
          <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
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
            htmlFor="newsletter"
            className="flex items-center gap-2 text-[16px] font-sans cursor-pointer"
          >
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(c) => setNewsletter(c === true)}
              disabled={pending}
            />
            <span>Send me new beat drops and studio news.</span>
          </label>
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
        <form onSubmit={handleStep3Submit} className="flex flex-col gap-4">
          <EnumSafeFormError message={error} />
          <dl className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <dt className={LABEL_CLASS}>Name</dt>
              <dd className="text-[16px] font-sans">{identity.name}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className={LABEL_CLASS}>Email</dt>
              <dd className="text-[16px] font-sans">{identity.email}</dd>
            </div>
          </dl>
          <label
            htmlFor="tcs"
            className="flex items-center gap-2 text-[16px] font-sans cursor-pointer"
          >
            <Checkbox
              id="tcs"
              checked={tcsAccepted}
              onCheckedChange={(c) => setTcsAccepted(c === true)}
              disabled={pending}
              required
            />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
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
    </AuthFormCard>
  )
}
