"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBlogPost, updateBlogPost } from "@/actions/admin-blog"
import { TiptapEditor, type TiptapEditorRef } from "./tiptap-editor"
import { MediaPickerDialog } from "./media-picker-dialog"
import { toast } from "sonner"
import { z } from "zod"
import { ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string(),
  excerpt: z.string().max(300).optional().default(""),
  categoryId: z.string(),
  coverImageUrl: z.string().nullable(),
  content: z.string().min(1, "Content is required"),
  scheduledAt: z.string().nullable(),
})

interface CategoryOption {
  id: string
  name: string
}

interface BlogPostFormProps {
  mode: "create" | "edit"
  postId?: string
  categories: CategoryOption[]
  initialData?: {
    title: string
    slug: string
    excerpt: string | null
    categoryId: string | null
    tagNames: string[]
    coverImageUrl: string | null
    content: string
    status: "draft" | "scheduled" | "published" | null
    scheduledAt: Date | string | null
    isFeatured: boolean | null
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function BlogPostForm({
  mode,
  postId,
  categories,
  initialData,
}: BlogPostFormProps) {
  const router = useRouter()
  const editorRef = useRef<TiptapEditorRef>(null)

  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "")
  const [tagsInput, setTagsInput] = useState(
    initialData?.tagNames?.join(", ") || ""
  )
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl || null
  )
  const [content, setContent] = useState(initialData?.content || "")
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (initialData?.scheduledAt) {
      const d = new Date(initialData.scheduledAt)
      return d.toISOString().slice(0, 16)
    }
    return ""
  })
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showInlinePicker, setShowInlinePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStatus = initialData?.status || "draft"

  const handleTitleBlur = useCallback(() => {
    if (!slug || slug === slugify(title.slice(0, -1))) {
      setSlug(slugify(title))
    }
  }, [slug, title])

  async function handleSave(targetStatus: "draft" | "scheduled" | "published") {
    setErrors({})

    const parsed = blogPostSchema.safeParse({
      title,
      slug,
      excerpt,
      categoryId,
      coverImageUrl,
      content,
      scheduledAt: scheduledAt || null,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    // Validate scheduled date is in future
    if (targetStatus === "scheduled" && scheduledAt) {
      if (new Date(scheduledAt) <= new Date()) {
        setErrors({ scheduledAt: "Scheduled date must be in the future" })
        return
      }
    }

    setSaving(true)
    try {
      const tagNames = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const formData = {
        title,
        slug: slug || slugify(title),
        excerpt,
        categoryId,
        tagNames,
        coverImageUrl,
        content,
        status: targetStatus,
        scheduledAt: targetStatus === "scheduled" ? scheduledAt : null,
        isFeatured,
      }

      if (mode === "create") {
        await createBlogPost(formData)
        toast.success("Post created")
      } else {
        await updateBlogPost(postId!, formData)
        toast.success("Post updated")
      }

      router.push("/admin/blog")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-6 max-w-4xl">
        {/* Title */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Post title"
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
          />
          {errors.title && (
            <p className="text-[#dc2626] font-sans text-[13px] mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary for cards and SEO..."
            rows={3}
            maxLength={300}
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0] resize-y"
          />
          {errors.excerpt && (
            <p className="text-[#dc2626] font-sans text-[13px] mt-1">
              {errors.excerpt}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Tags
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add tags..."
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
          />
          <p className="text-[#555555] font-sans text-[13px] mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Cover Image
          </label>
          {coverImageUrl ? (
            <div className="relative inline-block">
              <img
                src={coverImageUrl}
                alt="Cover"
                className="max-h-40 border border-[#222222]"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className="text-[#888888] font-mono text-[13px] uppercase hover:text-[#f5f5f0] transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImageUrl(null)}
                  className="text-[#dc2626] font-mono text-[13px] uppercase hover:text-[#ef4444] transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCoverPicker(true)}
              className="flex items-center gap-2 bg-[#111111] border border-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2 hover:text-[#f5f5f0] transition-colors"
            >
              <ImageIcon size={14} />
              Select from Library
            </button>
          )}
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Schedule Date
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
          />
          {errors.scheduledAt && (
            <p className="text-[#dc2626] font-sans text-[13px] mt-1">
              {errors.scheduledAt}
            </p>
          )}
        </div>

        {/* Featured on blog page */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <label htmlFor="is-featured-switch" className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
                Feature on blog page
              </label>
              <p className="text-[#555555] font-sans text-[13px] max-w-md">
                Only one post can be featured at a time. Turning this on will un-feature any currently featured post.
              </p>
            </div>
            <Switch
              id="is-featured-switch"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
            Content
          </label>
          <TiptapEditor
            ref={editorRef}
            content={content}
            onChange={setContent}
            placeholder="Start writing..."
            onInsertImage={() => setShowInlinePicker(true)}
          />
          {errors.content && (
            <p className="text-[#dc2626] font-sans text-[13px] mt-1">
              {errors.content}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#222222]">
          {currentStatus === "draft" || mode === "create" ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("draft")}
                className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2 disabled:opacity-50"
              >
                Save Draft
              </button>
              {scheduledAt ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("scheduled")}
                  className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
                >
                  Schedule
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("published")}
                  className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
                >
                  Publish
                </button>
              )}
            </>
          ) : currentStatus === "scheduled" ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("draft")}
                className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2 disabled:opacity-50"
              >
                Unschedule
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("published")}
                className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
              >
                Publish Now
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("draft")}
                className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2 disabled:opacity-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("published")}
                className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cover image picker */}
      <MediaPickerDialog
        open={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelect={(asset) => setCoverImageUrl(asset.url)}
        typeFilter="image"
      />

      {/* Inline image picker for editor */}
      <MediaPickerDialog
        open={showInlinePicker}
        onClose={() => setShowInlinePicker(false)}
        onSelect={(asset) => {
          editorRef.current?.insertImage(asset.url, asset.alt)
        }}
        typeFilter="image"
      />
    </>
  )
}
