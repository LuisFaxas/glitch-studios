import Link from "next/link"
import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"
import { AuthFormCard } from "@/components/auth/auth-form-card"

const TILE_CLASS =
  "flex flex-col gap-2 p-6 rounded-md bg-[#111111] border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
const TILE_LABEL = "font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"
const TILE_DESC = "text-[16px] leading-[1.5] text-[var(--muted-foreground)] font-sans"

export default async function RegisterPage() {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))

  const heading = brand === "tech" ? "Join GlitchTech" : "Join the studio"

  const artistLabel =
    brand === "tech" ? "Request contributor access" : "Request artist access"
  const artistDesc =
    brand === "tech"
      ? "Publish reviews and benchmark data. Admin reviews every request."
      : "Upload beats, grow a roster, earn with Glitch. Admin reviews every request."

  return (
    <AuthFormCard
      heading={heading}
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/register/customer?step=1" className={TILE_CLASS}>
          <span className={TILE_LABEL}>Register as a customer</span>
          <span className={TILE_DESC}>
            Buy beats, book sessions, manage your account.
          </span>
        </Link>
        <Link href="/register/artist" className={TILE_CLASS}>
          <span className={TILE_LABEL}>{artistLabel}</span>
          <span className={TILE_DESC}>{artistDesc}</span>
        </Link>
      </div>
    </AuthFormCard>
  )
}
