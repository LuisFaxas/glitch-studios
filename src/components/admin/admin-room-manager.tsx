"use client"

import { useState, useTransition } from "react"
import { createRoom, updateRoom, deleteRoom } from "@/app/admin/rooms/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { RoomInfo } from "@/types/booking"

interface RoomRow {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[] | null
  hourlyRateOverride: string | null
  bufferMinutes: number | null
  isActive: boolean | null
  sortOrder: number | null
  createdAt: Date
  updatedAt: Date
}

export function AdminRoomManager({ rooms }: { rooms: RoomRow[] }) {
  const [editRoom, setEditRoom] = useState<RoomRow | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditRoom(null)
    setIsOpen(true)
  }

  function openEdit(room: RoomRow) {
    setEditRoom(room)
    setIsOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editRoom) {
          await updateRoom(editRoom.id, formData)
          toast.success("Room updated")
        } else {
          await createRoom(formData)
          toast.success("Room created")
        }
        setIsOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save room")
      }
    })
  }

  function handleDelete() {
    if (!editRoom) return
    if (!confirm("Delete this room? This cannot be undone.")) return
    startTransition(async () => {
      try {
        await deleteRoom(editRoom.id)
        toast.success("Room deleted")
        setIsOpen(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete room"
        )
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Rooms
        </h1>
        <button
          onClick={openCreate}
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2"
        >
          + Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-[#888] font-mono text-sm">
          No rooms configured. Add your first room to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => openEdit(room)}
              className="text-left border border-[#222] bg-[#111] p-4 hover:border-[#444] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-[15px] text-[#f5f5f0]">
                  {room.name}
                </span>
                <span
                  className={`font-mono text-[13px] uppercase px-2 py-0.5 ${
                    room.isActive
                      ? "bg-[#222] text-[#f5f5f0]"
                      : "bg-[#222] text-[#555]"
                  }`}
                >
                  {room.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {room.description && (
                <p className="text-[#888] text-sm line-clamp-2">
                  {room.description}
                </p>
              )}
              {room.features && room.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[11px] font-mono text-[#666] border border-[#333] px-1.5 py-0.5"
                    >
                      {f}
                    </span>
                  ))}
                  {room.features.length > 3 && (
                    <span className="text-[11px] font-mono text-[#555]">
                      +{room.features.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#000] border border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold text-[20px] uppercase text-[#f5f5f0]">
              {editRoom ? "Edit Room" : "Add Room"}
            </DialogTitle>
            <DialogDescription className="text-[#888] text-sm">
              {editRoom
                ? "Update room details below."
                : "Configure a new studio room."}
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            room={editRoom}
            onSubmit={handleSubmit}
            onDelete={editRoom ? handleDelete : undefined}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RoomForm({
  room,
  onSubmit,
  onDelete,
  isPending,
}: {
  room: RoomRow | null
  onSubmit: (formData: FormData) => void
  onDelete?: () => void
  isPending: boolean
}) {
  const [isActive, setIsActive] = useState(room?.isActive ?? true)

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Room Name *
        </Label>
        <input
          name="name"
          required
          defaultValue={room?.name ?? ""}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          placeholder="Studio A"
        />
      </div>

      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Description
        </Label>
        <textarea
          name="description"
          defaultValue={room?.description ?? ""}
          rows={3}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none resize-none"
          placeholder="Main recording room with vocal booth"
        />
      </div>

      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Features (comma-separated)
        </Label>
        <input
          name="features"
          defaultValue={room?.features?.join(", ") ?? ""}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          placeholder="Vocal booth, SSL console, Neumann U87"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Hourly Rate Override
          </Label>
          <input
            name="hourlyRateOverride"
            type="number"
            step="0.01"
            min="0"
            defaultValue={room?.hourlyRateOverride ?? ""}
            className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
            placeholder="75.00"
          />
        </div>

        <div>
          <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Buffer Time (min)
          </Label>
          <input
            name="bufferMinutes"
            type="number"
            min="0"
            defaultValue={room?.bufferMinutes ?? 15}
            className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          id="room-active"
        />
        <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
        <Label htmlFor="room-active" className="font-mono text-[13px] text-[#f5f5f0]">
          {isActive ? "Active" : "Inactive"}
        </Label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Room"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="text-[#dc2626] font-mono font-bold text-sm uppercase px-4 py-2 border border-[#dc2626] disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
