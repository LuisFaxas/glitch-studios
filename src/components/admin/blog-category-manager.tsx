"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createCategory,
  updateCategory,
  deleteCategory,
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

interface Category {
  id: string
  name: string
  slug: string
  postCount: number
}

interface BlogCategoryManagerProps {
  categories: Category[]
}

export function BlogCategoryManager({
  categories: initialCategories,
}: BlogCategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState("")

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      await createCategory(newName.trim())
      toast.success("Category created")
      setAdding(false)
      setNewName("")
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category"
      )
    }
  }

  async function handleEdit() {
    if (!editId || !editName.trim()) return
    try {
      await updateCategory(editId, editName.trim())
      toast.success("Category updated")
      setEditId(null)
      setEditName("")
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category"
      )
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteCategory(deleteId)
      toast.success("Category deleted")
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category"
      )
    }
  }

  if (categories.length === 0 && !adding) {
    return (
      <div className="text-center py-8">
        <p className="text-[#f5f5f0] font-mono text-lg uppercase mb-2">
          No Categories Yet
        </p>
        <p className="text-[#888888] font-sans text-[15px] mb-4">
          Add categories to organize your blog posts.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          Add Category
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
              placeholder="Category name"
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
            + Add Category
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
              Slug
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
          {categories.map((cat) => (
            <TableRow key={cat.id} className="border-[#333]">
              <TableCell className="text-[#f5f5f0] font-sans">
                {editId === cat.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                    autoFocus
                    className="bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-2 py-1 outline-none focus:border-[#f5f5f0] w-full"
                  />
                ) : (
                  cat.name
                )}
              </TableCell>
              <TableCell className="text-[#888] font-mono text-sm">
                {cat.slug}
              </TableCell>
              <TableCell className="text-[#888] font-mono text-sm">
                {cat.postCount}
              </TableCell>
              <TableCell className="text-right">
                {editId === cat.id ? (
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
                        setEditId(cat.id)
                        setEditName(cat.name)
                      }}
                      className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(cat.id)
                        setDeleteName(cat.name)
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

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <DialogContent className="bg-[#111] border border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              All posts in &quot;{deleteName}&quot; will be uncategorized.
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
    </>
  )
}
