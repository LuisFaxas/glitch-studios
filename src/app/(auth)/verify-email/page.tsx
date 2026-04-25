import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AuthSplitFrame } from "@/components/auth/auth-split-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ResendVerificationButton } from "./resend-verification-button"

type State = "pending" | "success" | "expired"

interface PageProps {
  searchParams: Promise<{ token?: string; status?: string; error?: string }>
}

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[var(--foreground)] text-black font-sans text-[15px] font-semibold"

const HIGHLIGHT_PENDING = {
  eyebrow: "While you wait",
  title: "What's happening behind the scenes",
  points: [
    {
      label: "We just sent the link",
      description:
        "Should land within 60 seconds. Check spam if it's not in inbox by then.",
    },
    {
      label: "Click it from any device",
      description:
        "Same browser, phone, work laptop — doesn't matter where you click.",
    },
    {
      label: "One click and you're in",
      description:
        "After clicking, this page swaps to a confirmation and routes you home.",
    },
  ],
}

const HIGHLIGHT_SUCCESS = {
  eyebrow: "You're verified",
  title: "Welcome to Glitch",
  points: [
    {
      label: "Your account is live",
      description:
        "Beat licenses, bookings, downloads — all paths are open now.",
    },
    {
      label: "Cart and saved beats follow you in",
      description:
        "If you queued anything before signup, it's waiting on the home page.",
    },
    {
      label: "Sign-in is instant from now on",
      description:
        "Email + password or any social provider you connected at signup.",
    },
  ],
}

const HIGHLIGHT_EXPIRED = {
  eyebrow: "It happens",
  title: "Verification links don't last forever",
  points: [
    {
      label: "Link clicked twice or used elsewhere",
      description:
        "Tokens are single-use. If you clicked it on another device, you're already verified — just sign in.",
    },
    {
      label: "Link sat too long",
      description:
        "We expire links after a short window for security. Re-send below.",
    },
    {
      label: "Still stuck? Contact us",
      description:
        "We can manually verify accounts when something goes wrong.",
    },
  ],
}

function maskEmail(email: string | null): string {
  if (!email) return "your email address"
  const [local, domain] = email.split("@")
  if (!domain) return email
  const visible = local.slice(0, 2)
  const masked = "•".repeat(Math.max(local.length - 2, 1))
  return `${visible}${masked}@${domain}`
}

function TimelineDot({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
        filled ? "bg-[#f5f5f0]" : "border border-[#444] bg-transparent"
      }`}
    />
  )
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  let state: State = "pending"
  const userEmail: string | null = session?.user?.email ?? null

  if (params.token) {
    try {
      await auth.api.verifyEmail({ query: { token: params.token } })
      state = "success"
    } catch {
      state = "expired"
    }
  } else if (params.status === "success" || session?.user?.emailVerified) {
    state = "success"
  } else if (params.status === "expired" || params.error) {
    state = "expired"
  }

  if (state === "success") {
    return (
      <AuthSplitFrame
        wordmark="Welcome in!"
        eyebrow={HIGHLIGHT_SUCCESS.eyebrow}
        highlight={HIGHLIGHT_SUCCESS}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2a4a2a] bg-[#0e1e0e] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7ad17a]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7ad17a]" />
              Verified
            </span>
            <h1 className="font-mono text-[28px] uppercase leading-[1.1] tracking-[0.04em] font-semibold text-[#f5f5f0]">
              Email verified
            </h1>
            <p className="font-sans text-[15px] leading-[1.5] text-[var(--muted-foreground)]">
              Your account is active. Pick up where you left off — your cart,
              saved beats, and recent activity are waiting for you.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/" className={PRIMARY_LINK_CLASS}>
              Continue to home →
            </Link>
            <Link
              href="/beats"
              className="text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[#f5f5f0]"
            >
              Or browse the beat catalog
            </Link>
          </div>
        </div>
      </AuthSplitFrame>
    )
  }

  if (state === "expired") {
    return (
      <AuthSplitFrame
        wordmark="One more click"
        eyebrow={HIGHLIGHT_EXPIRED.eyebrow}
        highlight={HIGHLIGHT_EXPIRED}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#5a3030] bg-[#1e0e0e] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#e09898]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e09898]" />
              Expired
            </span>
            <h1 className="font-mono text-[28px] uppercase leading-[1.1] tracking-[0.04em] font-semibold text-[#f5f5f0]">
              Link expired
            </h1>
          </div>

          <Alert variant="destructive">
            <AlertDescription className="text-[15px] leading-[1.5] font-sans">
              This link expired or was already used. Send a new one and try again.
            </AlertDescription>
          </Alert>

          {userEmail ? (
            <ResendVerificationButton email={userEmail} />
          ) : (
            <Link href="/login" className={PRIMARY_LINK_CLASS}>
              Send a new link
            </Link>
          )}

          <Link
            href="/contact"
            className="text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[#f5f5f0]"
          >
            Need help? Contact us
          </Link>
        </div>
      </AuthSplitFrame>
    )
  }

  // PENDING
  return (
    <AuthSplitFrame
      wordmark="Almost there"
      eyebrow={HIGHLIGHT_PENDING.eyebrow}
      highlight={HIGHLIGHT_PENDING}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#444] bg-[#0a0a0a] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#f5f5f0]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5f5f0]" />
            Awaiting verification
          </span>
          <h1 className="font-mono text-[28px] uppercase leading-[1.1] tracking-[0.04em] font-semibold text-[#f5f5f0]">
            Check your inbox
          </h1>
          <p className="font-sans text-[15px] leading-[1.5] text-[var(--muted-foreground)]">
            We sent a verification link to:
          </p>
          <p className="rounded-lg border border-[#222] bg-[#0a0a0a] px-4 py-3 font-mono text-[15px] tracking-wide text-[#f5f5f0]">
            {maskEmail(userEmail)}
          </p>
        </div>

        {/* Mini timeline */}
        <ol className="flex flex-col gap-4 rounded-lg border border-[#222] bg-[#0a0a0a] p-5">
          <li className="flex gap-3">
            <TimelineDot filled />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#f5f5f0]">
                Sent
              </span>
              <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                Verification email is on its way.
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <TimelineDot filled={false} />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                You — click the link
              </span>
              <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                Tap it from any device. The page will redirect when it lands.
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <TimelineDot filled={false} />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Account active
              </span>
              <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                Cart, saved beats, and downloads — all unlocked.
              </span>
            </div>
          </li>
        </ol>

        <div className="flex flex-col gap-3">
          {userEmail && <ResendVerificationButton email={userEmail} />}
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Didn&apos;t arrive? Check spam, or resend after 60 seconds.
          </p>
        </div>
      </div>
    </AuthSplitFrame>
  )
}
