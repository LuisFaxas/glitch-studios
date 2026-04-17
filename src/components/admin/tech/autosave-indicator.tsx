"use client"

import type { AutosaveState } from "./use-autosave"

function relativeTime(from: Date, now: Date = new Date()): string {
  const sec = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export function AutosaveIndicator({
  state,
  lastSavedAt,
  onRetry,
}: {
  state: AutosaveState
  lastSavedAt: Date | null
  onRetry: () => void
}) {
  let content: React.ReactNode = null

  if (state === "saving") {
    content = <span className="text-[#888888] animate-pulse">Saving…</span>
  } else if (state === "error") {
    content = (
      <button
        type="button"
        onClick={onRetry}
        className="text-[#dc2626] hover:text-[#ef4444] underline"
      >
        Save failed — retry
      </button>
    )
  } else if (state === "idle") {
    content = <span className="text-[#dc2626]">Unsaved changes</span>
  } else {
    content = (
      <span className="text-[#555555]">
        {lastSavedAt ? `Saved ${relativeTime(lastSavedAt)}` : "Saved"}
      </span>
    )
  }

  return (
    <div aria-live="polite" role="status" className="font-mono text-[11px]">
      {content}
    </div>
  )
}
