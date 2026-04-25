"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { attachMediaItem, type AttachType } from "@/actions/admin-media-items"
import { extractYouTubeId } from "@/lib/tech/youtube"

interface AddVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attachedToType: AttachType
  attachedToId: string
  onAttached?: () => void
}

export function AddVideoDialog({
  open,
  onOpenChange,
  attachedToType,
  attachedToId,
  onAttached,
}: AddVideoDialogProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setUrl("")
    setError(null)
  }

  const handleSave = () => {
    if (!extractYouTubeId(url)) {
      setError(
        "That URL doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.",
      )
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        await attachMediaItem({ attachedToType, attachedToId, url })
        toast.success("Video attached.")
        onAttached?.()
        reset()
        onOpenChange(false)
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Couldn't save. Try again or remove the link and re-paste it."
        // UI-SPEC contract: validation/oEmbed errors render inline only — no toast duplication.
        const isInlineMessage =
          msg.startsWith("That URL doesn't look like a YouTube link") ||
          msg.startsWith("Couldn't load video info from YouTube")
        setError(msg)
        if (!isInlineMessage) {
          toast.error("Couldn't save. Try again or remove the link and re-paste it.")
        }
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach a YouTube video</DialogTitle>
          <DialogDescription className="text-[#888]">
            Paste a full YouTube URL. The title and thumbnail are fetched
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-video-url">YouTube URL</Label>
            <Input
              id="add-video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              disabled={isPending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "add-video-url-error" : undefined}
            />
            {error && (
              <p
                id="add-video-url-error"
                role="alert"
                className="text-sm text-red-500"
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !url}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
