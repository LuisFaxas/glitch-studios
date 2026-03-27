"use client"

import { useState, useEffect, useTransition } from "react"
import {
  getWeeklySchedule,
  upsertWeeklySchedule,
  getOverrides,
  createOverride,
  deleteOverride,
} from "@/app/admin/availability/actions"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
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

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const DEFAULT_SCHEDULE = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  startTime: i === 0 ? "" : i === 6 ? "10:00" : "09:00",
  endTime: i === 0 ? "" : i === 6 ? "18:00" : "21:00",
  isActive: i !== 0, // Sunday closed by default
}))

interface DaySchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface Override {
  id: string
  roomId: string
  date: string
  isClosed: boolean | null
  startTime: string | null
  endTime: string | null
  reason: string | null
}

export function AdminAvailabilityEditor({ rooms }: { rooms: RoomRow[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? "")
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedRoomId) return
    setIsLoading(true)
    Promise.all([
      getWeeklySchedule(selectedRoomId),
      getOverrides(selectedRoomId),
    ]).then(([weeklyData, overrideData]) => {
      if (weeklyData.length > 0) {
        setSchedule(
          DAY_NAMES.map((_, i) => {
            const existing = weeklyData.find((w) => w.dayOfWeek === i)
            return existing
              ? {
                  dayOfWeek: i,
                  startTime: existing.startTime,
                  endTime: existing.endTime,
                  isActive: existing.isActive ?? true,
                }
              : DEFAULT_SCHEDULE[i]
          })
        )
      } else {
        setSchedule([...DEFAULT_SCHEDULE])
      }
      setOverrides(overrideData as Override[])
      setIsLoading(false)
    })
  }, [selectedRoomId])

  function updateDay(dayOfWeek: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    )
  }

  function handleSaveSchedule() {
    startTransition(async () => {
      try {
        await upsertWeeklySchedule(selectedRoomId, schedule)
        toast.success("Schedule saved")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save schedule"
        )
      }
    })
  }

  function handleCreateOverride(formData: FormData) {
    startTransition(async () => {
      try {
        await createOverride(selectedRoomId, formData)
        const updated = await getOverrides(selectedRoomId)
        setOverrides(updated as Override[])
        setIsOverrideOpen(false)
        toast.success("Override added")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add override"
        )
      }
    })
  }

  function handleDeleteOverride(id: string) {
    startTransition(async () => {
      try {
        await deleteOverride(id)
        setOverrides((prev) => prev.filter((o) => o.id !== id))
        toast.success("Override removed")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove override"
        )
      }
    })
  }

  if (rooms.length === 0) {
    return (
      <p className="text-[#888] font-mono text-sm">
        No rooms configured. Create a room first at /admin/rooms.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {/* Room selector */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2 block">
          Room
        </Label>
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-[#888] font-mono text-sm">Loading schedule...</p>
      ) : (
        <>
          {/* Weekly schedule accordion */}
          <div>
            <h2 className="font-mono font-bold text-[20px] uppercase tracking-[0.05em] text-[#f5f5f0] mb-4">
              Default Weekly Schedule
            </h2>
            <Accordion className="border border-[#222]">
              {schedule.map((day) => (
                <AccordionItem key={day.dayOfWeek} value={String(day.dayOfWeek)} className="border-[#222]">
                  <AccordionTrigger className="px-4 text-[#f5f5f0] font-mono text-[15px] hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="font-bold uppercase">
                        {DAY_NAMES[day.dayOfWeek]}
                      </span>
                      <span className="text-[#888] text-[13px]">
                        {day.isActive
                          ? `${day.startTime} - ${day.endTime}`
                          : "CLOSED"}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={day.isActive}
                          onCheckedChange={(v) =>
                            updateDay(day.dayOfWeek, "isActive", v)
                          }
                          id={`day-${day.dayOfWeek}-active`}
                        />
                        <Label
                          htmlFor={`day-${day.dayOfWeek}-active`}
                          className="font-mono text-[13px] text-[#f5f5f0]"
                        >
                          {day.isActive ? "Open" : "Closed"}
                        </Label>
                      </div>
                      {day.isActive && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-mono text-[11px] font-bold uppercase text-[#888]">
                              Start
                            </Label>
                            <input
                              type="time"
                              value={day.startTime}
                              onChange={(e) =>
                                updateDay(
                                  day.dayOfWeek,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
                            />
                          </div>
                          <div>
                            <Label className="font-mono text-[11px] font-bold uppercase text-[#888]">
                              End
                            </Label>
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                updateDay(
                                  day.dayOfWeek,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <button
              onClick={handleSaveSchedule}
              disabled={isPending}
              className="mt-4 bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Schedule"}
            </button>
          </div>

          {/* Date overrides */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono font-bold text-[20px] uppercase tracking-[0.05em] text-[#f5f5f0]">
                Date Overrides
              </h2>
              <button
                onClick={() => setIsOverrideOpen(true)}
                className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-4 py-1.5"
              >
                + Add Override
              </button>
            </div>

            {overrides.length === 0 ? (
              <p className="text-[#888] font-mono text-sm">
                No date overrides. Add overrides for holidays or special hours.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222]">
                    <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                      Date
                    </TableHead>
                    <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                      Hours
                    </TableHead>
                    <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                      Reason
                    </TableHead>
                    <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888] w-20">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.map((o) => (
                    <TableRow key={o.id} className="border-[#222]">
                      <TableCell className="font-mono text-sm text-[#f5f5f0]">
                        {o.date}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[#f5f5f0]">
                        {o.isClosed
                          ? "CLOSED"
                          : `${o.startTime} - ${o.endTime}`}
                      </TableCell>
                      <TableCell className="text-sm text-[#888]">
                        {o.reason || "-"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDeleteOverride(o.id)}
                          disabled={isPending}
                          className="text-[#dc2626] font-mono text-[11px] uppercase font-bold disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}

      {/* Add Override Dialog */}
      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="bg-[#000] border border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold text-[20px] uppercase text-[#f5f5f0]">
              Add Override
            </DialogTitle>
            <DialogDescription className="text-[#888] text-sm">
              Add a date-specific schedule override for this room.
            </DialogDescription>
          </DialogHeader>
          <OverrideForm onSubmit={handleCreateOverride} isPending={isPending} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OverrideForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (formData: FormData) => void
  isPending: boolean
}) {
  const [isClosed, setIsClosed] = useState(true)

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Date *
        </Label>
        <input
          name="date"
          type="date"
          required
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isClosed}
          onCheckedChange={setIsClosed}
          id="override-closed"
        />
        <input type="hidden" name="isClosed" value={isClosed ? "true" : "false"} />
        <Label htmlFor="override-closed" className="font-mono text-[13px] text-[#f5f5f0]">
          {isClosed ? "Closed all day" : "Altered hours"}
        </Label>
      </div>

      {!isClosed && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-mono text-[11px] font-bold uppercase text-[#888]">
              Start
            </Label>
            <input
              name="startTime"
              type="time"
              className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
            />
          </div>
          <div>
            <Label className="font-mono text-[11px] font-bold uppercase text-[#888]">
              End
            </Label>
            <input
              name="endTime"
              type="time"
              className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Reason
        </Label>
        <input
          name="reason"
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          placeholder="Christmas, Studio Maintenance, etc."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Override"}
      </button>
    </form>
  )
}
