"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import type { Brand } from "@/lib/brand"
import { TechPulseLine } from "@/components/home/tech-pulse-line"
import logoStyles from "@/components/tiles/logo-tile.module.css"

const PixelCard = dynamic(() => import("@/components/PixelCard"), {
  ssr: false,
})

interface RegisterRoleSelectProps {
  brand: Brand
}

export function RegisterRoleSelect({ brand }: RegisterRoleSelectProps) {
  const wordmark = brand === "tech" ? "Join GlitchTech" : "Join the studio"
  const altLabel = "Show off!"

  return (
    <>
      <div className="relative z-10 flex h-[calc(100dvh-3rem)] w-full flex-col gap-3 overflow-hidden md:h-auto md:gap-10">
        <div className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-2 md:max-w-[560px] md:gap-4">
          <Link
            href="/"
            aria-label="Glitch Studios — Home"
            className={`${logoStyles.glitchWrapper} block w-full`}
          >
            <div className={logoStyles.glitchImg} />
            <div className={logoStyles.glitchLayer1} aria-hidden="true" />
            <div className={logoStyles.glitchLayer2} aria-hidden="true" />
            <div className={logoStyles.beamLayer1} aria-hidden="true" />
            <div className={logoStyles.beamLayer2} aria-hidden="true" />
          </Link>

          <div className="flex w-full items-center gap-2 md:gap-4">
            <TechPulseLine delay={0} />
            <span
              className={`${logoStyles.glitchTextWrapper} font-mono text-[10px] md:text-base font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#f5f5f0] whitespace-nowrap`}
              aria-label={wordmark}
            >
              {wordmark}
              <span
                className={`${logoStyles.glitchTextLayer} ${logoStyles.glitchTextLayer1}`}
                aria-hidden="true"
              >
                {wordmark}
              </span>
              <span
                className={`${logoStyles.glitchTextLayer} ${logoStyles.glitchTextLayer2}`}
                aria-hidden="true"
              >
                {wordmark}
              </span>
            </span>
            <TechPulseLine delay={1} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 md:grid md:flex-none md:grid-cols-2 md:gap-8 [&>*]:min-h-0 [&>*]:flex-1 md:[&>*]:flex-none">
          <RoleCard
            href="/register/customer?step=1"
            title="I'm in!"
            badge="Member"
            subtitle="One account. Studio time, beats, receipts — all in one place."
            bullets={[
              "Browse and license beats",
              "Book studio sessions",
              "Track orders and downloads",
            ]}
          />
          <RoleCard
            href="/register/artist"
            title={altLabel}
            badge={brand === "tech" ? "Contributor" : "Artist"}
            subtitle={
              brand === "tech"
                ? "We publish what holds up. Bring receipts."
                : "We build the roster slowly. Bring your A material."
            }
            bullets={
              brand === "tech"
                ? [
                    "Publish reviews",
                    "Submit benchmark data",
                    "Build your contributor profile",
                  ]
                : [
                    "Upload beats",
                    "Grow a producer roster",
                    "Earn from licenses",
                  ]
            }
            variant="pink"
          />
        </div>

        <p className="text-center text-[14px] font-sans text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}

interface RoleCardProps {
  href: string
  title: string
  badge: string
  subtitle: string
  bullets: string[]
  variant?: "default" | "blue" | "yellow" | "pink"
}

function RoleCard({
  href,
  title,
  badge,
  subtitle,
  bullets,
  variant = "default",
}: RoleCardProps) {
  return (
    <PixelCard variant={variant} className="h-full overflow-hidden md:min-h-[380px]">
      <Link
        href={href}
        className="relative z-10 flex h-full min-h-0 flex-col gap-3 p-6 md:gap-5 md:p-8"
      >
        <div className="flex flex-col gap-1.5 md:gap-3">
          <span className="font-mono uppercase tracking-[0.14em] text-[13px] md:tracking-[0.18em] md:text-[16px] text-[var(--muted-foreground)]">
            {badge}
          </span>
          <h2 className="font-mono uppercase tracking-[0.04em] text-[24px] md:tracking-[0.05em] md:text-[28px] leading-[1.1] md:leading-[1.15] font-semibold text-[#f5f5f0]">
            {title}
          </h2>
          <p className="text-[14px] leading-[1.4] md:text-[14px] md:leading-[1.5] text-[var(--muted-foreground)] font-sans italic">
            {subtitle}
          </p>
        </div>

        <ul className="flex flex-col gap-2 md:gap-4 text-[15px] md:text-[20px] font-sans text-[#f5f5f0]/90">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 md:gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-3 md:h-1.5 md:w-4 bg-[#f5f5f0] shrink-0"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <span className="mt-auto font-mono uppercase tracking-[0.14em] text-[14px] md:tracking-[0.18em] md:text-[18px] font-semibold text-[#f5f5f0]">
          Continue →
        </span>
      </Link>
    </PixelCard>
  )
}
