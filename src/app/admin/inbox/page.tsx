export const dynamic = "force-dynamic"

import { getMessages } from "@/actions/admin-inbox"
import { ContactInbox } from "@/components/admin/contact-inbox"

export default async function InboxPage() {
  const { messages, totalPages, unreadCount } = await getMessages()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-mono text-2xl font-bold text-[#f5f5f0] uppercase tracking-wider">
          Inbox
        </h1>
        {unreadCount > 0 && (
          <span className="bg-[#f5f5f0] text-[#000] font-mono text-xs font-bold px-2 py-0.5">
            {unreadCount} unread
          </span>
        )}
      </div>

      <ContactInbox
        initialMessages={messages}
        totalPages={totalPages}
        unreadCount={unreadCount}
      />
    </div>
  )
}
