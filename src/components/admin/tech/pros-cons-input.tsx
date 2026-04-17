"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"

export function ProsConsInput({
  items,
  onChange,
  variant,
}: {
  items: string[]
  onChange: (items: string[]) => void
  variant: "pro" | "con"
}) {
  const bullet = variant === "pro" ? "+" : "−"
  const addLabel = variant === "pro" ? "Add pro" : "Add con"
  const lastInputRef = useRef<HTMLInputElement | null>(null)
  const shouldFocusLast = useRef(false)

  useEffect(() => {
    if (shouldFocusLast.current && lastInputRef.current) {
      lastInputRef.current.focus()
      shouldFocusLast.current = false
    }
  }, [items])

  const updateAt = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const removeAt = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const addRow = () => {
    shouldFocusLast.current = true
    onChange([...items, ""])
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter" && idx === items.length - 1) {
      e.preventDefault()
      addRow()
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="font-mono text-[13px] font-bold text-[#f5f5f0]"
            aria-hidden="true"
          >
            {bullet}
          </span>
          <input
            ref={idx === items.length - 1 ? lastInputRef : undefined}
            type="text"
            value={item}
            onChange={(e) => updateAt(idx, e.target.value)}
            onKeyDown={(e) => onInputKeyDown(e, idx)}
            placeholder={variant === "pro" ? "e.g. Excellent battery life" : "e.g. Limited ports"}
            className="flex-1 bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-2 py-1 outline-none focus:border-[#f5f5f0]"
          />
          <button
            type="button"
            onClick={() => removeAt(idx)}
            aria-label={`Remove ${variant === "pro" ? "pro" : "con"}`}
            className="text-[#555555] hover:text-[#dc2626]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="w-full border border-dashed border-[#333333] text-[#555555] hover:text-[#f5f5f0] hover:border-[#f5f5f0] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-2 text-center"
      >
        {addLabel}
      </button>
    </div>
  )
}
