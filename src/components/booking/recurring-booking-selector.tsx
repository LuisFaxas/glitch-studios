"use client"

import { useState, useMemo } from "react"
import type { PackageInfo } from "@/types/booking"
import { calculatePackagePrice } from "@/lib/booking/pricing"

interface RecurringBookingSelectorProps {
  packages: PackageInfo[]
  basePrice: number
  onRecurringChange: (
    isRecurring: boolean,
    weeks?: number,
    packageId?: string
  ) => void
}

export function RecurringBookingSelector({
  packages,
  basePrice,
  onRecurringChange,
}: RecurringBookingSelectorProps) {
  const [isRecurring, setIsRecurring] = useState(false)
  const [sessionCount, setSessionCount] = useState<number>(4)
  const [customCount, setCustomCount] = useState<number>(4)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const effectiveCount = showCustom ? customCount : sessionCount

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  )

  const pricing = useMemo(() => {
    if (!isRecurring) return null
    const discount = selectedPackage?.discountPercent ?? 0
    return calculatePackagePrice(basePrice, effectiveCount, discount)
  }, [isRecurring, basePrice, effectiveCount, selectedPackage])

  function handleToggle() {
    const next = !isRecurring
    setIsRecurring(next)
    if (next) {
      onRecurringChange(true, effectiveCount, selectedPackageId ?? undefined)
    } else {
      setSelectedPackageId(null)
      onRecurringChange(false)
    }
  }

  function handleSessionCountChange(value: string) {
    if (value === "custom") {
      setShowCustom(true)
      onRecurringChange(true, customCount, selectedPackageId ?? undefined)
    } else {
      setShowCustom(false)
      const count = parseInt(value)
      setSessionCount(count)
      onRecurringChange(true, count, selectedPackageId ?? undefined)
    }
  }

  function handleCustomCountChange(value: number) {
    setCustomCount(value)
    onRecurringChange(true, value, selectedPackageId ?? undefined)
  }

  function handlePackageSelect(pkgId: string) {
    setSelectedPackageId(pkgId)
    const pkg = packages.find((p) => p.id === pkgId)
    if (pkg) {
      setSessionCount(pkg.sessionCount)
      setShowCustom(false)
    }
    onRecurringChange(true, pkg?.sessionCount ?? effectiveCount, pkgId)
  }

  const labelClasses =
    "font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]"

  return (
    <div className="border border-[#222222] bg-[#111111] p-4 space-y-4">
      {/* Toggle */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className={labelClasses}>Make this recurring?</span>
        <button
          type="button"
          role="switch"
          aria-checked={isRecurring}
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isRecurring ? "bg-[#f5f5f0]" : "bg-[#333333]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
              isRecurring
                ? "translate-x-5 bg-[#000000]"
                : "translate-x-0 bg-[#888888]"
            }`}
          />
        </button>
      </label>

      {isRecurring && (
        <>
          {/* Frequency (fixed) */}
          <div className="space-y-1">
            <span className={labelClasses}>Frequency</span>
            <p className="font-mono text-[14px] text-[#f5f5f0]">Weekly</p>
          </div>

          {/* Number of sessions */}
          <div className="space-y-2">
            <label htmlFor="sessionCount" className={labelClasses}>
              Number of Sessions
            </label>
            <select
              id="sessionCount"
              value={showCustom ? "custom" : sessionCount}
              onChange={(e) => handleSessionCountChange(e.target.value)}
              className="w-full bg-[#000000] border border-[#333333] px-4 py-3 text-[#f5f5f0] font-mono text-[14px] focus:border-[#f5f5f0] focus:outline-none"
            >
              <option value="4">4 sessions</option>
              <option value="8">8 sessions</option>
              <option value="12">12 sessions</option>
              <option value="custom">Custom</option>
            </select>

            {showCustom && (
              <input
                type="number"
                min={2}
                max={52}
                value={customCount}
                onChange={(e) =>
                  handleCustomCountChange(parseInt(e.target.value) || 2)
                }
                className="w-full bg-[#000000] border border-[#333333] px-4 py-3 text-[#f5f5f0] font-mono text-[14px] focus:border-[#f5f5f0] focus:outline-none"
              />
            )}
          </div>

          {/* Package selection */}
          {packages.length > 0 && (
            <div className="space-y-2">
              <span className={labelClasses}>Package</span>
              <div className="space-y-2">
                {packages.map((pkg) => {
                  const pkgPricing = calculatePackagePrice(
                    basePrice,
                    pkg.sessionCount,
                    pkg.discountPercent
                  )
                  return (
                    <label
                      key={pkg.id}
                      className={`flex items-start gap-3 border p-3 cursor-pointer transition-colors ${
                        selectedPackageId === pkg.id
                          ? "border-[#f5f5f0] bg-[#1a1a1a]"
                          : "border-[#333333] hover:border-[#555555]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="package"
                        value={pkg.id}
                        checked={selectedPackageId === pkg.id}
                        onChange={() => handlePackageSelect(pkg.id)}
                        className="mt-1 accent-[#f5f5f0]"
                      />
                      <div className="flex-1">
                        <p className="font-mono text-[14px] font-bold text-[#f5f5f0]">
                          {pkg.sessionCount}-Session Package
                        </p>
                        <p className="font-mono text-[13px] text-[#888888]">
                          {pkg.sessionCount} sessions: ${pkgPricing.perSession.toFixed(2)}/session
                        </p>
                        <p className="font-mono text-[13px] text-[#f5f5f0]">
                          Save {pkg.discountPercent}% &mdash; ${pkgPricing.savings.toFixed(2)} off
                        </p>
                      </div>
                      <p className="font-mono text-[14px] font-bold text-[#f5f5f0]">
                        ${pkgPricing.total.toFixed(2)}
                      </p>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pricing summary */}
          {pricing && (
            <div className="border-t border-[#222222] pt-3 space-y-1">
              <div className="flex justify-between font-mono text-[14px]">
                <span className="text-[#888888]">
                  {effectiveCount} sessions @ ${pricing.perSession.toFixed(2)}
                </span>
                <span className="text-[#f5f5f0] font-bold">
                  ${pricing.total.toFixed(2)}
                </span>
              </div>
              {pricing.savings > 0 && (
                <p className="font-mono text-[13px] text-green-400">
                  You save ${pricing.savings.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
