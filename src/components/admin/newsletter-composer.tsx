"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { TiptapEditor } from "./tiptap-editor"
import { NewsletterPreviewDialog } from "./newsletter-preview-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { sendNewsletter, type Segment } from "@/actions/admin-newsletter"
import { Send, Eye } from "lucide-react"

const newsletterSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(150, "Subject must be under 150 characters"),
  body: z.string().min(50, "Body must be at least 50 characters"),
  segment: z.enum(["all", "beat_buyers", "studio_clients"]),
})

interface NewsletterComposerProps {
  segmentCounts: {
    all: number
    beat_buyers: number
    studio_clients: number
  }
}

const SEGMENT_OPTIONS: { value: Segment; label: string; countKey: keyof NewsletterComposerProps["segmentCounts"] }[] = [
  { value: "all", label: "All subscribers", countKey: "all" },
  { value: "beat_buyers", label: "Beat buyers", countKey: "beat_buyers" },
  { value: "studio_clients", label: "Studio clients", countKey: "studio_clients" },
]

export function NewsletterComposer({ segmentCounts }: NewsletterComposerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [segment, setSegment] = useState<Segment>("all")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeCount = segmentCounts[segment]
  const segmentLabel = SEGMENT_OPTIONS.find((o) => o.value === segment)?.label ?? "subscribers"

  function handlePreview() {
    setPreviewOpen(true)
  }

  function handleSendClick() {
    setErrors({})
    const result = newsletterSchema.safeParse({ subject, body, segment })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setConfirmOpen(true)
  }

  function handleConfirmSend() {
    setConfirmOpen(false)
    startTransition(async () => {
      try {
        const result = await sendNewsletter({ subject, body, segment })
        if (result.status === "partial_failure") {
          toast.warning(
            `Newsletter sent to ${result.sent} subscribers. ${result.failed} failed.`
          )
        } else if (result.status === "failed") {
          toast.error("Newsletter could not be sent. Check your Resend configuration and try again.")
        } else {
          toast.success(`Newsletter sent to ${result.sent} subscribers`)
        }
        router.push("/admin/newsletter")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to send newsletter"
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Newsletter subject line"
          className="w-full bg-[#000] border border-[#333333] text-[#f5f5f0] text-[15px] px-4 py-3 font-sans placeholder:text-[#555] focus:outline-none focus:border-[#f5f5f0]"
          maxLength={150}
        />
        {errors.subject && (
          <p className="mt-1 text-[13px] text-[#dc2626]">{errors.subject}</p>
        )}
      </div>

      {/* Segment */}
      <div>
        <label className="block font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
          Segment
        </label>
        <RadioGroup
          value={segment}
          onValueChange={(val) => setSegment(val as Segment)}
          className="space-y-2"
        >
          {SEGMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <RadioGroupItem value={option.value} />
              <span className="text-[15px] text-[#f5f5f0]">
                {option.label}
              </span>
              <span className="font-mono text-[13px] text-[#555]">
                ({segmentCounts[option.countKey]})
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Body */}
      <div>
        <label className="block font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
          Body
        </label>
        <TiptapEditor
          content={body}
          onChange={setBody}
          placeholder="Start composing..."
        />
        {errors.body && (
          <p className="mt-1 text-[13px] text-[#dc2626]">{errors.body}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={!body}
          className="gap-2"
        >
          <Eye className="size-4" />
          Preview
        </Button>
        <Button
          onClick={handleSendClick}
          disabled={isPending}
          className="bg-[#f5f5f0] text-[#000] hover:bg-[#e5e5e0] gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em]"
        >
          <Send className="size-4" />
          {isPending ? "Sending..." : "Send Newsletter"}
        </Button>
      </div>

      {/* Preview Dialog */}
      <NewsletterPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        subject={subject}
        body={body}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              This will send to {activeCount} active {segmentLabel.toLowerCase()}. This cannot be unsent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleConfirmSend}
              className="bg-[#f5f5f0] text-[#000] hover:bg-[#e5e5e0]"
            >
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
