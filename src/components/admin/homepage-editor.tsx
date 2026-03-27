"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { HomepageSectionTile } from "./homepage-section-tile"
import { MediaPickerDialog } from "./media-picker-dialog"
import type { HomepageSection } from "@/actions/admin-homepage"
import {
  updateSectionOrder,
  updateSectionVisibility,
  updateSectionConfig,
} from "@/actions/admin-homepage"

interface HomepageEditorProps {
  initialSections: HomepageSection[]
  availableBeats: { id: string; title: string }[]
  availablePortfolioItems: { id: string; title: string }[]
}

function parseConfig(section: HomepageSection) {
  try {
    return JSON.parse(section.config || "{}")
  } catch {
    return {}
  }
}

export function HomepageEditor({
  initialSections,
  availableBeats,
  availablePortfolioItems,
}: HomepageEditorProps) {
  const [sections, setSections] = useState(initialSections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mediaPicker, setMediaPicker] = useState(false)

  // Editing state for hero
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [heroCtaText, setHeroCtaText] = useState("")
  const [heroCtaLink, setHeroCtaLink] = useState("")
  const [heroBackgroundMediaUrl, setHeroBackgroundMediaUrl] = useState("")

  // Editing state for featured beats
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>([])

  // Editing state for portfolio
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(sections, oldIndex, newIndex)
      setSections(reordered)

      try {
        await updateSectionOrder(reordered.map((s) => s.id))
        toast.success("Section order updated")
      } catch {
        toast.error("Failed to update order")
        setSections(sections)
      }
    },
    [sections]
  )

  const handleMoveKeyboard = useCallback(
    async (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= sections.length) return

      const reordered = arrayMove(sections, index, newIndex)
      setSections(reordered)

      try {
        await updateSectionOrder(reordered.map((s) => s.id))
        toast.success("Section order updated")
      } catch {
        toast.error("Failed to update order")
        setSections(sections)
      }
    },
    [sections]
  )

  const handleToggleVisibility = useCallback(
    async (id: string, visible: boolean) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isVisible: visible } : s))
      )
      try {
        await updateSectionVisibility(id, visible)
        toast.success(visible ? "Section shown" : "Section hidden")
      } catch {
        toast.error("Failed to update visibility")
      }
    },
    []
  )

  const handleEdit = useCallback(
    (id: string) => {
      if (editingId === id) {
        setEditingId(null)
        return
      }
      const section = sections.find((s) => s.id === id)
      if (!section) return

      const config = parseConfig(section)
      setEditingId(id)

      if (section.sectionType === "hero") {
        setHeroTitle(config.title || "")
        setHeroSubtitle(config.subtitle || "")
        setHeroCtaText(config.ctaText || "")
        setHeroCtaLink(config.ctaLink || "")
        setHeroBackgroundMediaUrl(config.backgroundMediaUrl || "")
      } else if (section.sectionType === "featured_beats") {
        setSelectedBeatIds(config.beatIds || [])
      } else if (section.sectionType === "portfolio") {
        setSelectedPortfolioIds(config.portfolioItemIds || [])
      }
    },
    [editingId, sections]
  )

  const handleSaveHero = useCallback(async () => {
    if (!editingId) return
    const config = JSON.stringify({
      title: heroTitle,
      subtitle: heroSubtitle,
      ctaText: heroCtaText,
      ctaLink: heroCtaLink,
      backgroundMediaUrl: heroBackgroundMediaUrl || undefined,
    })
    try {
      await updateSectionConfig(editingId, config)
      setSections((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, config } : s))
      )
      toast.success("Hero section updated")
      setEditingId(null)
    } catch {
      toast.error("Failed to save hero config")
    }
  }, [editingId, heroTitle, heroSubtitle, heroCtaText, heroCtaLink, heroBackgroundMediaUrl])

  const handleSaveFeaturedBeats = useCallback(async () => {
    if (!editingId) return
    const config = JSON.stringify({ beatIds: selectedBeatIds })
    try {
      await updateSectionConfig(editingId, config)
      setSections((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, config } : s))
      )
      toast.success("Featured beats updated")
      setEditingId(null)
    } catch {
      toast.error("Failed to save featured beats")
    }
  }, [editingId, selectedBeatIds])

  const handleSavePortfolio = useCallback(async () => {
    if (!editingId) return
    const config = JSON.stringify({
      portfolioItemIds: selectedPortfolioIds.length > 0 ? selectedPortfolioIds : undefined,
    })
    try {
      await updateSectionConfig(editingId, config)
      setSections((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, config } : s))
      )
      toast.success("Portfolio section updated")
      setEditingId(null)
    } catch {
      toast.error("Failed to save portfolio config")
    }
  }, [editingId, selectedPortfolioIds])

  const toggleBeatId = (id: string) => {
    setSelectedBeatIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  const togglePortfolioId = (id: string) => {
    setSelectedPortfolioIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const editingSection = editingId
    ? sections.find((s) => s.id === editingId)
    : null

  return (
    <div className="space-y-4">
      <p className="text-[#888888] font-sans text-[13px]">
        Drag to reorder sections. Toggle visibility. Edit content.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {sections.map((section, i) => (
              <div key={section.id}>
                <HomepageSectionTile
                  section={section}
                  onToggleVisibility={handleToggleVisibility}
                  onEdit={handleEdit}
                  onMoveUp={() => handleMoveKeyboard(i, "up")}
                  onMoveDown={() => handleMoveKeyboard(i, "down")}
                  isFirst={i === 0}
                  isLast={i === sections.length - 1}
                />

                {/* Inline editor */}
                {editingId === section.id && (
                  <div className="bg-[#0a0a0a] border border-[#222222] border-t-0 p-4 space-y-4">
                    {section.sectionType === "hero" && (
                      <>
                        <div className="space-y-2">
                          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                            Title
                          </label>
                          <input
                            type="text"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                              CTA Text
                            </label>
                            <input
                              type="text"
                              value={heroCtaText}
                              onChange={(e) => setHeroCtaText(e.target.value)}
                              className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                              CTA Link
                            </label>
                            <input
                              type="text"
                              value={heroCtaLink}
                              onChange={(e) => setHeroCtaLink(e.target.value)}
                              className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                            Background Media
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={heroBackgroundMediaUrl}
                              onChange={(e) =>
                                setHeroBackgroundMediaUrl(e.target.value)
                              }
                              placeholder="URL or pick from media library"
                              className="flex-1 bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
                            />
                            <button
                              type="button"
                              onClick={() => setMediaPicker(true)}
                              className="bg-[#222222] text-[#888888] font-mono text-[11px] uppercase px-4 py-2 hover:text-[#f5f5f0]"
                            >
                              Browse
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveHero}
                            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    )}

                    {section.sectionType === "featured_beats" && (
                      <>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                          Select featured beats
                        </p>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {availableBeats.length === 0 ? (
                            <p className="text-[#555555] font-sans text-[13px] py-4">
                              No published beats available.
                            </p>
                          ) : (
                            availableBeats.map((beat) => (
                              <label
                                key={beat.id}
                                className="flex items-center gap-3 px-3 py-2 bg-[#111111] border border-[#222222] cursor-pointer hover:border-[#444444]"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedBeatIds.includes(beat.id)}
                                  onChange={() => toggleBeatId(beat.id)}
                                  className="accent-[#f5f5f0]"
                                />
                                <span className="font-sans text-[13px] text-[#f5f5f0]">
                                  {beat.title}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveFeaturedBeats}
                            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    )}

                    {section.sectionType === "portfolio" && (
                      <>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">
                          Select portfolio items (leave empty to show all)
                        </p>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {availablePortfolioItems.length === 0 ? (
                            <p className="text-[#555555] font-sans text-[13px] py-4">
                              No active portfolio items available.
                            </p>
                          ) : (
                            availablePortfolioItems.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 bg-[#111111] border border-[#222222] cursor-pointer hover:border-[#444444]"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPortfolioIds.includes(
                                    item.id
                                  )}
                                  onChange={() => togglePortfolioId(item.id)}
                                  className="accent-[#f5f5f0]"
                                />
                                <span className="font-sans text-[13px] text-[#f5f5f0]">
                                  {item.title}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSavePortfolio}
                            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    )}

                    {!["hero", "featured_beats", "portfolio"].includes(
                      section.sectionType
                    ) && (
                      <p className="text-[#555555] font-sans text-[13px]">
                        This section renders automatically from your content.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <MediaPickerDialog
        open={mediaPicker}
        onClose={() => setMediaPicker(false)}
        onSelect={({ url }) => {
          setHeroBackgroundMediaUrl(url)
          setMediaPicker(false)
        }}
        typeFilter="image"
      />
    </div>
  )
}
