"use client"

import { useMemo, useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  isToday as isTodayFn,
  format,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarDayTile } from "./calendar-day-tile"

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const

interface BookingCalendarProps {
  currentMonth: Date
  availableDates: Map<string, boolean>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (month: Date) => void
}

export function BookingCalendar({
  currentMonth,
  availableDates,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: BookingCalendarProps) {
  const [direction, setDirection] = useState(0) // -1 = back, 1 = forward

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const handlePrevMonth = useCallback(() => {
    setDirection(-1)
    onMonthChange(subMonths(currentMonth, 1))
  }, [currentMonth, onMonthChange])

  const handleNextMonth = useCallback(() => {
    setDirection(1)
    onMonthChange(addMonths(currentMonth, 1))
  }, [currentMonth, onMonthChange])

  const today = startOfDay(new Date())

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const monthVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          x: dir > 0 ? 30 : -30,
          opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({
          x: dir > 0 ? -30 : 30,
          opacity: 0,
        }),
      }

  return (
    <div>
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-4">
        PICK A DATE
      </h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="flex items-center justify-center w-10 h-10 bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] hover:border-[#444444] transition-colors duration-150 rounded-none"
        >
          <ChevronLeft className="h-4 w-4 text-[#f5f5f0]" />
        </button>

        <span className="font-mono text-[28px] font-bold text-[#f5f5f0]">
          {format(currentMonth, "MMMM yyyy")}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="flex items-center justify-center w-10 h-10 bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] hover:border-[#444444] transition-colors duration-150 rounded-none"
        >
          <ChevronRight className="h-4 w-4 text-[#f5f5f0]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-[4px] mb-[4px]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid with month transition animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={format(currentMonth, "yyyy-MM")}
          custom={direction}
          variants={monthVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.25,
            ease: "easeInOut",
          }}
          className="grid grid-cols-7 gap-[4px]"
        >
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const dayNumber = format(day, "d")
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isPast = isBefore(day, today)
            const isAvailable = availableDates.get(dateStr) === true
            const isSelected = selectedDate === dateStr
            const isToday = isTodayFn(day)

            return (
              <CalendarDayTile
                key={dateStr}
                date={dateStr}
                dayNumber={dayNumber}
                isCurrentMonth={isCurrentMonth}
                isAvailable={isAvailable && !isPast}
                isSelected={isSelected}
                isToday={isToday}
                isPast={isPast}
                onClick={() => onSelectDate(dateStr)}
              />
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
