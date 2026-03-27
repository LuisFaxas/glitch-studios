"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createTag,
  updateTag,
  deleteTag,
  mergeTags,
} from "@/actions/admin-blog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
}

interface BlogTagManagerProps {
  tags: Tag[]
}

export function BlogTagManager({ tags: initialTags }: BlogTagManagerProps) {
  const router = useRouter()
  const [tags, setTags] = useState(initialTags)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState("")
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null)
  const [mergeTargetId, setMergeTargetId] = useState("")

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      await createTag(newName.trim())
      toast.success("Tag created")
      setAdding(false)
      setNewName("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create tag")
    }
  }

  async function handleEdit() {
    if (!editId || !editName.trim()) return
    try {
      await updateTag(editId, editName.trim())
      toast.success("Tag updated")
      setEditId(null)
      setEditName("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update tag")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteTag(deleteId)
      toast.success("Tag deleted")
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tag")
    }
  }

  async function handleMerge() {
    if (!mergeSourceId || !mergeTargetId) return
    try {
      await mergeTags([mergeSourceId], mergeTargetId)
      toast.success("Tags merged")
      setMergeSourceId(null)
      setMergeTargetId("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to merge tags")
    }
  }

  if (tags.length === 0 && !adding) {
    return (
      <div className="text-center py-8">
        <p className="text-[#f5f5f0] font-mono text-lg uppercase mb-2">
          No Tags Yet
        </p>
        <p className="text-[#888888] font-sans text-[15px] mb-4">
          Tags are auto-created when you add them to posts, or create them here.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          Add Tag
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        {adding ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Tag name"
              autoFocus
              className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-1.5 outline-none focus:border-[#f5f5f0]"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-4 py-1.5"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setNewName("")
              }}
              className="text-[#888888] font-mono text-[13px] uppercase px-4 py-1.5"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-[#888888] hover:text-[#f5f5f0] font-mono text-[13px] uppercase transition-colors"
          >
            + Add Tag
          </button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-[#333]">
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Name
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Posts
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id} className="border-[#333]">
              <TableCell className="text-[#f5f5f0] font-sans">
                {editId === tag.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                    autoFocus
                    className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-2 py-1 outline-none focus:border-[#f5f5f0] w-full"
                  />
                ) : (
                  tag.name
                )}
              </TableCell>
              <TableCell className="text-[#888] font-mono text-sm">
                {tag.postCount}
              </TableCell>
              <TableCell className="text-right">
                {editId === tag.id ? (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="text-[#888] font-mono text-sm uppercase transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(tag.id)
                        setEditName(tag.name)
                      }}
                      className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMergeSourceId(tag.id)
                        setMergeTargetId("")
                      }}
                      className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                    >
                      Merge
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(tag.id)
                        setDeleteName(tag.name)
                      }}
                      className="text-[#dc2626] font-mono text-sm uppercase transition-colors hover:text-[#ef4444]"
                    >
                      Delete
                    </button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <DialogContent className="bg-[#111] border border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
              Delete Tag
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              This will remove the tag &quot;{deleteName}&quot; from all posts.
              Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-[#333]">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="font-mono text-sm text-[#888] uppercase px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-[#dc2626] text-white font-mono text-sm uppercase px-4 py-2 rounded-none"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge dialog */}
      <Dialog
        open={mergeSourceId !== null}
        onOpenChange={(open) => {
          if (!open) setMergeSourceId(null)
        }}
      >
        <DialogContent className="bg-[#111] border border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
              Merge Tags
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              All posts tagged with the selected tag will be retagged with the
              target tag.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
              Merge into
            </label>
            <select
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0]"
            >
              <option value="">Select target tag</option>
              {tags
                .filter((t) => t.id !== mergeSourceId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.postCount} posts)
                  </option>
                ))}
            </select>
          </div>
          <DialogFooter className="bg-transparent border-[#333]">
            <button
              type="button"
              onClick={() => setMergeSourceId(null)}
              className="font-mono text-sm text-[#888] uppercase px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMerge}
              disabled={!mergeTargetId}
              className="bg-[#f5f5f0] text-[#000000] font-mono text-sm uppercase font-bold px-4 py-2 rounded-none disabled:opacity-50"
            >
              Merge
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
