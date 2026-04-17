"use client"

import { useEffect, useState, useTransition } from "react"
import { Plus, Trash2, Hash } from "lucide-react"
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
  getBenchmarkTemplate,
  saveBenchmarkTemplate,
  type BenchmarkTestInput,
} from "@/actions/admin-tech-templates"

interface EditableTest extends BenchmarkTestInput {
  tempId: string
}

function makeEmpty(): EditableTest {
  return {
    tempId: crypto.randomUUID(),
    name: "",
    unit: "",
    direction: "higher_is_better",
  }
}

export function BenchmarkTemplateEditor({
  categoryId,
  categoryName,
  onClose,
}: {
  categoryId: string
  categoryName: string
  onClose: () => void
}) {
  const [tests, setTests] = useState<EditableTest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getBenchmarkTemplate(categoryId)
      .then((data) => {
        if (cancelled) return
        setTests(
          (data?.tests ?? []).map((t) => ({
            tempId: t.id,
            id: t.id,
            name: t.name,
            unit: t.unit,
            direction: t.direction,
          }))
        )
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [categoryId])

  const addTest = () => setTests((prev) => [...prev, makeEmpty()])
  const removeTest = (tempId: string) => setTests((prev) => prev.filter((t) => t.tempId !== tempId))
  const updateTest = (tempId: string, patch: Partial<EditableTest>) =>
    setTests((prev) => prev.map((t) => (t.tempId === tempId ? { ...t, ...patch } : t)))

  const handleSave = () => {
    startSave(async () => {
      try {
        const payload: BenchmarkTestInput[] = tests.map((t) => ({
          id: t.id,
          name: t.name,
          unit: t.unit,
          direction: t.direction,
        }))
        await saveBenchmarkTemplate(categoryId, payload)
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
            Benchmark Template — {categoryName}
          </DrawerTitle>
          <DrawerDescription className="font-sans text-[13px] text-[#555555]">
            Add the benchmark tests you&apos;ll run for products in this category.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="font-mono text-[13px] text-[#555555] uppercase">Loading…</p>
          ) : tests.length === 0 ? (
            <div className="border border-[#222222] bg-[#111111] p-8 text-center">
              <h2 className="font-mono text-[13px] uppercase text-[#888888] mb-2">
                No tests defined
              </h2>
              <p className="font-sans text-[11px] text-[#555555]">
                Add the benchmark tests you&apos;ll run for products in this category.
              </p>
            </div>
          ) : (
            tests.map((t) => (
              <div
                key={t.tempId}
                className="flex flex-col gap-2 p-3 bg-[#111111] border border-[#222222]"
              >
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-[#888888] shrink-0" />
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTest(t.tempId, { name: e.target.value })}
                    placeholder="Test name (e.g. Geekbench 6 Multi)"
                    className="flex-1 bg-[#000000] border border-[#222222] text-[#f5f5f0] font-mono text-[13px] uppercase px-2 py-1 outline-none focus:border-[#f5f5f0]"
                  />
                  <button
                    type="button"
                    onClick={() => removeTest(t.tempId)}
                    className="text-[#555555] hover:text-[#dc2626]"
                    aria-label="Remove test"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2 pl-6">
                  <label className="font-mono text-[11px] uppercase text-[#555555]">Unit:</label>
                  <input
                    type="text"
                    value={t.unit}
                    onChange={(e) => updateTest(t.tempId, { unit: e.target.value })}
                    placeholder="score, hours, kg"
                    className="flex-1 bg-[#000000] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-2 py-1 outline-none focus:border-[#f5f5f0]"
                  />
                </div>

                <div className="flex items-center gap-2 pl-6">
                  <label className="font-mono text-[11px] uppercase text-[#555555]">Direction:</label>
                  <Select
                    value={t.direction}
                    onValueChange={(val) =>
                      updateTest(t.tempId, { direction: val as BenchmarkTestInput["direction"] })
                    }
                  >
                    <SelectTrigger className="flex-1 bg-[#000000] border border-[#222222] text-[#f5f5f0] font-mono text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="higher_is_better">Higher is better</SelectItem>
                      <SelectItem value="lower_is_better">Lower is better</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addTest}
            className="flex items-center gap-2 w-full border border-dashed border-[#333333] text-[#555555] hover:text-[#f5f5f0] hover:border-[#f5f5f0] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-3 justify-center"
          >
            <Plus size={14} />
            Add test
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
            disabled={saving || tests.length === 0}
            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
