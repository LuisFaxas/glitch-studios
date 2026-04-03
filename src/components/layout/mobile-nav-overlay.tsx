"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { LogIn, LogOut, X } from "lucide-react"
import clsx from "clsx"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { signOut, useSession } from "@/lib/auth-client"
import { mobileMenuItems } from "@/components/layout/public-nav-config"
import {
  InstagramIcon,
  SoundCloudIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/social-icons"

interface MobileNavOverlayProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/glitchstudios",
    icon: InstagramIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@glitchstudios",
    icon: YouTubeIcon,
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/glitchstudios",
    icon: SoundCloudIcon,
  },
  {
    label: "X",
    href: "https://x.com/glitchstudios",
    icon: XIcon,
  },
] as const

const compactTileClass =
  "border-[#2a2a2a] bg-[#111111] shadow-[0_0_24px_rgba(255,255,255,0.04)]"

const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const

const ROW_STAGGER = [
  { delay: 0, y: -8 },     // Logo
  { delay: 0.08, y: 12 },  // Nav row
  { delay: 0.16, y: 12 },  // Widget row (Studio Status + Social)
  { delay: 0.24, y: 12 },  // Auth row (Sign In + Close)
] as const

export function MobileNavOverlay({
  isOpen,
  onClose,
  triggerRef,
}: MobileNavOverlayProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousPathnameRef = useRef(pathname)
  const wasOpenRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()
  const dragY = useMotionValue(0)
  const overlayOpacity = useTransform(dragY, [0, 300], [1, 0])

  const handleDeferredClose = useCallback(() => {
    window.setTimeout(() => {
      onClose()
    }, 0)
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!overlayRef.current) return

      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== "Tab") return

      const focusable = getFocusableElements(overlayRef.current)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    const frame = requestAnimationFrame(() => {
      focusInitialMenuElement(overlayRef.current)
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus()
    }

    wasOpenRef.current = isOpen
  }, [isOpen, triggerRef])

  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      previousPathnameRef.current = pathname
      if (isOpen) onClose()
      return
    }

    previousPathnameRef.current = pathname
  }, [pathname, isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.16 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          dragSnapToOrigin
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 && info.velocity.y > 300) {
              onClose()
            }
          }}
          style={{ y: dragY, opacity: overlayOpacity, touchAction: "none" }}
          className="fixed inset-0 z-[60] h-[100dvh] overflow-hidden bg-[#000000] md:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,245,240,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_45%)]"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0.4 }}
          />

          <div
            ref={overlayRef}
            id="mobile-navigation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative flex h-[100dvh] flex-col overflow-hidden px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]"
          >
            <motion.div
              className="pointer-events-none absolute inset-0 z-[1] animate-glitch-hover opacity-20"
              initial={{ opacity: 0.28 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.24, delay: 0.08 }}
              aria-hidden="true"
            />

            <div className="relative z-[2] grid h-full min-h-0 grid-rows-[auto_1fr] gap-2">
              {/* Row 0: Logo */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: ROW_STAGGER[0].y }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.2,
                  delay: shouldReduceMotion ? 0 : ROW_STAGGER[0].delay,
                  ease: EASE_OUT_CUBIC,
                }}
              >
                <LogoTile
                  onClick={handleDeferredClose}
                  className="w-full justify-center px-0 py-0"
                  logoClassName="w-[clamp(220px,72vw,320px)] max-w-full"
                />
              </motion.div>

              <div className="grid grid-cols-12 grid-rows-[auto_auto_auto] place-content-center gap-2">
                {/* Row 1: Nav tiles */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: ROW_STAGGER[1].y }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    delay: shouldReduceMotion ? 0 : ROW_STAGGER[1].delay,
                    ease: EASE_OUT_CUBIC,
                    }}
                  className="col-span-12"
                >
                  <nav aria-label="Main navigation" className="grid grid-cols-12 gap-2">
                    {mobileMenuItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/")

                      const span =
                        item.href === "/book"
                          ? "col-span-5"
                          : item.href === "/artists"
                            ? "col-span-4"
                            : "col-span-3"

                      return (
                        <Tile
                          key={item.href}
                          size="wide"
                          density="compact"
                          label={item.label}
                          icon={<item.icon className="h-4 w-4" />}
                          isActive={isActive}
                          href={item.href}
                          onClick={handleDeferredClose}
                          layout="horizontal"
                          className={clsx(
                            compactTileClass,
                            span,
                            "h-14 items-center gap-2.5 !px-3",
                            item.href === "/book" && "border-[#444444]",
                          )}
                        />
                      )
                    })}
                  </nav>
                </motion.div>

                {/* Row 2: Widgets (Studio Status + Social) */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: ROW_STAGGER[2].y }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    delay: shouldReduceMotion ? 0 : ROW_STAGGER[2].delay,
                    ease: EASE_OUT_CUBIC,
                    }}
                  className="col-span-12 grid grid-cols-12 gap-2"
                >
                  <CompactStudioStatus className="col-span-5 h-14" />
                  <CompactSocialTile className="col-span-7 h-14" />
                </motion.div>

                {/* Row 3: Auth + Close */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: ROW_STAGGER[3].y }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    delay: shouldReduceMotion ? 0 : ROW_STAGGER[3].delay,
                    ease: EASE_OUT_CUBIC,
                    }}
                  className="col-span-12 grid grid-cols-12 gap-2"
                >
                  {session?.user ? (
                    <Tile
                      size="wide"
                      density="compact"
                      label="Sign Out"
                      icon={<LogOut className="h-4 w-4" />}
                      onClick={async () => {
                        await signOut()
                        onClose()
                        router.push("/")
                        router.refresh()
                      }}
                      layout="horizontal"
                      className={clsx(
                        compactTileClass,
                        "col-span-5 h-14 items-center gap-2 !px-3",
                      )}
                    />
                  ) : (
                    <Tile
                      size="wide"
                      density="compact"
                      label="Sign In"
                      icon={<LogIn className="h-4 w-4" />}
                      href="/login"
                      onClick={handleDeferredClose}
                      layout="horizontal"
                      className={clsx(
                        compactTileClass,
                        "col-span-5 h-14 items-center gap-2 !px-3",
                      )}
                    />
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                    className={clsx(
                      compactTileClass,
                      "col-span-3 col-start-10 flex h-14 flex-col items-center justify-center gap-1.5 border text-[#f5f5f0] outline-none transition-colors duration-200 hover:bg-[#1a1a1a] active:bg-[#0a0a0a] focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
                    )}
                  >
                    <X className="h-4.5 w-4.5" aria-hidden="true" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em]">
                      Close
                    </span>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CompactStudioStatus({ className }: { className?: string }) {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  const isWeekday = day >= 1 && day <= 5
  const isOpen = isWeekday && hour >= 10 && hour < 18

  return (
    <Tile
      size="wide"
      density="compact"
      className={clsx(
        compactTileClass,
        className,
        "justify-center gap-2 !px-3 !py-2.5",
      )}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#888888]">
        Studio
      </span>
      <div className="flex w-full items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: isOpen ? "#f5f5f0" : "#555555" }}
          aria-hidden="true"
        />
        <span className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-[#f5f5f0]">
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <span className="font-sans text-[11px] text-[#555555]">
        Studio status
      </span>
    </Tile>
  )
}

function CompactSocialTile({ className }: { className?: string }) {
  return (
    <Tile
      size="wide"
      density="compact"
      className={clsx(
        compactTileClass,
        className,
        "justify-center gap-2 !px-3 !py-2.5",
      )}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#888888]">
        Social
      </span>

      <div className="flex w-full items-center justify-between gap-1.5">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="flex h-8 w-8 items-center justify-center border border-transparent text-[#888888] outline-none transition-colors duration-200 hover:border-[#2a2a2a] hover:text-[#f5f5f0] focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
          >
            <link.icon
              className={
                link.label === "SoundCloud"
                  ? "h-5 w-5"
                  : "h-4 w-4"
              }
            />
          </a>
        ))}
      </div>
    </Tile>
  )
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function focusInitialMenuElement(container: HTMLElement | null) {
  if (!container) return

  const activeItem = container.querySelector<HTMLElement>('[aria-current="page"]')
  if (activeItem) {
    activeItem.focus()
    return
  }

  const firstNavItem = container.querySelector<HTMLElement>('nav a[href], nav button')
  firstNavItem?.focus()
}
