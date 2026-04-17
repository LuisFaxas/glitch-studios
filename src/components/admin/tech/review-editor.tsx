"use client"

import { useState, useCallback, useRef, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings as SettingsIcon, X, Plus } from "lucide-react"
import { toast } from "sonner"
import { TiptapEditor, type TiptapEditorRef } from "@/components/admin/tiptap-editor"
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  upsertReview,
  publishReview,
  unpublishReview,
  type ReviewFormInput,
  type ReviewerOption,
} from "@/actions/admin-tech-reviews"
import type { ProductListRow } from "@/actions/admin-tech-products"
import { useAutosave } from "./use-autosave"
import { AutosaveIndicator } from "./autosave-indicator"
import { RatingSlider } from "./rating-slider"
import { ProsConsInput } from "./pros-cons-input"
import { MarkdownPreviewPane } from "./markdown-preview-pane"
import { slugify } from "@/lib/slugify"

interface ReviewEditorProps {
  mode: "create" | "edit"
  reviewId?: string
  initialReviewerId: string
  products: ProductListRow[]
  reviewers: ReviewerOption[]
  galleryUrls: { id: string; url: string }[]
  initial?: {
    productId: string
    reviewerId: string
    title: string
    slug: string
    verdict: string
    bodyHtml: string
    ratingPerformance: number
    ratingBuild: number
    ratingValue: number
    ratingDesign: number
    overallOverride: number | null
    heroImageId: string | null
    heroImageUrl: string | null
    videoUrl: string | null
    audienceFor: string | null
    audienceNotFor: string | null
    pros: string[]
    cons: string[]
    galleryMediaIds: string[]
    status: "draft" | "published"
  }
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)) }

export function ReviewEditor({
  mode,
  reviewId: initialReviewId,
  initialReviewerId,
  products,
  reviewers,
  galleryUrls: initialGalleryUrls,
  initial,
}: ReviewEditorProps) {
  const router = useRouter()
  const editorRef = useRef<TiptapEditorRef>(null)

  const [reviewId, setReviewId] = useState<string | null>(initialReviewId ?? null)
  const [productId, setProductId] = useState(initial?.productId ?? "")
  const [reviewerId, setReviewerId] = useState(initial?.reviewerId ?? initialReviewerId)
  const [title, setTitle] = useState(initial?.title ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [verdict, setVerdict] = useState(initial?.verdict ?? "")
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? "")
  const [rP, setRP] = useState(initial?.ratingPerformance ?? 5)
  const [rB, setRB] = useState(initial?.ratingBuild ?? 5)
  const [rV, setRV] = useState(initial?.ratingValue ?? 5)
  const [rD, setRD] = useState(initial?.ratingDesign ?? 5)
  const [overrideOn, setOverrideOn] = useState(initial?.overallOverride !== null && initial?.overallOverride !== undefined)
  const [overrideValue, setOverrideValue] = useState<string>(
    initial?.overallOverride !== null && initial?.overallOverride !== undefined
      ? String(initial.overallOverride)
      : ""
  )
  const [heroImageId, setHeroImageId] = useState<string | null>(initial?.heroImageId ?? null)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initial?.heroImageUrl ?? null)
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "")
  const [audienceFor, setAudienceFor] = useState(initial?.audienceFor ?? "")
  const [audienceNotFor, setAudienceNotFor] = useState(initial?.audienceNotFor ?? "")
  const [pros, setPros] = useState<string[]>(initial?.pros ?? [])
  const [cons, setCons] = useState<string[]>(initial?.cons ?? [])
  const [gallery, setGallery] = useState<{ id: string; url: string }[]>(initialGalleryUrls)
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft")

  const [heroPickerOpen, setHeroPickerOpen] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [inlinePickerOpen, setInlinePickerOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [writeTab, setWriteTab] = useState<"write" | "preview">("write")
  const [publishing, startPublish] = useTransition()

  const overallAuto = useMemo(() => {
    return Number(((rP + rB + rV + rD) / 4).toFixed(1))
  }, [rP, rB, rV, rD])

  const payload = useMemo<ReviewFormInput | null>(() => {
    if (!title.trim() || !productId || !heroImageId) return null
    return {
      productId,
      reviewerId,
      title: title.trim(),
      slug: slug.trim() || null,
      verdict: verdict.trim(),
      bodyHtml,
      ratingPerformance: rP,
      ratingBuild: rB,
      ratingValue: rV,
      ratingDesign: rD,
      overallOverride: overrideOn && overrideValue !== ""
        ? clamp(Number(overrideValue), 1, 10)
        : null,
      heroImageId,
      videoUrl: videoUrl.trim() || null,
      audienceFor: audienceFor.trim() || null,
      audienceNotFor: audienceNotFor.trim() || null,
      pros: pros.map((p) => p.trim()).filter(Boolean),
      cons: cons.map((c) => c.trim()).filter(Boolean),
      galleryMediaIds: gallery.map((g) => g.id),
    }
  }, [title, productId, reviewerId, slug, verdict, bodyHtml, rP, rB, rV, rD, overrideOn, overrideValue, heroImageId, videoUrl, audienceFor, audienceNotFor, pros, cons, gallery])

  const save = useCallback(async (data: ReviewFormInput | null) => {
    if (!data) throw new Error("Missing required fields")
    const { id } = await upsertReview(reviewId, data)
    if (reviewId === null) {
      setReviewId(id)
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", `/admin/tech/reviews/${id}/edit`)
      }
    }
  }, [reviewId])

  const autosave = useAutosave<ReviewFormInput | null>(payload, save, { debounceMs: 2000, periodMs: 30000 })

  const handleTitleBlur = useCallback(() => {
    if (!slug || slug === slugify(title.slice(0, -1))) {
      setSlug(slugify(title))
    }
    autosave.flushNow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug])

  const canPublish = payload !== null && reviewId !== null
  const handlePublish = () => {
    if (!reviewId) { toast.error("Save the review first by filling Title, Product, and Hero image"); return }
    startPublish(async () => {
      try {
        if (status === "draft") {
          await publishReview(reviewId)
          setStatus("published")
          toast.success("Review published")
        } else {
          await unpublishReview(reviewId)
          setStatus("draft")
          toast.success("Review unpublished")
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update status")
      }
    })
  }

  const handleExplicitSave = () => {
    autosave.flushNow()
  }

  const renderBody = () => (
    <>
      <div>
        <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          autoFocus
          placeholder="e.g. MacBook Pro 14&quot; M4 Max"
          className="w-full bg-transparent border-0 border-b border-[#222222] text-[#f5f5f0] font-mono text-[28px] font-bold uppercase px-0 py-2 outline-none focus:border-[#f5f5f0]"
        />
      </div>
      <div>
        <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">Product *</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
        >
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}{p.manufacturer ? ` — ${p.manufacturer}` : ""}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">Verdict *</label>
        <textarea
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          onBlur={() => autosave.flushNow()}
          placeholder="2–4 sentence TL;DR shown at the top of the review."
          rows={3}
          className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0] resize-y"
        />
      </div>
      <div>
        <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">Body *</label>
        <TiptapEditor
          ref={editorRef}
          content={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Start writing the full review…"
          onInsertImage={() => setInlinePickerOpen(true)}
        />
      </div>
    </>
  )

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#222222] pb-4 mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/tech/reviews")}
            className="flex items-center gap-1 text-[#888888] hover:text-[#f5f5f0] font-mono text-[13px] uppercase"
          >
            <ArrowLeft size={14} /> Back to reviews
          </button>
          <span className="font-mono text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            {mode === "create" ? "New Review" : `Edit Review — ${title || "…"}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator state={autosave.state} lastSavedAt={autosave.lastSavedAt} onRetry={autosave.flushNow} />
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="flex items-center gap-2 bg-[#222222] text-[#f5f5f0] font-mono text-[13px] uppercase px-4 py-2 hover:bg-[#2a2a2a]"
          >
            <SettingsIcon size={14} /> Details
          </button>
          <button
            type="button"
            onClick={handleExplicitSave}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || !canPublish}
            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase px-4 py-2 disabled:opacity-50"
          >
            {publishing ? "Working…" : status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="hidden xl:grid grid-cols-[3fr_2fr] gap-4">
        <div className="space-y-4">{renderBody()}</div>
        <MarkdownPreviewPane html={bodyHtml} />
      </div>

      <div className="xl:hidden">
        <div className="flex gap-0 border-b border-[#222222] mb-4">
          <button
            type="button"
            onClick={() => setWriteTab("write")}
            className={`flex-1 min-h-[40px] font-mono text-[13px] uppercase tracking-[0.05em] border-b-2 ${
              writeTab === "write" ? "border-[#f5f5f0] text-[#f5f5f0]" : "border-transparent text-[#888888]"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setWriteTab("preview")}
            className={`flex-1 min-h-[40px] font-mono text-[13px] uppercase tracking-[0.05em] border-b-2 ${
              writeTab === "preview" ? "border-[#f5f5f0] text-[#f5f5f0]" : "border-transparent text-[#888888]"
            }`}
          >
            Preview
          </button>
        </div>
        {writeTab === "write" ? <div className="space-y-4">{renderBody()}</div> : <MarkdownPreviewPane html={bodyHtml} />}
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="bg-[#000000] border-l border-[#222222] w-full sm:max-w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono uppercase tracking-[0.05em] text-[#f5f5f0]">
              Details
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-6">
            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-3">
                Rating
              </h3>
              <div className="space-y-4">
                <RatingSlider label="Performance" value={rP} onChange={setRP} />
                <RatingSlider label="Build Quality" value={rB} onChange={setRB} />
                <RatingSlider label="Value" value={rV} onChange={setRV} />
                <RatingSlider label="Design / Aesthetics" value={rD} onChange={setRD} />
                <div className="border-t border-[#222222] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] uppercase text-[#f5f5f0]">Overall (auto)</span>
                    <span className="font-mono text-[13px] text-[#f5f5f0]">{overallAuto.toFixed(1)} / 10</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Switch checked={overrideOn} onCheckedChange={setOverrideOn} />
                    <span className="font-sans text-[13px] text-[#888888]">Override manually</span>
                  </div>
                  {overrideOn && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step={0.1}
                        value={overrideValue}
                        onChange={(e) => setOverrideValue(e.target.value)}
                        className="w-[80px] bg-[#111111] border border-[#222222] text-[#f5f5f0] font-mono text-[13px] px-2 py-1 outline-none focus:border-[#f5f5f0]"
                      />
                      <span className="font-mono text-[13px] text-[#888888]">/ 10</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-3">
                Pros &amp; Cons
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[13px] uppercase text-[#f5f5f0] mb-2">Pros</p>
                  <ProsConsInput items={pros} onChange={setPros} variant="pro" />
                </div>
                <div>
                  <p className="font-mono text-[13px] uppercase text-[#f5f5f0] mb-2">Cons</p>
                  <ProsConsInput items={cons} onChange={setCons} variant="con" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-3">
                Media
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Hero image *
                  </label>
                  {heroImageUrl ? (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImageUrl} alt="Hero" className="max-h-24 border border-[#222222]" />
                      <button
                        type="button"
                        onClick={() => setHeroPickerOpen(true)}
                        className="text-[#888888] hover:text-[#f5f5f0] font-mono text-[13px] uppercase"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHeroPickerOpen(true)}
                      className="bg-[#111111] border border-[#222222] text-[#888888] hover:text-[#f5f5f0] font-mono text-[13px] uppercase px-4 py-2"
                    >
                      Select image
                    </button>
                  )}
                </div>
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Gallery
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gallery.map((g) => (
                      <div key={g.id} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.url} alt="" className="h-16 w-16 object-cover border border-[#222222]" />
                        <button
                          type="button"
                          onClick={() => setGallery((prev) => prev.filter((x) => x.id !== g.id))}
                          className="absolute top-0 right-0 bg-[#000000] text-[#dc2626] p-1 opacity-0 group-hover:opacity-100"
                          aria-label="Remove gallery image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGalleryPickerOpen(true)}
                      className="h-16 w-16 flex items-center justify-center border border-dashed border-[#333333] text-[#555555] hover:text-[#f5f5f0] hover:border-[#f5f5f0]"
                      aria-label="Add gallery image"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                    className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
                  />
                  <p className="font-sans text-[11px] text-[#555555] mt-1">
                    YouTube URL or a video from your media library.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-3">
                Audience
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Who it&apos;s for
                  </label>
                  <textarea
                    value={audienceFor}
                    onChange={(e) => setAudienceFor(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Creators who…"
                    className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-3 py-2 outline-none focus:border-[#f5f5f0] resize-y"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Who it&apos;s not for
                  </label>
                  <textarea
                    value={audienceNotFor}
                    onChange={(e) => setAudienceNotFor(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="People looking for…"
                    className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-3 py-2 outline-none focus:border-[#f5f5f0] resize-y"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#555555] mb-3">
                Publishing
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                    Reviewer
                  </label>
                  <select
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[13px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
                  >
                    {reviewers.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 border border-[#222222] bg-[#111111] p-2 w-fit">
                  <span
                    className={`font-mono text-[13px] uppercase px-3 py-1 ${
                      status === "draft" ? "bg-[#f5f5f0] text-[#000000]" : "text-[#888888]"
                    }`}
                  >
                    Draft
                  </span>
                  <span
                    className={`font-mono text-[13px] uppercase px-3 py-1 ${
                      status === "published" ? "bg-[#f5f5f0] text-[#000000]" : "text-[#888888]"
                    }`}
                  >
                    Published
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[#555555]">
                  Use the header [Publish] / [Unpublish] button to change status.
                </p>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <MediaPickerDialog
        open={heroPickerOpen}
        onClose={() => setHeroPickerOpen(false)}
        onSelect={(asset) => {
          setHeroImageId(asset.id)
          setHeroImageUrl(asset.url)
        }}
        typeFilter="image"
      />
      <MediaPickerDialog
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        onSelect={(asset) => {
          setGallery((prev) => (prev.some((g) => g.id === asset.id) ? prev : [...prev, { id: asset.id, url: asset.url }]))
        }}
        typeFilter="image"
      />
      <MediaPickerDialog
        open={inlinePickerOpen}
        onClose={() => setInlinePickerOpen(false)}
        onSelect={(asset) => {
          editorRef.current?.insertImage(asset.url, asset.alt)
        }}
        typeFilter="image"
      />
    </div>
  )
}
