"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { SpecTemplateData } from "@/actions/admin-tech-templates"

type SpecField = SpecTemplateData["fields"][number]

export type SpecValueMap = Record<string, string | number | boolean | null>

interface DynamicSpecFieldsProps {
  fields: SpecField[]
  values: SpecValueMap
  onChange: (fieldId: string, value: string | number | boolean | null) => void
}

export function DynamicSpecFields({ fields, values, onChange }: DynamicSpecFieldsProps) {
  if (fields.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const value = values[field.id]

        return (
          <div key={field.id} className="space-y-1">
            <label className="block font-mono text-[13px] text-[#888888] uppercase tracking-[0.05em]">
              {field.name}
              {field.type === "number" && field.unit && (
                <span className="ml-2 font-mono text-[11px] text-[#555555]">({field.unit})</span>
              )}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                value={value === null || value === undefined ? "" : String(value)}
                onChange={(e) => onChange(field.id, e.target.value || null)}
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            )}

            {field.type === "number" && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={value === null || value === undefined ? "" : String(value)}
                  onChange={(e) => {
                    const v = e.target.value
                    onChange(field.id, v === "" ? null : Number(v))
                  }}
                  className="flex-1 bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
                />
                {field.unit && (
                  <span className="font-mono text-[11px] text-[#555555] shrink-0">
                    {field.unit}
                  </span>
                )}
              </div>
            )}

            {field.type === "enum" && (
              <Select
                value={value === null || value === undefined ? "" : String(value)}
                onValueChange={(v) => onChange(field.id, v || null)}
              >
                <SelectTrigger className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px]">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {(field.enumOptions ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "boolean" && (
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={Boolean(value)}
                  onCheckedChange={(v) => onChange(field.id, v)}
                />
                <span className="font-sans text-[13px] text-[#888888]">
                  {value ? "Yes" : "No"}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
