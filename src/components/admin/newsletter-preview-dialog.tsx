"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface NewsletterPreviewDialogProps {
  open: boolean
  onClose: () => void
  subject: string
  body: string
}

export function NewsletterPreviewDialog({
  open,
  onClose,
  subject,
  body,
}: NewsletterPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-wider text-[#888]">
            Email Preview
          </DialogTitle>
        </DialogHeader>

        {/* Preview container simulating the email */}
        <div className="bg-[#000000] border border-[#333333] rounded overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#222222] p-6 text-center">
            <h2 className="font-mono text-lg font-bold text-[#f5f5f0] uppercase tracking-[0.15em]">
              GLITCH STUDIOS
            </h2>
          </div>

          {/* Subject */}
          <div className="border-b border-[#222222] px-6 py-3">
            <p className="font-mono text-xs text-[#555] uppercase tracking-wider mb-1">
              Subject
            </p>
            <p className="text-[#f5f5f0] text-[15px]">{subject || "(no subject)"}</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div
              className="text-[#f5f5f0] text-[15px] leading-relaxed [&_h2]:font-mono [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-mono [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-3 [&_a]:text-[#f5f5f0] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-[#333] [&_blockquote]:pl-4 [&_blockquote]:text-[#888] [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: body || "<p style='color:#555'>Start composing to see a preview...</p>" }}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-[#222222] p-6 text-center">
            <p className="font-mono text-xs text-[#555]">
              Glitch Studios
            </p>
            <p className="mt-2">
              <span className="font-mono text-xs text-[#555] underline cursor-default">
                Unsubscribe from this list
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
