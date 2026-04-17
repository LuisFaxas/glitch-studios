"use client"

import { useEffect, useState, useTransition } from "react"
import { Plus, Trash2, GripVertical, Type, Hash, List, ToggleLeft } from "lucide-react"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getSpecTemplate,
  saveSpecTemplate,
  type SpecFieldInput,
} from "@/actions/admin-tech-templates"

interface EditableField extends SpecFieldInput {
  tempId: string
}

const TYPE_ICONS: Record<SpecFieldInput["type"], typeof Type> = {
  text: Type,
  number: Hash,
  enum: List,
  boolean: ToggleLeft,
}

function makeEmpty(): EditableField {
  return {
    tempId: crypto.randomUUID(),
    name: "",
    type: "text",
    unit: null,
    enumOptions: null,
  }
}

export function SpecTemplateEditor({
  categoryId,
  categoryName,
  onClose,
}: {
  categoryId: string
  categoryName: string
  onClose: () => void
}) {
  const [fields, setFields] = useState<EditableField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSpecTemplate(categoryId)
      .then((data) => {
        if (cancelled) return
        if (data) {
          setFields(
            data.fields.map((f) => ({
              tempId: f.id,
              id: f.id,
              name: f.name,
              type: f.type,
              unit: f.unit,
              enumOptions: f.enumOptions,
            }))
          )
        } else {
          setFields([])
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [categoryId])

  const addField = () => setFields((prev) => [...prev, makeEmpty()])
  const removeField = (tempId: string) => setFields((prev) => prev.filter((f) => f.tempId !== tempId))
  const updateField = (tempId: string, patch: Partial<EditableField>) =>
    setFields((prev) => prev.map((f) => (f.tempId === tempId ? { ...f, ...patch } : f)))
  const moveField = (tempId: string, direction: "up" | "down") => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.tempId === tempId)
      const newIdx = direction === "up" ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }

  const handleSave = () => {
    startSave(async () => {
      try {
        const payload: SpecFieldInput[] = fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          unit: f.type === "number" ? f.unit : null,
          enumOptions: f.type === "enum" ? f.enumOptions : null,
        }))
        await saveSpecTemplate(categoryId, payload)
        toast.success("Template saved")
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save template")
      }
    })
  }

  return (
    <Drawer open={true} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="bg-[#000000] border-l border-[#222222] h-full w-full sm:max-w-[480px] flex flex-col">
        <DrawerHeader className="border-b border-[#222222]">
          <DrawerTitle className="font-mono uppercase tracking-[0.05em] text-[#f5f5f0]">
            Spec Template — {categoryName}
          </DrawerTitle>
          <DrawerDescription className="font-sans text-[13px] text-[#555555]">
            Define the specs you&apos;ll want to compare across products in this category.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="font-mono text-[13px] text-[#555555] uppercase">Loading…</p>
          ) : fields.length === 0 ? (
            <div className="border border-[#222222] bg-[#111111] p-8 text-center">
              <h2 className="font-mono text-[13px] uppercase text-[#888888] mb-2">
                No fields defined
              </h2>
              <p className="font-sans text-[11px] text-[#555555]">
                Add the specs you&apos;ll want to compare across products in this category.
              </p>
            </div>
          ) : (
            fields.map((f) => {
              const Icon = TYPE_ICONS[f.type]
              return (
                <div
                  key={f.tempId}
                  className="flex flex-col gap-2 p-3 bg-[#111111] border border-[#222222]"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-[#555555]">
                      <button type="button" onClick={() => moveField(f.tempId, "up")} aria-label="Move up" className="hover:text-[#f5f5f0]">▲</button>
                      <button type="button" onClick={() => moveField(f.tempId, "down")} aria-label="Move down" className="hover:text-[#f5f5f0]">▼</button>
                    </div>
                    <GripVertical size={14} className="text-[#555555]" />
                    <Icon size={14} className="text-[#888888] shrink-0" />
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => updateField(f.tempId, { name: e.target.value })}
                      placeholder="Field name"
                      className="flex-1 bg-[#000000] border border-[#222222] text-[#f5f5f0] font-mono text-[13px] uppercase px-2 py-1 outline-none focus:border-[#f5f5f0]"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(f.tempId)}
                      className="text-[#555555] hover:text-[#dc2626]"
                      aria-label="Remove field"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pl-8">
                    <label className="font-mono text-[11px] uppercase text-[#555555]">Type:</label>
                    <Select
                      value={f.type}
                      onValueChange={(val) =>
                        updateField(f.tempId, {
                          type: val as SpecFieldInput["type"],
                          unit: val === "number" ? f.unit ?? "" : null,
                          enumOptions: val === "enum" ? f.enumOptions ?? [] : null,
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px] bg-[#000000] border border-[#222222] text-[#f5f5f0] font-mono text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="enum">Enum</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {f.type === "number" && (
                    <div className="flex items-center gap-2 pl-8">
                      <label className="font-mono text-[11px] uppercase text-[#555555]">Unit:</label>
                      <input
                        type="text"
                        value={f.unit ?? ""}
                        onChange={(e) => updateField(f.tempId, { unit: e.target.value })}
                        placeholder="GB, kg, mm, etc."
                        className="flex-1 bg-[#000000] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-2 py-1 outline-none focus:border-[#f5f5f0]"
                      />
                    </div>
                  )}

                  {f.type === "enum" && (
                    <div className="flex flex-col gap-1 pl-8">
                      <label className="font-mono text-[11px] uppercase text-[#555555]">
                        Options (one per line)
                      </label>
                      <textarea
                        value={(f.enumOptions ?? []).join("\n")}
                        onChange={(e) =>
                          updateField(f.tempId, {
                            enumOptions: e.target.value.split("\n"),
                          })
                        }
                        placeholder="OLED&#10;IPS&#10;TN"
                        rows={3}
                        className="bg-[#000000] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-2 py-1 outline-none focus:border-[#f5f5f0] resize-y"
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}

          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-2 w-full border border-dashed border-[#333333] text-[#555555] hover:text-[#f5f5f0] hover:border-[#f5f5f0] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-3 justify-center"
          >
            <Plus size={14} />
            Add field
          </button>
        </div>

        <DrawerFooter className="border-t border-[#222222] flex-row justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2 disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || fields.length === 0}
            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
