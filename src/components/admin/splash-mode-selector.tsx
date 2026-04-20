"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setSplashMode } from "@/actions/settings/set-splash-mode"
import type { SplashMode } from "@/lib/get-splash-mode"

interface SplashModeSelectorProps {
  initialValue: SplashMode
}

const MODES: Array<{ value: SplashMode; label: string; description: string }> =
  [
    {
      value: "always",
      label: "Always play",
      description: "Splash shows on every page load, every visit.",
    },
    {
      value: "first_visit",
      label: "First visit only",
      description:
        "Splash plays once per browser, then is hidden on return visits.",
    },
    {
      value: "never",
      label: "Never play",
      description: "Splash is disabled entirely — homepage loads directly.",
    },
  ]

export function SplashModeSelector({ initialValue }: SplashModeSelectorProps) {
  const [persistedValue, setPersistedValue] = useState<SplashMode>(initialValue)
  const [pendingValue, setPendingValue] = useState<SplashMode>(initialValue)
  const [saving, setSaving] = useState(false)

  const hasChange = pendingValue !== persistedValue

  async function handleSave() {
    setSaving(true)
    try {
      const res = await setSplashMode(pendingValue)
      if (res.success) {
        setPersistedValue(pendingValue)
        toast.success(
          pendingValue === "always"
            ? "Splash set to play on every visit."
            : pendingValue === "first_visit"
              ? "Splash set to first visit only."
              : "Splash disabled."
        )
      } else {
        toast.error("Couldn't save. Try again.")
      }
    } catch {
      toast.error("Couldn't save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#111111] border border-[#222222] p-6 rounded-none">
      <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
        HOMEPAGE SPLASH INTRO
      </h2>

      <div role="radiogroup" className="space-y-2 mb-4">
        {MODES.map((m) => {
          const selected = pendingValue === m.value
          return (
            <label
              key={m.value}
              className={[
                "flex cursor-pointer items-start gap-3 border p-3 transition-colors",
                selected
                  ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
                  : "bg-[#0a0a0a] text-[#f5f5f0] border-[#222222] hover:border-[#444444]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="splash-mode"
                value={m.value}
                checked={selected}
                onChange={() => setPendingValue(m.value)}
                className="mt-1"
              />
              <span className="flex flex-col gap-1">
                <span className="font-mono text-[14px] font-bold uppercase tracking-[0.05em]">
                  {m.label}
                </span>
                <span
                  className={[
                    "font-sans text-[13px] leading-[1.4]",
                    selected ? "text-[#000000]/80" : "text-[#888888]",
                  ].join(" ")}
                >
                  {m.description}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      <Button
        disabled={!hasChange || saving}
        onClick={handleSave}
        className="bg-[#f5f5f0] text-[#000000] hover:opacity-90 disabled:opacity-50 font-mono uppercase"
      >
        {saving ? "SAVING..." : "Save Changes"}
      </Button>
    </div>
  )
}
