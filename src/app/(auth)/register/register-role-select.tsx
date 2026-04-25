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
  const isTech = brand === "tech"

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
            mobileTitle="I'M IN."
            badge="Member"
            subtitle="One account. Studio time, beats, receipts — all in one place."
            mobileTagline="«ONE ACCOUNT · STUDIO · BEATS · RECEIPTS»"
            mobileBenefits="BOOK ROOMS · STREAM DROPS · OWN MASTERS"
            bullets={[
              "Browse and license beats",
              "Book studio sessions",
              "Track orders and downloads",
            ]}
            accessLevel="01"
            serial="0001"
            ghostNumeral="01"
            mobileCta="PUNCH IN"
          />
          <RoleCard
            href="/register/artist"
            title={altLabel}
            mobileTitle="SHOW OFF."
            badge={isTech ? "Contributor" : "Artist"}
            subtitle={
              isTech
                ? "We publish what holds up. Bring receipts."
                : "We build the roster slowly. Bring your A material."
            }
            mobileTagline={
              isTech
                ? "«BENCHMARKS · TEARDOWNS · BYLINES»"
                : "«ROSTER · CATALOG · ROYALTIES»"
            }
            mobileBenefits={
              isTech
                ? "PUBLISH REVIEWS · SUBMIT DATA · BUILD A BYLINE"
                : "UPLOAD BEATS · GROW ROSTER · EARN LICENSES"
            }
            bullets={
              isTech
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
            accessLevel="02"
            serial="0002"
            ghostNumeral="02"
            mobileCta="AUDITION"
            colors="#fffbeb,#fcd34d,#f59e0b"
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
  mobileTitle: string
  badge: string
  subtitle: string
  mobileTagline: string
  mobileBenefits: string
  bullets: string[]
  accessLevel: string
  serial: string
  ghostNumeral: string
  mobileCta: string
  variant?: "default" | "blue" | "yellow" | "pink"
  colors?: string
}

function RoleCard({
  href,
  title,
  mobileTitle,
  badge,
  subtitle,
  mobileTagline,
  mobileBenefits,
  bullets,
  accessLevel,
  serial,
  ghostNumeral,
  mobileCta,
  variant = "default",
  colors,
}: RoleCardProps) {
  return (
    <PixelCard
      variant={variant}
      colors={colors}
      className="h-full overflow-hidden md:min-h-[380px]"
    >
      {/* Mobile — Backstage Lanyard */}
      <Link
        href={href}
        className="relative z-10 flex h-full min-h-0 flex-col p-5 md:hidden"
      >
        {/* Top row: ACCESS LVL chip + role badge */}
        <div className="flex items-start justify-between font-mono uppercase tracking-[0.22em] text-[10px] text-[#f5f5f0]/65">
          <span>ACCESS LVL ░ {accessLevel}</span>
          <span>{badge}</span>
        </div>

        {/* Ghost numeral behind everything */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[180px] font-extrabold leading-none text-[#f5f5f0] opacity-[0.05] -rotate-12 select-none"
        >
          {ghostNumeral}
        </span>

        {/* Center block — title + tagline + one-line benefits */}
        <div className="relative z-10 mt-auto flex flex-col gap-2">
          <h2 className="font-mono uppercase font-bold tracking-[0.02em] text-[34px] leading-[0.95] text-[#f5f5f0]">
            {mobileTitle}
          </h2>
          <p className="font-mono uppercase tracking-[0.06em] text-[11px] text-[#f5f5f0]/85">
            {mobileTagline}
          </p>
          <p className="font-mono uppercase tracking-[0.05em] text-[10.5px] leading-[1.55] text-[#f5f5f0]/55">
            {mobileBenefits}
          </p>
        </div>

        {/* Bottom row: serial + CTA */}
        <div className="relative z-10 mt-3 flex items-end justify-between border-t border-[#f5f5f0]/15 pt-3 font-mono uppercase tracking-[0.18em] text-[11px]">
          <span className="text-[#f5f5f0]/45">N° {serial}</span>
          <span className="font-bold text-[#f5f5f0]">{mobileCta} →</span>
        </div>
      </Link>

      {/* Desktop — keep existing composition */}
      <Link
        href={href}
        className="relative z-10 hidden h-full min-h-0 flex-col gap-5 p-8 md:flex"
      >
        <div className="flex flex-col gap-3">
          <span className="font-mono uppercase tracking-[0.18em] text-[16px] text-[var(--muted-foreground)]">
            {badge}
          </span>
          <h2 className="font-mono uppercase tracking-[0.05em] text-[28px] leading-[1.15] font-semibold text-[#f5f5f0]">
            {title}
          </h2>
          <p className="text-[14px] leading-[1.5] text-[var(--muted-foreground)] font-sans italic">
            {subtitle}
          </p>
        </div>

        <ul className="flex flex-col gap-4 text-[20px] font-sans text-[#f5f5f0]/90">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-4 bg-[#f5f5f0] shrink-0"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <span className="mt-auto font-mono uppercase tracking-[0.18em] text-[18px] font-semibold text-[#f5f5f0]">
          Continue →
        </span>
      </Link>
    </PixelCard>
  )
}
