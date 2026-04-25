import { AdminShell } from "@/components/admin/admin-shell"
import { requireVerifiedEmailOrRedirect } from "@/lib/auth-guards"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireVerifiedEmailOrRedirect()
  return <AdminShell>{children}</AdminShell>
}
