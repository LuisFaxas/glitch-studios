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
  href: string
  Icon: ComponentType<{ className?: string }>
}
