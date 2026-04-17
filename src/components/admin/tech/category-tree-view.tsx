"use client"

import { useState, useMemo, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
  type CategoryTreeNode,
} from "@/actions/admin-tech-categories"
import { CategoryTreeNode as TreeNodeComponent, type TreeNodeHandlers } from "./category-tree-node"
import { CategoryDetailPanel } from "./category-detail-panel"
import { SpecTemplateEditor } from "./spec-template-editor"
import { BenchmarkTemplateEditor } from "./benchmark-template-editor"

function findNode(tree: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

function findParent(tree: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.children.some((c) => c.id === id)) return node
    const found = findParent(node.children, id)
    if (found) return found
  }
  return null
}

export function CategoryTreeView({ initialTree }: { initialTree: CategoryTreeNode[] }) {
  const [tree] = useState<CategoryTreeNode[]>(initialTree)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [specDrawerCategoryId, setSpecDrawerCategoryId] = useState<string | null>(null)
  const [benchmarkDrawerCategoryId, setBenchmarkDrawerCategoryId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedNode = useMemo(
    () => (selectedId ? findNode(tree, selectedId) : null),
    [tree, selectedId]
  )

  const visibleIds = useMemo(() => {
    const out: string[] = []
    const walk = (nodes: CategoryTreeNode[]) => {
      for (const n of nodes) {
        out.push(n.id)
        if (expandedIds.has(n.id)) walk(n.children)
      }
    }
    walk(tree)
    return out
  }, [tree, expandedIds])

  const refreshTree = () => {
    if (typeof window !== "undefined") window.location.reload()
  }

  const handlers: TreeNodeHandlers = {
    selectedId,
    expandedIds,
    onToggleExpand: (id) => {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    onSelect: (id) => setSelectedId(id),
    onRename: async (id, newName) => {
      startTransition(async () => {
        try {
          await renameCategory(id, newName)
          toast.success("Category renamed")
          refreshTree()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to rename")
        }
      })
    },
    onAddChild: async (parentId) => {
      const name = window.prompt("Subcategory name")?.trim()
      if (!name) return
      startTransition(async () => {
        try {
          await createCategory({ parentId, name })
          toast.success(`${name} added`)
          refreshTree()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to add")
        }
      })
    },
    onKeyboardMove: async (id, direction) => {
      const parent = findParent(tree, id)
      const siblings = parent ? parent.children : tree
      const idx = siblings.findIndex((s) => s.id === id)
      const newIdx = direction === "up" ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= siblings.length) return
      const reordered = arrayMove(siblings, idx, newIdx).map((n) => n.id)
      startTransition(async () => {
        try {
          await reorderCategories(parent?.id ?? null, reordered)
          toast.success("Order updated")
          refreshTree()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to reorder")
        }
      })
    },
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const activeParent = findParent(tree, activeId)
    const overParent = findParent(tree, overId)
    if ((activeParent?.id ?? null) !== (overParent?.id ?? null)) {
      toast.error("Drop only reorders siblings. Use [+ Add subcategory] to move into a different parent.")
      return
    }

    const siblings = activeParent ? activeParent.children : tree
    const oldIdx = siblings.findIndex((s) => s.id === activeId)
    const newIdx = siblings.findIndex((s) => s.id === overId)
    const reordered = arrayMove(siblings, oldIdx, newIdx).map((n) => n.id)

    startTransition(async () => {
      try {
        await reorderCategories(activeParent?.id ?? null, reordered)
        toast.success("Order updated")
        refreshTree()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reorder")
      }
    })
  }

  const handleAddParent = async () => {
    const name = window.prompt("Parent category name")?.trim()
    if (!name) return
    startTransition(async () => {
      try {
        await createCategory({ parentId: null, name })
        toast.success(`${name} added`)
        refreshTree()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add")
      }
    })
  }

  const handleDelete = async (id: string) => {
    await deleteCategory(id)
    toast.success("Category deleted")
    setSelectedId(null)
    refreshTree()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0]">
          Categories
        </h1>
        <button
          type="button"
          onClick={handleAddParent}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
        >
          <Plus size={14} />
          Add parent category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">
        <div className="border border-[#222222] bg-[#000000] min-h-[400px]">
          {tree.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="font-mono text-[15px] uppercase text-[#888888] mb-2">
                No categories yet
              </h2>
              <p className="font-sans text-[13px] text-[#555555] mb-6">
                Add your first parent category to start building your product catalog.
              </p>
              <button
                type="button"
                onClick={handleAddParent}
                className="inline-flex items-center gap-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
              >
                <Plus size={14} />
                Add parent category
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
                <div role="tree" className="py-2">
                  {tree.map((node) => (
                    <TreeNodeComponent
                      key={node.id}
                      node={node}
                      depth={0}
                      handlers={handlers}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <CategoryDetailPanel
          node={selectedNode}
          onEditSpecTemplate={() => selectedNode && setSpecDrawerCategoryId(selectedNode.id)}
          onEditBenchmarkTemplate={() => selectedNode && setBenchmarkDrawerCategoryId(selectedNode.id)}
          onDelete={handleDelete}
          onError={(msg) => toast.error(msg)}
        />
      </div>

      {specDrawerCategoryId && (
        <SpecTemplateEditor
          categoryId={specDrawerCategoryId}
          categoryName={findNode(tree, specDrawerCategoryId)?.name ?? ""}
          onClose={() => setSpecDrawerCategoryId(null)}
        />
      )}

      {benchmarkDrawerCategoryId && (
        <BenchmarkTemplateEditor
          categoryId={benchmarkDrawerCategoryId}
          categoryName={findNode(tree, benchmarkDrawerCategoryId)?.name ?? ""}
          onClose={() => setBenchmarkDrawerCategoryId(null)}
        />
      )}
    </div>
  )
}
