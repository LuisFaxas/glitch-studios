"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Submission {
  id: string
  name: string
  email: string
  serviceInterest: string | null
  message: string
  isRead: boolean | null
  createdAt: Date
}

interface Reply {
  id: string
  submissionId: string
  body: string
  sentAt: Date
  sentBy: string
}

interface ContactMessageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  replies: Reply[]
  onReply: (body: string) => Promise<void>
}

export function ContactMessageSheet({
  open,
  onOpenChange,
  submission,
  replies,
  onReply,
}: ContactMessageSheetProps) {
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await onReply(replyText.trim())
      setReplyText("")
    } finally {
      setSending(false)
    }
  }

  if (!submission) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-[#000] border-l-[#222] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-[#f5f5f0]">
            Message Details
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-4">
          {/* From */}
          <div>
            <p className="text-xs text-[#888] font-mono mb-1">FROM</p>
            <p className="text-[#f5f5f0] font-mono font-bold text-sm">
              {submission.name}
            </p>
            <p className="text-[#888] text-xs">{submission.email}</p>
          </div>

          {/* Service Interest */}
          <div>
            <p className="text-xs text-[#888] font-mono mb-1">
              SERVICE INTEREST
            </p>
            <p className="text-[#f5f5f0] text-sm">
              {submission.serviceInterest || "Not specified"}
            </p>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-[#888] font-mono mb-1">DATE</p>
            <p className="text-[#f5f5f0] text-sm">
              {new Date(submission.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Message */}
          <div className="border border-[#222] p-3">
            <p className="text-xs text-[#888] font-mono font-bold mb-2">
              MESSAGE
            </p>
            <p className="text-[#f5f5f0] text-sm whitespace-pre-wrap">
              {submission.message}
            </p>
          </div>

          {/* Admin Replies */}
          {replies.length > 0 && (
            <div>
              <p className="text-xs text-[#888] font-mono font-bold mb-2">
                ADMIN REPLIES
              </p>
              <div className="space-y-3">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="border-l-2 border-[#333] pl-3 py-2"
                  >
                    <p className="text-[#f5f5f0] text-sm whitespace-pre-wrap">
                      {reply.body}
                    </p>
                    <p className="text-xs text-[#666] mt-1">
                      {reply.sentBy} &mdash;{" "}
                      {new Date(reply.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply form */}
          <div className="border-t border-[#222] pt-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full bg-[#111] border border-[#222] text-[#f5f5f0] text-sm p-3 resize-none focus:outline-none focus:border-[#444] placeholder:text-[#555]"
            />
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || sending}
              className="mt-2 w-full bg-[#f5f5f0] text-[#000] font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#e0e0d8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
