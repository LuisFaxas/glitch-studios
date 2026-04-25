import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AuthFormCard } from "@/components/auth/auth-form-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ResendVerificationButton } from "./resend-verification-button"

type State = "pending" | "success" | "expired"

interface PageProps {
  searchParams: Promise<{ token?: string; status?: string; error?: string }>
}

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center h-9 px-2.5 rounded-lg bg-[var(--foreground)] text-black font-sans text-sm font-medium"

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
      <AuthFormCard
        heading="Email verified"
        subhead="Your email is verified. You can now sign in."
        footer={
          <p>
            <Link href="/login" className="underline">
              Back to sign in
            </Link>
          </p>
        }
      >
        <Link href="/" className={PRIMARY_LINK_CLASS}>
          Continue to dashboard
        </Link>
      </AuthFormCard>
    )
  }

  if (state === "expired") {
    return (
      <AuthFormCard heading="Link expired">
        <Alert variant="destructive">
          <AlertDescription className="text-[16px] leading-[1.5] font-sans">
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
      </AuthFormCard>
    )
  }

  return (
    <AuthFormCard heading="Check your inbox">
      <p className="text-[16px] leading-[1.5] font-sans">
        We sent a verification link to{" "}
        <strong>{userEmail ?? "your email address"}</strong>. Click it to activate
        your account.
      </p>
      {userEmail && <ResendVerificationButton email={userEmail} />}
    </AuthFormCard>
  )
}
