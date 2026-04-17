"use client"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ChevronDown, GripVertical, Plus } from "lucide-react"
import type { CategoryTreeNode as TreeNode } from "@/actions/admin-tech-categories"

export interface TreeNodeHandlers {
  selectedId: string | null
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  onRename: (id: string, newName: string) => Promise<void> | void
  onAddChild: (parentId: string) => Promise<void> | void
  onKeyboardMove: (id: string, direction: "up" | "down") => Promise<void> | void
}

export function CategoryTreeNode({
  node,
  depth,
  handlers,
}: {
  node: TreeNode
  depth: number
  handlers: TreeNodeHandlers
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const expanded = handlers.expandedIds.has(node.id)
  const selected = handlers.selectedId === node.id
  const indent = depth * 20

  const [editing, setEditing] = useState(false)
  const [tempName, setTempName] = useState(node.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commitRename = async () => {
    const trimmed = tempName.trim()
    if (trimmed && trimmed !== node.name) {
      await handlers.onRename(node.id, trimmed)
    } else {
      setTempName(node.name)
    }
    setEditing(false)
  }

  const cancelRename = () => {
    setTempName(node.name)
    setEditing(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editing) return
    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") {
      e.preventDefault()
      handlers.onKeyboardMove(node.id, "up")
    } else if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
      e.preventDefault()
      handlers.onKeyboardMove(node.id, "down")
    } else if (e.key === "F2") {
      e.preventDefault()
      setEditing(true)
    } else if (e.key === " ") {
      e.preventDefault()
      handlers.onToggleExpand(node.id)
    } else if (e.key === "Enter") {
      e.preventDefault()
      handlers.onSelect(node.id)
    }
  }

  const rowBg = selected ? "bg-[#f5f5f0]" : "hover:bg-[#1a1a1a]"
  const labelColor = selected ? "text-[#000000]" : "text-[#f5f5f0]"
  const countColor = selected ? "text-[#333333]" : "text-[#555555]"

  return (
    <div ref={setNodeRef} style={style}>
      <div
        role="treeitem"
        tabIndex={0}
        aria-selected={selected}
        aria-expanded={node.children.length > 0 ? expanded : undefined}
        className={`group flex items-center gap-2 min-h-[36px] ${rowBg} cursor-pointer`}
        style={{ paddingLeft: indent + 8, paddingRight: 8 }}
        onKeyDown={onKeyDown}
        onClick={() => !editing && handlers.onSelect(node.id)}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${node.name}`}
          className={`cursor-grab ${selected ? "text-[#333333]" : "text-[#555555]"} hover:text-[#f5f5f0]`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>

        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlers.onToggleExpand(node.id) }}
            aria-label={expanded ? "Collapse" : "Expand"}
            className={selected ? "text-[#000000]" : "text-[#f5f5f0]"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[14px]" aria-hidden="true" />
        )}

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitRename() }
              else if (e.key === "Escape") { e.preventDefault(); cancelRename() }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#111111] border border-[#f5f5f0] px-2 py-1 font-mono text-[13px] uppercase text-[#f5f5f0] outline-none"
          />
        ) : (
          <>
            <span
              className={`font-mono text-[13px] font-bold uppercase tracking-[0.05em] ${labelColor}`}
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
              title="Double-click to rename"
            >
              {node.name}
            </span>
            {node.productCount > 0 && (
              <span className={`ml-auto font-mono text-[11px] ${countColor}`}>
                ({node.productCount})
              </span>
            )}
          </>
        )}
      </div>

      {expanded && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNode key={child.id} node={child} depth={depth + 1} handlers={handlers} />
          ))}
          {depth < 2 && (
            <button
              type="button"
              onClick={() => handlers.onAddChild(node.id)}
              className="flex items-center gap-2 min-h-[36px] text-[#555555] hover:text-[#f5f5f0] font-mono text-[11px] uppercase tracking-[0.05em] w-full"
              style={{ paddingLeft: (depth + 1) * 20 + 28 }}
            >
              <Plus size={12} />
              Add subcategory
            </button>
          )}
        </div>
      )}
    </div>
  )
}
