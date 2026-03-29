import { redirect } from "next/navigation"
import { eq, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { contactSubmissions } from "@/db/schema"
import { getSessionPermissions } from "@/lib/permissions"
import { AdminSidebar } from "./admin-sidebar"

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const sessionPerms = await getSessionPermissions()

  if (!sessionPerms) {
    redirect("/login")
  }

  // Get unread contact count
  const [unreadResult] = await db
    .select({ value: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.isRead, false))

  const unreadCount = unreadResult?.value ?? 0

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      <AdminSidebar
        permissions={sessionPerms.permissions}
        role={sessionPerms.role}
        unreadCount={unreadCount}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  )
}
