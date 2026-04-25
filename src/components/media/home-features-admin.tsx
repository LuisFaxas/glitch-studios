"use client"

import { useState, useCallback, useTransition } from "react"
import Image from "next/image"
import { GripVertical, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
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
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  setHomeFeatures,
  pinToHomeFeatures,
  removeMediaItem,
} from "@/actions/admin-media-items"

export interface HomeFeatureRow {
  id: string
  externalId: string
  title: string | null
  thumbnailUrl: string | null
  sortOrder: number
}

export interface PinnableMediaRow {
  id: string
  externalId: string
  title: string | null
  thumbnailUrl: string | null
  attachedToType: string
}

interface HomeFeaturesAdminProps {
  initialFeatures: HomeFeatureRow[]
  pinnableSources: PinnableMediaRow[]
}

const HARD_CAP = 3

export function HomeFeaturesAdmin({
  initialFeatures,
  pinnableSources,
}: HomeFeaturesAdminProps) {
  const [features, setFeatures] = useState(initialFeatures)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = features.findIndex((s) => s.id === active.id)
      const newIndex = features.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(features, oldIndex, newIndex)
      setFeatures(reordered)
      try {
        await setHomeFeatures({ orderedIds: reordered.map((r) => r.id) })
        toast.success("Order updated.")
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
        setFeatures(features)
      }
    },
    [features],
  )

  const handlePin = (sourceId: string) => {
    startTransition(async () => {
      try {
        await pinToHomeFeatures({ sourceMediaItemId: sourceId })
        toast.success("Pinned to home.")
        setPickerOpen(false)
        if (typeof window !== "undefined") window.location.reload()
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
      }
    })
  }

  const handleRemoveConfirm = (id: string) => {
    startTransition(async () => {
      try {
        await removeMediaItem(id)
        setFeatures((prev) => prev.filter((f) => f.id !== id))
        toast.success("Unpinned.")
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
      } finally {
        setPendingRemoveId(null)
      }
    })
  }

  return (
    <section
      aria-labelledby="home-features-heading"
      className="space-y-4 border-t border-[#1a1a1a] pt-8"
    >
      <div className="flex items-center justify-between">
        <h3
          id="home-features-heading"
          className="font-mono text-lg font-bold uppercase text-[#f5f5f0]"
        >
          Home Features
        </h3>
        <Button
          type="button"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={pinnableSources.length === 0}
        >
          <Plus className="size-4 mr-1" aria-hidden="true" />
          Pin existing video
        </Button>
      </div>

      {features.length > HARD_CAP && (
        <p
          role="status"
          className="text-sm text-[#888] border border-[#222] bg-[#111] p-3"
        >
          Only the top 3 by sort order appear on the home page. Reorder or remove to change which are live.
        </p>
      )}

      {features.length === 0 ? (
        <p className="text-sm text-[#888]">
          No videos pinned to the home page yet. Attach videos to a beat, portfolio item, service, or review first — then pin them here.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={features.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {features.map((item, idx) => (
                <SortableHomeFeatureRow
                  key={item.id}
                  item={item}
                  isLive={idx < HARD_CAP}
                  onRemoveClick={() => setPendingRemoveId(item.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pin a video to home</DialogTitle>
            <DialogDescription className="text-[#888]">
              Pick from videos already attached to a beat, portfolio item, service, or review.
            </DialogDescription>
          </DialogHeader>

          {pinnableSources.length === 0 ? (
            <p className="text-sm text-[#888]">
              No source videos available. Attach videos to a beat, portfolio item, service, or review first — then pin them here.
            </p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {pinnableSources.map((src) => (
                <li
                  key={src.id}
                  className="flex items-center gap-3 border border-[#222] bg-[#111] p-2"
                >
                  <div className="relative h-[45px] w-[80px] flex-shrink-0 overflow-hidden bg-[#0a0a0a]">
                    <Image
                      src={
                        src.thumbnailUrl ??
                        `https://i.ytimg.com/vi/${src.externalId}/hqdefault.jpg`
                      }
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#f5f5f0]">
                      {src.title ?? "Untitled video"}
                    </p>
                    <span className="text-[11px] font-mono uppercase tracking-wide text-[#888]">
                      {src.attachedToType.replace("_", " ")}
                    </span>
                  </div>
                  <Button type="button" size="sm" onClick={() => handlePin(src.id)}>
                    Pin
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPickerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingRemoveId)}
        onOpenChange={(o) => {
          if (!o) setPendingRemoveId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this video?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be detached from this home feature. The video itself stays on YouTube.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingRemoveId && handleRemoveConfirm(pendingRemoveId)
              }
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

interface SortableHomeFeatureRowProps {
  item: HomeFeatureRow
  isLive: boolean
  onRemoveClick: () => void
}

function SortableHomeFeatureRow({
  item,
  isLive,
  onRemoveClick,
}: SortableHomeFeatureRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const titleForA11y = item.title ?? "video"
  const thumb =
    item.thumbnailUrl ?? `https://i.ytimg.com/vi/${item.externalId}/hqdefault.jpg`

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border border-[#222] bg-[#111] p-2"
    >
      <button
        type="button"
        aria-label={`Reorder ${titleForA11y}`}
        className="cursor-grab focus-visible:outline-2 focus-visible:outline-[#f5f5f0]/40 focus-visible:outline-offset-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4 text-[#888]" aria-hidden="true" />
      </button>

      <div className="relative h-[45px] w-[80px] flex-shrink-0 overflow-hidden bg-[#0a0a0a]">
        <Image src={thumb} alt="" fill sizes="80px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#f5f5f0]">{titleForA11y}</p>
        {isLive && (
          <span className="text-[11px] font-mono uppercase tracking-wide text-[#f5f5f0] bg-[#222] px-2 py-0.5 inline-block mt-1">
            Live on home
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemoveClick}
        aria-label={`Remove ${titleForA11y}`}
      >
        <Trash2 className="size-4 text-red-500" aria-hidden="true" />
      </Button>
    </li>
  )
}
