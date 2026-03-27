"use client"

import { useState, useTransition } from "react"
import { getMessage, markAsRead, replyToMessage } from "@/actions/admin-inbox"
import { ContactMessageSheet } from "./contact-message-sheet"
import { toast } from "sonner"

interface Message {
  id: string
  name: string
  email: string
  serviceInterest: string | null
  message: string
  isRead: boolean | null
  createdAt: Date
  replyCount: number
}

interface Reply {
  id: string
  submissionId: string
  body: string
  sentAt: Date
  sentBy: string
}

interface ContactInboxProps {
  initialMessages: Message[]
  totalPages: number
  unreadCount: number
}

export function ContactInbox({
  initialMessages,
  totalPages,
  unreadCount: initialUnreadCount,
}: ContactInboxProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{
    submission: Message
    replies: Reply[]
  } | null>(null)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const selectedMessage = messages.find((m) => m.id === selectedId)

  function handleSelectMessage(msg: Message) {
    setSelectedId(msg.id)

    startTransition(async () => {
      try {
        const detail = await getMessage(msg.id)
        setSelectedDetail(detail as { submission: Message; replies: Reply[] })

        // Explicitly mark as read (separate action)
        if (!msg.isRead) {
          await markAsRead(msg.id)
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
          )
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch {
        toast.error("Failed to load message")
      }
    })
  }

  function handleSelectMobile(msg: Message) {
    handleSelectMessage(msg)
    setMobileSheetOpen(true)
  }

  async function handleReply(body: string) {
    if (!selectedId || !selectedDetail) return

    try {
      await replyToMessage(selectedId, body)
      toast.success(`Reply sent to ${selectedDetail.submission.email}.`)

      // Refresh the detail to show new reply
      const detail = await getMessage(selectedId)
      setSelectedDetail(detail as { submission: Message; replies: Reply[] })
    } catch {
      toast.error("Failed to send reply")
    }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      {/* Desktop: two-panel layout */}
      <div className="hidden lg:flex h-[calc(100vh-120px)] gap-0">
        {/* Left panel: message list (40%) */}
        <div className="w-[40%] border-r border-[#222] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="font-mono font-bold text-[#f5f5f0] text-lg">
                No Messages
              </p>
              <p className="text-[#888] text-sm mt-2">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`w-full text-left px-4 py-3 border-b border-[#111] transition-colors ${
                  selectedId === msg.id ? "bg-[#111111]" : "hover:bg-[#0a0a0a]"
                } ${!msg.isRead ? "border-l-4 border-l-[#f5f5f0]" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm truncate ${
                      !msg.isRead
                        ? "font-bold text-[#f5f5f0]"
                        : "text-[#999]"
                    }`}
                  >
                    {!msg.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#f5f5f0] mr-2" />
                    )}
                    {msg.name}
                  </span>
                  <span className="text-xs text-[#666] ml-2 shrink-0">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#666] truncate">
                  {msg.serviceInterest || "General Inquiry"}
                </p>
                {msg.replyCount > 0 && (
                  <p className="text-xs text-[#555] mt-1">
                    {msg.replyCount} {msg.replyCount === 1 ? "reply" : "replies"}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Right panel: message detail (60%) */}
        <div className="w-[60%] overflow-y-auto p-6">
          {!selectedDetail ? (
            <div className="flex items-center justify-center h-full text-[#666]">
              <p className="font-mono text-sm">Select a message to view</p>
            </div>
          ) : (
            <MessageDetail
              submission={selectedDetail.submission}
              replies={selectedDetail.replies}
              onReply={handleReply}
              isPending={isPending}
            />
          )}
        </div>
      </div>

      {/* Mobile: list only */}
      <div className="lg:hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-mono font-bold text-[#f5f5f0] text-lg">
              No Messages
            </p>
            <p className="text-[#888] text-sm mt-2">
              Contact form submissions will appear here.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelectMobile(msg)}
              className={`w-full text-left px-4 py-3 border-b border-[#111] ${
                !msg.isRead ? "border-l-4 border-l-[#f5f5f0]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm truncate ${
                    !msg.isRead
                      ? "font-bold text-[#f5f5f0]"
                      : "text-[#999]"
                  }`}
                >
                  {!msg.isRead && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#f5f5f0] mr-2" />
                  )}
                  {msg.name}
                </span>
                <span className="text-xs text-[#666] ml-2 shrink-0">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#666] truncate">
                {msg.serviceInterest || "General Inquiry"}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Mobile sheet */}
      <ContactMessageSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        submission={selectedDetail?.submission ?? null}
        replies={selectedDetail?.replies ?? []}
        onReply={handleReply}
      />
    </>
  )
}

function MessageDetail({
  submission,
  replies,
  onReply,
  isPending,
}: {
  submission: Message
  replies: Reply[]
  onReply: (body: string) => Promise<void>
  isPending: boolean
}) {
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-xs text-[#888] font-mono mb-1">FROM</p>
          <p className="text-[#f5f5f0] font-mono font-bold">
            {submission.name}
          </p>
          <p className="text-[#888] text-sm">{submission.email}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[#888] font-mono mb-1">SERVICE INTEREST</p>
          <p className="text-[#f5f5f0] text-sm">
            {submission.serviceInterest || "Not specified"}
          </p>
        </div>

        <div className="mb-4">
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
      </div>

      {/* Message body */}
      <div className="border border-[#222] p-4 mb-6">
        <p className="text-xs text-[#888] font-mono font-bold mb-2">MESSAGE</p>
        <p className="text-[#f5f5f0] text-sm whitespace-pre-wrap">
          {submission.message}
        </p>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#888] font-mono font-bold mb-3">
            ADMIN REPLIES
          </p>
          <div className="space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="border-l-2 border-[#333] pl-4 py-2"
              >
                <p className="text-[#f5f5f0] text-sm whitespace-pre-wrap">
                  {reply.body}
                </p>
                <p className="text-xs text-[#666] mt-2">
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
          className="mt-2 bg-[#f5f5f0] text-[#000] font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#e0e0d8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  )
}
