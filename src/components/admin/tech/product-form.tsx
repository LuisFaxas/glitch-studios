"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  createProduct,
  updateProduct,
  type ProductFormInput,
  type ProductSpecValue,
} from "@/actions/admin-tech-products"
import { getSpecTemplate, type SpecTemplateData } from "@/actions/admin-tech-templates"
import type { CategoryTreeNode } from "@/actions/admin-tech-categories"
import { CategoryPicker } from "./category-picker"
import { DynamicSpecFields, type SpecValueMap } from "./dynamic-spec-fields"
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog"
import { slugify } from "@/lib/slugify"

interface ProductFormProps {
  mode: "create" | "edit"
  productId?: string
  tree: CategoryTreeNode[]
  initial?: {
    name: string
    slug: string
    manufacturer: string | null
    categoryId: string
    heroImageId: string | null
    heroImageUrl: string | null
    summary: string | null
    priceUsd: number | null
    affiliateUrl: string | null
    releaseDate: string | null
    specs: ProductSpecValue[]
  }
}

export function ProductForm({ mode, productId, tree, initial }: ProductFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? "")
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "")
  const [heroImageId, setHeroImageId] = useState<string | null>(initial?.heroImageId ?? null)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initial?.heroImageUrl ?? null)
  const [summary, setSummary] = useState(initial?.summary ?? "")
  const [priceUsd, setPriceUsd] = useState(
    initial?.priceUsd !== null && initial?.priceUsd !== undefined ? String(initial.priceUsd) : ""
  )
  const [affiliateUrl, setAffiliateUrl] = useState(initial?.affiliateUrl ?? "")
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? "")

  const [specs, setSpecs] = useState<SpecValueMap>(() => {
    const m: SpecValueMap = {}
    for (const s of initial?.specs ?? []) m[s.fieldId] = s.value
    return m
  })

  const [template, setTemplate] = useState<SpecTemplateData | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  const handleNameBlur = useCallback(() => {
    if (!slug || slug === slugify(name.slice(0, -1))) {
      setSlug(slugify(name))
    }
  }, [name, slug])

  useEffect(() => {
    if (!categoryId) { setTemplate(null); return }
    let cancelled = false
    setLoadingTemplate(true)
    getSpecTemplate(categoryId)
      .then((data) => { if (!cancelled) setTemplate(data) })
      .finally(() => { if (!cancelled) setLoadingTemplate(false) })
    return () => { cancelled = true }
  }, [categoryId])

  const hasFilledSpecs = Object.values(specs).some(
    (v) => v !== null && v !== undefined && v !== ""
  )

  const handleCategoryChange = (newId: string) => {
    if (hasFilledSpecs && categoryId && newId !== categoryId) {
      setPendingCategoryId(newId)
      return
    }
    setCategoryId(newId)
    setSpecs({})
  }

  const confirmCategoryChange = () => {
    if (pendingCategoryId) {
      setCategoryId(pendingCategoryId)
      setSpecs({})
      setPendingCategoryId(null)
    }
  }

  const buildPayload = (): ProductFormInput => ({
    name: name.trim(),
    slug: slug.trim() || null,
    manufacturer: manufacturer.trim() || null,
    categoryId,
    heroImageId,
    summary: summary.trim() || null,
    priceUsd: priceUsd === "" ? null : Number(priceUsd),
    affiliateUrl: affiliateUrl.trim() || null,
    releaseDate: releaseDate || null,
    specs: Object.entries(specs)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([fieldId, value]) => ({ fieldId, value: value as string | number | boolean })),
  })

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required"
    if (!categoryId) return "Category is required"
    return null
  }

  const handleSave = () => {
    const err = validate()
    if (err) { toast.error(err); return }

    const payload = buildPayload()
    startSave(async () => {
      try {
        if (mode === "create") {
          const { id } = await createProduct(payload)
          toast.success("Product created")
          router.push(`/admin/tech/products/${id}/edit`)
          router.refresh()
        } else {
          await updateProduct(productId!, payload)
          toast.success("Product saved")
          router.push("/admin/tech/products")
          router.refresh()
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save product")
      }
    })
  }

  return (
    <>
      <div className="max-w-[720px] mx-auto space-y-8">
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-4">
            Base fields
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                autoFocus
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Category *
              </label>
              <CategoryPicker
                value={categoryId || null}
                onChange={handleCategoryChange}
                tree={tree}
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Release date
              </label>
              <input
                type="date"
                value={releaseDate ?? ""}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#222222] pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-4">
            Media
          </h2>
          <div>
            <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
              Hero image
            </label>
            {heroImageUrl ? (
              <div className="flex items-start gap-4">
                <Image
                  src={heroImageUrl}
                  alt="Hero preview"
                  width={800}
                  height={160}
                  className="max-h-40 border border-[#222222]"
                  sizes="800px"
                  unoptimized
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="text-[#888888] font-mono text-[13px] uppercase hover:text-[#f5f5f0]"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHeroImageId(null); setHeroImageUrl(null) }}
                    className="text-[#dc2626] font-mono text-[13px] uppercase hover:text-[#ef4444]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-2 bg-[#111111] border border-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2 hover:text-[#f5f5f0]"
              >
                <ImageIcon size={14} />
                Select from library
              </button>
            )}
          </div>
        </section>

        <section className="border-t border-[#222222] pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-4">
            Marketing
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={400}
                rows={3}
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0] resize-y"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
            <div>
              <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Affiliate URL
              </label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://amzn.to/…"
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>
          </div>
        </section>

        {categoryId && (
          <section className="border-t border-[#222222] pt-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-4">
              Specifications
            </h2>
            {loadingTemplate ? (
              <p className="font-mono text-[13px] text-[#555555] uppercase">Loading…</p>
            ) : !template || template.fields.length === 0 ? (
              <p className="font-sans text-[13px] text-[#888888]">
                No spec template for this category. Add one from the{" "}
                <a
                  href="/admin/tech/categories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f5f5f0] underline"
                >
                  Categories page
                </a>
                .
              </p>
            ) : (
              <DynamicSpecFields
                fields={template.fields}
                values={specs}
                onChange={(fieldId, value) =>
                  setSpecs((prev) => ({ ...prev, [fieldId]: value }))
                }
              />
            )}
          </section>
        )}

        <div className="flex gap-3 pt-6 border-t border-[#222222] sticky bottom-0 bg-[#000000] pb-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="bg-transparent text-[#888888] font-mono text-[13px] uppercase px-4 py-2 disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase px-6 py-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "create" ? "Save" : "Save changes"}
          </button>
        </div>
      </div>

      <MediaPickerDialog
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(asset) => {
          setHeroImageId(asset.id)
          setHeroImageUrl(asset.url)
        }}
        typeFilter="image"
      />

      <Dialog open={pendingCategoryId !== null} onOpenChange={(o) => !o && setPendingCategoryId(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-[#222222]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#f5f5f0]">
              Change category?
            </DialogTitle>
            <DialogDescription className="font-sans text-[13px] text-[#888888]">
              Changing the category will clear all current spec values. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setPendingCategoryId(null)}
              className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmCategoryChange}
              className="bg-[#dc2626] text-[#f5f5f0] font-mono text-[13px] font-bold uppercase px-6 py-2"
            >
              Change and clear specs
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
