"use client"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { approveArtistApplication } from "@/actions/admin-artist-applications"

interface ApplicationApproveDialogProps {
  open: boolean
  onClose: () => void
  applicationId: string
  applicantName: string
  applicantEmail: string
  onApproved: () => void
}

export function ApplicationApproveDialog({
  open,
  onClose,
  applicationId,
  applicantName,
  applicantEmail,
  onApproved,
}: ApplicationApproveDialogProps) {
  const [pending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await approveArtistApplication({ applicationId })
        toast.success(`Approved. Invite email sent to ${applicantEmail}.`)
        onApproved()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Approve failed. Try again.",
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve application?</DialogTitle>
          <DialogDescription>
            This will create an account for <strong>{applicantName}</strong> (
            {applicantEmail}) and email them an invite link to set their
            password. This cannot be undone once the email is sent.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={pending}
            className="bg-[var(--foreground)] text-black"
          >
            {pending ? "Approving..." : "Approve and send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
