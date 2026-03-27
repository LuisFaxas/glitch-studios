"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, ChevronUp, ChevronDown, Pencil } from "lucide-react"
import type { HomepageSection } from "@/actions/admin-homepage"

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  featured_beats: "Featured Beats",
  services: "Services",
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  blog: "Blog",
}

const CONFIGURABLE_SECTIONS = new Set(["hero", "featured_beats", "portfolio"])

interface HomepageSectionTileProps {
  section: HomepageSection
  onToggleVisibility: (id: string, visible: boolean) => void
  onEdit: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function HomepageSectionTile({
  section,
  onToggleVisibility,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: HomepageSectionTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const label = SECTION_LABELS[section.sectionType] || section.sectionType
  const isConfigurable = CONFIGURABLE_SECTIONS.has(section.sectionType)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-[#111111] border border-[#222222] h-12 px-3"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab text-[#555555] hover:text-[#888888] touch-none"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${label}`}
      >
        <GripVertical size={16} />
      </button>

      {/* Section label */}
      <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f5f5f0] flex-1">
        {label}
      </span>

      {/* Keyboard reorder */}
      <button
        type="button"
        onClick={onMoveUp}
        disabled={isFirst}
        className="p-1 text-[#555555] hover:text-[#f5f5f0] disabled:opacity-20 disabled:cursor-default"
        aria-label={`Move ${label} up`}
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={isLast}
        className="p-1 text-[#555555] hover:text-[#f5f5f0] disabled:opacity-20 disabled:cursor-default"
        aria-label={`Move ${label} down`}
      >
        <ChevronDown size={14} />
      </button>

      {/* Visibility toggle */}
      <button
        type="button"
        onClick={() => onToggleVisibility(section.id, !section.isVisible)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          section.isVisible ? "bg-[#f5f5f0]" : "bg-[#333333]"
        }`}
        aria-label={`${section.isVisible ? "Hide" : "Show"} ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
            section.isVisible
              ? "translate-x-4 bg-[#000000]"
              : "translate-x-0 bg-[#888888]"
          }`}
        />
      </button>

      {/* Edit button (only for configurable sections) */}
      {isConfigurable && (
        <button
          type="button"
          onClick={() => onEdit(section.id)}
          className="p-1 text-[#555555] hover:text-[#f5f5f0]"
          aria-label={`Edit ${label}`}
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  )
}
