"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import type { CategoryTreeNode } from "@/actions/admin-tech-categories"

interface CategoryDetailPanelProps {
  node: CategoryTreeNode | null
  onEditSpecTemplate: () => void
  onEditBenchmarkTemplate: () => void
  onDelete: (id: string) => Promise<void>
  onError: (message: string) => void
}

export function CategoryDetailPanel({
  node,
  onEditSpecTemplate,
  onEditBenchmarkTemplate,
  onDelete,
  onError,
}: CategoryDetailPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!node) {
    return (
      <div className="border border-[#222222] bg-[#111111] p-8 text-center">
        <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-[#555555]">
          Select a category to edit
        </p>
      </div>
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(node.id)
      setConfirmOpen(false)
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete category")
    } finally {
      setDeleting(false)
    }
  }

  const canDelete = node.children.length === 0 && node.productCount === 0

  return (
    <div className="border border-[#222222] bg-[#111111]">
      <div className="border-b border-[#222222] p-4">
        <h2 className="font-mono text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {node.name}
        </h2>
        <p className="font-mono text-[11px] text-[#555555] mt-1">
          Slug: {node.slug} · Level {node.level}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <button
            type="button"
            onClick={onEditSpecTemplate}
            className="w-full bg-[#222222] text-[#f5f5f0] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-2 hover:bg-[#2a2a2a]"
          >
            Edit spec template
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={onEditBenchmarkTemplate}
            className="w-full bg-[#222222] text-[#f5f5f0] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-2 hover:bg-[#2a2a2a]"
          >
            Edit benchmark template
          </button>
        </div>

        <div className="pt-2 border-t border-[#222222]">
          <p className="font-mono text-[11px] text-[#555555]">
            Products in this category: {node.productCount}
          </p>
        </div>

        <div className="pt-4 border-t border-[#222222]">
          <p className="font-mono text-[11px] uppercase text-[#555555] mb-2">Danger zone</p>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => setConfirmOpen(true)}
            className="w-full bg-transparent text-[#dc2626] hover:text-[#ef4444] disabled:text-[#555555] font-mono text-[13px] uppercase tracking-[0.05em] px-4 py-2 border border-[#dc2626] disabled:border-[#333333] disabled:cursor-not-allowed"
          >
            Delete category
          </button>
          {!canDelete && (
            <p className="font-sans text-[11px] text-[#555555] mt-2">
              {node.children.length > 0
                ? "Move or delete subcategories before deleting this category."
                : `${node.name} has ${node.productCount} products. Reassign or delete them first.`}
            </p>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-[#222222]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#f5f5f0]">
              Delete {node.name}?
            </DialogTitle>
            <DialogDescription className="font-sans text-[13px] text-[#888888]">
              This category will be permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#dc2626] text-[#f5f5f0] font-mono text-[13px] font-bold uppercase px-6 py-2 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete category"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
