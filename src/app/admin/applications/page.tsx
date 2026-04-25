import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { artistApplications } from "@/db/schema"
import { ApplicationListTable } from "@/components/admin/application-list-table"
import { GlitchHeading } from "@/components/ui/glitch-heading"

export const dynamic = "force-dynamic"

export default async function AdminApplicationsPage() {
  const rows = await db
    .select()
    .from(artistApplications)
    .orderBy(desc(artistApplications.submittedAt))

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-mono uppercase tracking-[0.05em] text-[20px] font-semibold">
          <GlitchHeading text="Applications">Applications</GlitchHeading>
        </h1>
        <p className="text-[16px] leading-[1.5] text-[var(--muted-foreground)] font-sans">
          Review and approve incoming artist + contributor applications.
        </p>
      </header>
      <ApplicationListTable applications={rows} />
    </div>
  )
}
