"use client"

import { useState, useTransition } from "react"
import { upsertServiceBookingConfig } from "@/app/admin/services/[id]/booking-config/actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { DepositType, RefundPolicy } from "@/types/booking"

interface ServiceBookingConfigData {
  serviceId: string
  durationMinutes: number
  depositType: string | null
  depositValue: string
  autoConfirm: boolean | null
  cancellationWindowHours: number | null
  refundPolicy: string | null
  maxAdvanceBookingDays: number | null
  prepInstructions: string | null
}

const DURATION_OPTIONS = [
  { label: "30 min", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "2 hours", value: "120" },
  { label: "4 hours", value: "240" },
  { label: "8 hours (full day)", value: "480" },
  { label: "Custom", value: "custom" },
]

export function AdminServiceBookingConfig({
  serviceId,
  serviceName,
  config,
}: {
  serviceId: string
  serviceName: string
  config: ServiceBookingConfigData | null
}) {
  const [isPending, startTransition] = useTransition()

  const defaultDuration = config?.durationMinutes ?? 120
  const isPreset = DURATION_OPTIONS.some(
    (o) => o.value !== "custom" && parseInt(o.value) === defaultDuration
  )

  const [durationMode, setDurationMode] = useState(
    isPreset ? String(defaultDuration) : "custom"
  )
  const [customDuration, setCustomDuration] = useState(
    isPreset ? "" : String(defaultDuration)
  )
  const [depositType, setDepositType] = useState<DepositType>(
    (config?.depositType as DepositType) ?? "percentage"
  )
  const [autoConfirm, setAutoConfirm] = useState(config?.autoConfirm ?? true)

  const actualDuration =
    durationMode === "custom"
      ? parseInt(customDuration || "120", 10)
      : parseInt(durationMode, 10)

  function handleSubmit(formData: FormData) {
    // Inject computed values
    formData.set("durationMinutes", String(actualDuration))
    formData.set("depositType", depositType)
    formData.set("autoConfirm", autoConfirm ? "true" : "false")

    startTransition(async () => {
      try {
        await upsertServiceBookingConfig(serviceId, formData)
        toast.success("Booking config saved")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save config"
        )
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-lg">
      {/* Session Duration */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Session Duration
        </Label>
        <select
          value={durationMode}
          onChange={(e) => setDurationMode(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {durationMode === "custom" && (
          <input
            type="number"
            min="15"
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            placeholder="Minutes"
            className="w-full mt-2 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          />
        )}
      </div>

      {/* Deposit Type */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2 block">
          Deposit Type
        </Label>
        <RadioGroup
          value={depositType}
          onValueChange={(v) => setDepositType(v as DepositType)}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="percentage" id="dep-pct" />
            <Label htmlFor="dep-pct" className="font-mono text-[13px] text-[#f5f5f0]">
              Percentage
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="flat" id="dep-flat" />
            <Label htmlFor="dep-flat" className="font-mono text-[13px] text-[#f5f5f0]">
              Flat Amount
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Deposit Value */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {depositType === "percentage" ? "Deposit %" : "Deposit $"}
        </Label>
        <input
          name="depositValue"
          type="number"
          min="0"
          step={depositType === "flat" ? "0.01" : "1"}
          defaultValue={config?.depositValue ?? "50"}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        />
      </div>

      {/* Auto-Confirm */}
      <div className="flex items-center gap-3">
        <Switch
          checked={autoConfirm}
          onCheckedChange={setAutoConfirm}
          id="auto-confirm"
        />
        <Label htmlFor="auto-confirm" className="font-mono text-[13px] text-[#f5f5f0]">
          {autoConfirm ? "Auto-confirm bookings" : "Require admin approval"}
        </Label>
      </div>

      {/* Cancellation Window */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Cancellation Window (hours before session)
        </Label>
        <input
          name="cancellationWindowHours"
          type="number"
          min="0"
          defaultValue={config?.cancellationWindowHours ?? 48}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        />
      </div>

      {/* Refund Policy */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Refund Policy
        </Label>
        <select
          name="refundPolicy"
          defaultValue={config?.refundPolicy ?? "full"}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        >
          <option value="full">Full refund</option>
          <option value="partial">50% refund</option>
          <option value="none">No refund</option>
        </select>
      </div>

      {/* Buffer note */}
      <p className="text-[#666] font-mono text-[11px] border-l-2 border-[#333] pl-3">
        Buffer time is configured per room in /admin/rooms
      </p>

      {/* Max Advance Booking */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Max Advance Booking (days)
        </Label>
        <input
          name="maxAdvanceBookingDays"
          type="number"
          min="1"
          defaultValue={config?.maxAdvanceBookingDays ?? 90}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        />
      </div>

      {/* Prep Instructions */}
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Prep Instructions
        </Label>
        <textarea
          name="prepInstructions"
          rows={3}
          defaultValue={config?.prepInstructions ?? ""}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none resize-none"
          placeholder="Instructions included in confirmation email"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Config"}
      </button>
    </form>
  )
}
