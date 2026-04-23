import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  desktopSize: "wide" | "medium" | "small"
  mobileSpan: string
}

export interface MobileMenuItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface SocialLink {
  label: string
  /** Absolute URL. `null` marks a placeholder (e.g., account does not exist
   *  yet — render as a muted icon, no anchor, no click). See D-11 (Phase 16.1). */
  href: string | null
  Icon: ComponentType<{ className?: string }>
}
