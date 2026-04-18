"use client"

import {
  useEffect,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { usePathname } from "next/navigation"
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import {
  Music,
  Wrench,
  Image,
  User,
  FileText,
  Mail,
  LogIn,
  X,
  type LucideIcon,
} from "lucide-react"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { WidgetNowPlaying } from "@/components/tiles/widget-now-playing"
import { WidgetStudioStatus } from "@/components/tiles/widget-studio-status"
import {
  InstagramIcon,
  YouTubeIcon,
  SoundCloudIcon,
  XIcon,
} from "@/components/icons/social-icons"
import { useSession } from "@/lib/auth-client"
import type { SocialLink } from "@/components/layout/nav-config-types"

interface MobileNavOverlayProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: RefObject<HTMLButtonElement | null>
  latestPostSlot?: ReactNode
  navItems: readonly { label: string; href: string; icon: LucideIcon }[]
  socialLinks: readonly SocialLink[]
}

export const defaultStudiosOverlayNavItems: readonly { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Beats", href: "/beats", icon: Music },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Portfolio", href: "/portfolio", icon: Image },
  { label: "Artists", href: "/artists", icon: User },
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Contact", href: "/contact", icon: Mail },
] as const

export const defaultStudiosOverlaySocialLinks: readonly SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/glitchstudios", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com/@glitchstudios", Icon: YouTubeIcon },
  { label: "SoundCloud", href: "https://soundcloud.com/glitchstudios", Icon: SoundCloudIcon },
  { label: "X", href: "https://x.com/glitchstudios", Icon: XIcon },
]

const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const

const ROW_STAGGER = [
  { delay: 0, y: -6 },
  { delay: 0.05, y: 10 },
  { delay: 0.10, y: 10 },
  { delay: 0.15, y: 10 },
  { delay: 0.20, y: 10 },
] as const

export function MobileNavOverlay({
  isOpen,
  onClose,
  triggerRef,
  latestPostSlot,
  navItems,
  socialLinks,
}: MobileNavOverlayProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousPathnameRef = useRef(pathname)
  const wasOpenRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()
  const dragY = useMotionValue(0)
  const panelOpacity = useTransform(dragY, [0, 400], [1, 0.2])

  // Reset drag position when menu opens
  useEffect(() => {
    if (isOpen) dragY.set(0)
  }, [isOpen, dragY])

  const handleDeferredClose = useCallback(() => {
    window.setTimeout(() => onClose(), 0)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return
    const overlay = overlayRef.current
    const focusable = overlay.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
    if (pathname !== previousPathnameRef.current) {
      previousPathnameRef.current = pathname
      if (isOpen) onClose()
    }
  }, [pathname, isOpen, onClose])

  // Return focus to trigger on close
  useEffect(() => {
    if (wasOpenRef.current && !isOpen && triggerRef?.current) {
      triggerRef.current.focus()
    }
    wasOpenRef.current = isOpen
  }, [isOpen, triggerRef])

  function stagger(index: number) {
    const row = ROW_STAGGER[index] ?? ROW_STAGGER[ROW_STAGGER.length - 1]
    return {
      initial: shouldReduceMotion
        ? false
        : ({ opacity: 0, y: row.y } as const),
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: shouldReduceMotion ? 0 : 0.18,
        delay: shouldReduceMotion ? 0 : row.delay,
        ease: EASE_OUT_CUBIC,
      },
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fixed backdrop — dims and blurs the page behind, doesn't move with drag */}
          <motion.div
            className="fixed inset-0 z-[59] bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Draggable menu panel */}
          <motion.div
            initial={{ opacity: 1, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              // Dismiss: long drag OR quick flick
              if (info.offset.y > 120 || info.velocity.y > 500) {
                onClose()
              } else {
                // Smooth spring back to origin
                animate(dragY, 0, {
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                })
              }
            }}
            style={{ y: dragY, opacity: panelOpacity, touchAction: "none" }}
            className="fixed inset-x-0 bottom-0 z-[60] flex flex-col justify-end md:hidden"
          >

          {/* Menu panel — bottom sheet */}
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative flex flex-col overflow-hidden bg-[#000000] px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
          >
            {/* Glitch flash on open */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-[1] animate-glitch-hover"
              initial={{ opacity: 0.28 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.24, delay: 0.08 }}
              aria-hidden="true"
            />

            {/* Radial glow */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-[0]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
              }}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />

            {/* Swipe hint — grab handle */}
            <div className="relative z-[2] flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-[#444444]" />
            </div>

            {/* Logo — centered, big */}
            <motion.div className="relative z-[2] flex justify-center py-2" {...stagger(0)}>
              <LogoTile
                onClick={handleDeferredClose}
                className="w-full justify-center px-0 py-1"
                logoClassName="w-[clamp(260px,80vw,360px)] max-w-full"
              />
            </motion.div>

            {/* Navigation — 2-col grid, 3 paired rows, BIG font */}
            <motion.nav
              aria-label="Main navigation"
              className="relative z-[2]"
              {...stagger(1)}
            >
              <div className="grid grid-cols-2 gap-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  return (
                    <Tile
                      key={item.href}
                      size="medium"
                      label={item.label}
                      icon={<item.icon className="h-5 w-5" />}
                      isActive={isActive}
                      href={item.href}
                      onClick={handleDeferredClose}
                      layout="horizontal"
                      className="!col-span-1 !px-3"
                    />
                  )
                })}
              </div>
            </motion.nav>

            {/* Now Playing — full width */}
            <motion.div className="relative z-[2] mt-1" {...stagger(2)}>
              <div className="grid grid-cols-2 gap-1">
                <WidgetNowPlaying />
              </div>
            </motion.div>

            {/* Studio Status — full width */}
            <motion.div className="relative z-[2] mt-1" {...stagger(3)}>
              <div className="grid grid-cols-2 gap-1">
                <WidgetStudioStatus />
              </div>
            </motion.div>

            {/* Social icons — single row, 4 across, full width */}
            <motion.div
              className="relative z-[2] mt-1 grid grid-cols-4 gap-1"
              {...stagger(3)}
            >
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex aspect-square items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] transition-colors hover:bg-[#1a1a1a] hover:border-[#444444] active:bg-[#0a0a0a]"
                >
                  <Icon className={label === "SoundCloud" ? "h-9 w-9" : "h-8 w-8"} />
                </a>
              ))}
            </motion.div>

            {/* Sign In/Out + Close — thumb zone */}
            <motion.div
              className="relative z-[2] mt-1 grid grid-cols-2 gap-1"
              {...stagger(4)}
            >
              {session?.user ? (
                <Tile
                  size="medium"
                  label="My Account"
                  icon={<User className="h-5 w-5" />}
                  href="/dashboard"
                  onClick={handleDeferredClose}
                  layout="horizontal"
                  className="!col-span-1 !px-3"
                />
              ) : (
                <Tile
                  size="medium"
                  label="Sign In"
                  icon={<LogIn className="h-5 w-5" />}
                  href="/login"
                  onClick={handleDeferredClose}
                  layout="horizontal"
                  className="!col-span-1 !px-3"
                />
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center gap-2 border border-[#222222] bg-[#111111] text-[#f5f5f0] outline-none transition-colors duration-200 hover:bg-[#1a1a1a] active:bg-[#0a0a0a] focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-xl font-bold uppercase tracking-[0.05em]">
                  Close
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
