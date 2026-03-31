import Link from "next/link"
import { Camera, Video, Headphones } from "lucide-react"
import styles from "@/components/tiles/logo-tile.module.css"
import { NewsletterForm } from "@/components/forms/newsletter-form"

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Artists", href: "/artists" },
  { label: "Blog", href: "/blog" },
]

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Camera },
  { label: "YouTube", href: "https://youtube.com", icon: Video },
  { label: "SoundCloud", href: "https://soundcloud.com", icon: Headphones },
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
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#555555] hover:text-[#f5f5f0] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Newsletter + copyright */}
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4 shrink-0">
            <NewsletterForm />
            <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333] whitespace-nowrap">
              &copy; 2026 Glitch Studios
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
