"use client"

import { useEffect, useRef, useState, useTransition } from "react"

export type AutosaveState = "idle" | "saving" | "saved" | "error"

interface UseAutosaveOptions {
  debounceMs?: number
  periodMs?: number
}

export function useAutosave<T>(
  data: T,
  save: (value: T) => Promise<void>,
  options: UseAutosaveOptions = {},
) {
  const debounceMs = options.debounceMs ?? 2000
  const periodMs = options.periodMs ?? 30000

  const [state, setState] = useState<AutosaveState>("saved")
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [, startTransition] = useTransition()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const periodicRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestData = useRef(data)
  latestData.current = data

  const firstRender = useRef(true)

  const flush = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setState("saving")
    startTransition(async () => {
      try {
        await save(latestData.current)
        setState("saved")
        setLastSavedAt(new Date())
      } catch {
        setState("error")
      }
    })
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setState("idle")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(flush, debounceMs)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    periodicRef.current = setInterval(() => {
      if (state === "idle") flush()
    }, periodMs)
    return () => {
      if (periodicRef.current) clearInterval(periodicRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, periodMs])

  return { state, lastSavedAt, flushNow: flush }
}
