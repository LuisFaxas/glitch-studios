"use client"

import { useState, useCallback, useTransition } from "react"
import Image from "next/image"
import { GripVertical, Trash2, Star, Plus } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AddVideoDialog } from "./add-video-dialog"
import {
  reorderMediaItems,
  removeMediaItem,
  setPrimaryMediaItem,
  type AttachType,
} from "@/actions/admin-media-items"

export interface MediaItemRow {
  id: string
  kind: string
  externalId: string
  title: string | null
  thumbnailUrl: string | null
  isPrimary: boolean
  sortOrder: number
}

interface MediaItemAttachmentListProps {
  attachedToType: AttachType
  attachedToId: string
  /** Singular noun used in the Remove confirmation body and primary tooltip
   *  ("It will be detached from this {entity}.") — e.g. "beat", "portfolio item", "service", "review". */
  entityNoun: string
  initialItems: MediaItemRow[]
}

export function MediaItemAttachmentList({
  attachedToType,
  attachedToId,
  entityNoun,
  initialItems,
}: MediaItemAttachmentListProps) {
  const [items, setItems] = useState(initialItems)
  const [addOpen, setAddOpen] = useState(false)
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
      const oldIndex = items.findIndex((s) => s.id === active.id)
      const newIndex = items.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)
      setItems(reordered)
      try {
        await reorderMediaItems({
          attachedToType,
          attachedToId,
          orderedIds: reordered.map((r) => r.id),
        })
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
        setItems(items)
      }
    },
    [items, attachedToType, attachedToId],
  )

  const handleRemoveConfirm = (id: string) => {
    startTransition(async () => {
      try {
        await removeMediaItem(id)
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.success("Video removed.")
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
      } finally {
        setPendingRemoveId(null)
      }
    })
  }

  const handleSetPrimary = (id: string) => {
    startTransition(async () => {
      try {
        await setPrimaryMediaItem({ id })
        setItems((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === id })))
        toast.success("Primary updated.")
      } catch {
        toast.error("Couldn't save. Try again or remove the link and re-paste it.")
      }
    })
  }

  return (
    <TooltipProvider>
      <section
        aria-labelledby="media-attachments-heading"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3
            id="media-attachments-heading"
            className="font-mono text-lg font-bold uppercase text-[#f5f5f0]"
          >
            Videos
          </h3>
          <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" aria-hidden="true" />
            Attach video
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-[#888]">
            No videos attached yet. Paste a YouTube URL to attach one.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {items.map((item) => (
                  <SortableMediaItemRow
                    key={item.id}
                    item={item}
                    entityNoun={entityNoun}
                    onRemoveClick={() => setPendingRemoveId(item.id)}
                    onSetPrimary={() => handleSetPrimary(item.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <AddVideoDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          attachedToType={attachedToType}
          attachedToId={attachedToId}
          onAttached={() => {
            if (typeof window !== "undefined") window.location.reload()
          }}
        />

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
                It will be detached from this {entityNoun}. The video itself stays on YouTube.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => pendingRemoveId && handleRemoveConfirm(pendingRemoveId)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remove video
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </TooltipProvider>
  )
}

interface SortableMediaItemRowProps {
  item: MediaItemRow
  entityNoun: string
  onRemoveClick: () => void
  onSetPrimary: () => void
}

function SortableMediaItemRow({
  item,
  entityNoun,
  onRemoveClick,
  onSetPrimary,
}: SortableMediaItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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
        <Image
          src={thumb}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#f5f5f0]">{titleForA11y}</p>
        {item.isPrimary && (
          <span className="text-[11px] font-mono uppercase tracking-wide text-[#888]">
            Primary
          </span>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSetPrimary}
            aria-label={`Set ${titleForA11y} as primary`}
            disabled={item.isPrimary}
          >
            <Star
              className={`size-4 ${item.isPrimary ? "fill-[#f5f5f0] text-[#f5f5f0]" : "text-[#888]"}`}
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Make this the main video for this {entityNoun}.
        </TooltipContent>
      </Tooltip>

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
