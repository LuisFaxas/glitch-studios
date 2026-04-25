"use client"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { InferSelectModel } from "drizzle-orm"
import { artistApplications } from "@/db/schema"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ApplicationApproveDialog } from "./application-approve-dialog"
import {
  rejectArtistApplication,
  requestMoreInfoOnApplication,
} from "@/actions/admin-artist-applications"

type Application = InferSelectModel<typeof artistApplications>

interface ApplicationDetailSheetProps {
  application: Application
  open: boolean
  onClose: () => void
}

const META_LABEL =
  "text-[12px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]"

export function ApplicationDetailSheet({
  application,
  open,
  onClose,
}: ApplicationDetailSheetProps) {
  const [pending, startTransition] = useTransition()
  const [showApprove, setShowApprove] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [moreInfoSubject, setMoreInfoSubject] = useState(
    `Following up on your ${application.brand === "tech" ? "GlitchTech" : "Glitch Studios"} application`,
  )
  const [moreInfoBody, setMoreInfoBody] = useState("")

  const handleReject = () => {
    startTransition(async () => {
      try {
        await rejectArtistApplication({
          applicationId: application.id,
          reviewerNote: rejectNote || undefined,
        })
        toast.success("Application rejected.")
        onClose()
      } catch {
        toast.error("Reject failed. Try again.")
      }
    })
  }

  const handleMoreInfo = () => {
    if (moreInfoBody.length < 20) {
      toast.error("Email body must be at least 20 characters.")
      return
    }
    startTransition(async () => {
      try {
        await requestMoreInfoOnApplication({
          applicationId: application.id,
          emailSubject: moreInfoSubject,
          emailBody: moreInfoBody,
        })
        toast.success("Info request sent.")
        onClose()
      } catch {
        toast.error("Send failed. Try again.")
      }
    })
  }

  const isOpen =
    application.status === "pending" || application.status === "info_requested"

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-6 px-6 py-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono uppercase tracking-[0.05em] text-[20px]">
            {application.name}
          </SheetTitle>
          <p className="text-[16px] text-[var(--muted-foreground)]">
            {application.email}
          </p>
        </SheetHeader>

        <div className="flex flex-col gap-2">
          <span className={META_LABEL}>Brand</span>
          <p>{application.brand === "tech" ? "GlitchTech" : "Glitch Studios"}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className={META_LABEL}>Bio</span>
          <p className="whitespace-pre-wrap">{application.bio}</p>
        </div>

        {application.portfolioUrl && (
          <div className="flex flex-col gap-2">
            <span className={META_LABEL}>Portfolio</span>
            <a
              href={application.portfolioUrl}
              target="_blank"
              rel="noopener"
              className="underline break-all"
            >
              {application.portfolioUrl}
            </a>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className={META_LABEL}>Tags</span>
          <p>{(application.focusTags as string[]).join(", ")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className={META_LABEL}>Status</span>
          <p>{application.status}</p>
        </div>

        {application.reviewerNote && (
          <div className="flex flex-col gap-2">
            <span className={META_LABEL}>Reviewer note</span>
            <p className="whitespace-pre-wrap">{application.reviewerNote}</p>
          </div>
        )}

        {isOpen && (
          <div className="flex flex-col gap-6 mt-6">
            <Button
              onClick={() => setShowApprove(true)}
              disabled={pending}
              size="lg"
              className="bg-[var(--foreground)] text-black"
            >
              Approve
            </Button>

            <div className="flex flex-col gap-2">
              <Label className={META_LABEL}>
                Reviewer note (internal-only, optional)
              </Label>
              <Textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleReject}
                disabled={pending}
                variant="destructive"
                size="lg"
              >
                Reject
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label className={META_LABEL}>Email subject</Label>
              <Input
                value={moreInfoSubject}
                onChange={(e) => setMoreInfoSubject(e.target.value)}
              />
              <Label className={META_LABEL}>Email body</Label>
              <Textarea
                value={moreInfoBody}
                onChange={(e) => setMoreInfoBody(e.target.value)}
                rows={6}
              />
              <Button
                onClick={handleMoreInfo}
                disabled={pending}
                variant="outline"
                size="lg"
              >
                Request more info
              </Button>
            </div>
          </div>
        )}
      </SheetContent>

      <ApplicationApproveDialog
        open={showApprove}
        onClose={() => setShowApprove(false)}
        applicationId={application.id}
        applicantName={application.name}
        applicantEmail={application.email}
        onApproved={() => {
          setShowApprove(false)
          onClose()
        }}
      />
    </Sheet>
  )
}
