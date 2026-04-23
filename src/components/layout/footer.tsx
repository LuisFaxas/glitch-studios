import Link from "next/link"
import styles from "@/components/tiles/logo-tile.module.css"
import { NewsletterForm } from "@/components/forms/newsletter-form"
// D-11 (Phase 16.1): unified social config shared across widgets + footer +
// mobile overlay. No per-brand overrides — both brands point at the same
// handles. X renders muted (no account yet, no navigation).
import { socialLinks } from "@/components/icons/social-icons"

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Artists", href: "/artists" },
  { label: "Blog", href: "/blog" },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#222222] bg-[#0a0a0a]">
      {/* Single condensed row */}
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Left: Logo + tagline + nav */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="w-16">
              <div className={styles.glitchWrapper}>
                <div className={styles.glitchImg} />
                <div className={styles.glitchLayer1} aria-hidden="true" />
                <div className={styles.glitchLayer2} aria-hidden="true" />
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#555555]">
              Music. Video. Vision.
            </p>
            <nav className="flex flex-wrap items-center gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#555555] transition-colors hover:text-[#f5f5f0]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <span className="hidden text-[#333333] md:inline">|</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) =>
                social.href ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#555555] hover:text-[#f5f5f0] transition-colors"
                    aria-label={social.label}
                  >
                    <social.Icon className="size-3.5" />
                  </a>
                ) : (
                  <span
                    key={social.label}
                    className="text-[#333333]"
                    aria-label={`${social.label} — coming soon`}
                  >
                    <social.Icon className="size-3.5" />
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right: Newsletter */}
          <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555555]">
              Stay in the loop
            </p>
            <div className="w-full md:w-[280px]">
              <NewsletterForm compact />
            </div>
          </div>
        </div>

        {/* Copyright — own row below the main footer content */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
          <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333]">
            &copy; 2026 Glitch Studios
          </p>
        </div>
      </div>
    </footer>
  )
}
