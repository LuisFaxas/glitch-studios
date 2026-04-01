"use client"

import { useEffect, useCallback, useRef, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  Music,
  Wrench,
  Image,
  User,
  FileText,
  Mail,
  LogIn,
  LogOut,
  X,
} from "lucide-react"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { WidgetNowPlaying } from "@/components/tiles/widget-now-playing"
import { WidgetStudioStatus } from "@/components/tiles/widget-studio-status"
import { WidgetSocial } from "@/components/tiles/widget-social"
import { signOut, useSession } from "@/lib/auth-client"

interface MobileNavOverlayProps {
  isOpen: boolean
  onClose: () => void
  /** Server-rendered WidgetLatestPost slot (async server component) */
  latestPostSlot?: ReactNode
}

const navItems = [
  { label: "Beats", href: "/beats", icon: Music, size: "wide" as const },
  { label: "Services", href: "/services", icon: Wrench, size: "wide" as const },
  { label: "Portfolio", href: "/portfolio", icon: Image, size: "wide" as const },
  { label: "Artists", href: "/artists", icon: User, size: "medium" as const },
  { label: "Blog", href: "/blog", icon: FileText, size: "small" as const },
  { label: "Contact", href: "/contact", icon: Mail, size: "small" as const },
] as const

export function MobileNavOverlay({ isOpen, onClose, latestPostSlot }: MobileNavOverlayProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      // Prevent body scroll when overlay is open
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        document.body.style.overflow = ""
      }
    }
  }, [isOpen, handleKeyDown])

  // Focus trap: trap Tab/Shift+Tab within overlay
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return
    const overlay = overlayRef.current
    const focusable = overlay.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first.focus()

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    overlay.addEventListener("keydown", handleTab)
    return () => overlay.removeEventListener("keydown", handleTab)
  }, [isOpen])

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  const handleNavClick = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex flex-col bg-[#000000] overflow-y-auto md:hidden"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
        >
          {/* Glitch entrance overlay (visible briefly on open) — z-[1] so content renders on top */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] animate-glitch-hover"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            aria-hidden="true"
          />

          {/* Close button */}
          <div className="relative z-[2] flex justify-end p-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-12 w-12 items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2 active:bg-[#0a0a0a]"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content area — z-[2] to sit above glitch entrance overlay */}
          <div className="relative z-[2] flex-1 p-4">
            {/* Logo tile */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="col-span-2">
                <LogoTile />
              </div>
            </div>

            {/* Navigation tiles */}
            <nav aria-label="Main navigation">
              <div className="grid grid-cols-2 gap-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  return (
                    <Tile
                      key={item.href}
                      size={item.size}
                      label={item.label}
                      icon={<item.icon className="h-5 w-5" />}
                      isActive={isActive}
                      onClick={() => handleNavClick(item.href)}
                      layout="horizontal"
                    />
                  )
                })}
              </div>
            </nav>

            {/* Separator */}
            <div className="border-t border-[#222222] my-4" />

            {/* Widgets section */}
            <div className="grid grid-cols-2 gap-1">
              <WidgetNowPlaying />
              <WidgetStudioStatus />
              {latestPostSlot}
              <WidgetSocial />
            </div>

            {/* Separator */}
            <div className="border-t border-[#222222] my-4" />

            {/* Auth section */}
            <div>
              {session?.user ? (
                <Tile
                  size="wide"
                  label="Sign Out"
                  icon={<LogOut className="h-5 w-5" />}
                  onClick={async () => {
                    await signOut()
                    onClose()
                    router.push("/")
                    router.refresh()
                  }}
                  layout="horizontal"
                />
              ) : (
                <Tile
                  size="wide"
                  label="Sign In"
                  icon={<LogIn className="h-5 w-5" />}
                  onClick={() => handleNavClick("/login")}
                  layout="horizontal"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
