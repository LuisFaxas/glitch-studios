import Link from "next/link"
import { Globe, ExternalLink } from "lucide-react"
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
  { label: "Instagram", href: "https://instagram.com", icon: Globe },
  { label: "YouTube", href: "https://youtube.com", icon: ExternalLink },
  { label: "SoundCloud", href: "https://soundcloud.com", icon: Globe },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1: Logo + Tagline */}
          <div className="space-y-4">
            <GlitchLogo size="sm" animate={false} />
            <p className="text-sm text-gray-400">Music. Video. Vision.</p>
          </div>

          {/* Column 2: Nav Links + Social */}
          <div className="space-y-4">
            <nav className="flex flex-wrap gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
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
                  className="text-gray-400 transition-colors hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white">Stay in the loop</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 border-t border-gray-800 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; 2026 Glitch Studios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
