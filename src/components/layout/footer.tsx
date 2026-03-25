import Link from "next/link"
import { Camera, Video, Headphones } from "lucide-react"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { NewsletterForm } from "@/components/forms/newsletter-form"

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Artists", href: "/artists" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Camera },
  { label: "YouTube", href: "https://youtube.com", icon: Video },
  { label: "SoundCloud", href: "https://soundcloud.com", icon: Headphones },
]

export function Footer() {
  return (
    <footer className="border-t border-[#222222] bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1: Logo + Tagline */}
          <div className="space-y-4">
            <GlitchLogo size="sm" animate={false} />
            <p className="font-mono text-xs uppercase tracking-[0.05em] text-[#888888]">Music. Video. Vision.</p>
          </div>

          {/* Column 2: Nav Links + Social */}
          <div className="space-y-4">
            <nav className="flex flex-wrap gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-[0.05em] text-[#888888] transition-colors hover:text-[#f5f5f0]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] transition-colors font-mono text-xs uppercase tracking-[0.05em]"
                >
                  <social.icon className="size-4" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-4">
            <p className="font-mono font-bold uppercase tracking-[0.05em] text-sm text-[#f5f5f0]">Stay in the loop</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 border-t border-[#222222] pt-6">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.05em] text-[#888888]">
            &copy; 2026 Glitch Studios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
