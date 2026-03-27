"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { deleteBlogPost, getBlogPosts } from "@/actions/admin-blog"
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

type PostRow = Awaited<ReturnType<typeof getBlogPosts>>["posts"][number]

interface BlogPostTableProps {
  initialPosts: PostRow[]
  initialTotalPages: number
  initialPage: number
}

const STATUS_TABS = ["all", "draft", "scheduled", "published"] as const

const statusStyles: Record<string, string> = {
  draft: "text-[#888888] bg-[#222222]",
  scheduled: "text-[#aaaaaa] bg-[#222222]",
  published: "text-[#f5f5f0] bg-[#222222]",
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
}

export function BlogPostTable({
  initialPosts,
  initialTotalPages,
  initialPage,
}: BlogPostTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState(initialPosts)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [page, setPage] = useState(initialPage)
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get("status") || "all"
  )
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState("")
  const [loading, setLoading] = useState(false)

  async function fetchPosts(status: string, query: string, p: number) {
    setLoading(true)
    try {
      const result = await getBlogPosts({
        status: status === "all" ? undefined : status,
        search: query || undefined,
        page: p,
      })
      setPosts(result.posts)
      setTotalPages(result.totalPages)
      setPage(result.currentPage)
    } finally {
      setLoading(false)
    }
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    fetchPosts(tab, search, 1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    fetchPosts(activeTab, value, 1)
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteBlogPost(deleteId)
      toast.success("Post deleted")
      setDeleteId(null)
      fetchPosts(activeTab, search, page)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete post"
      )
    }
  }

  function formatDate(date: Date | string | null) {
    if (!date) return "-"
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (posts.length === 0 && !search && activeTab === "all") {
    return (
      <div className="text-center py-16">
        <p className="text-[#f5f5f0] font-mono text-lg uppercase mb-2">
          No Posts Yet
        </p>
        <p className="text-[#888888] font-sans text-[15px] mb-6">
          Create your first blog post to share news and updates.
        </p>
        <Link
          href="/admin/blog/new"
          className="inline-block bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          New Post
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-0 border-b border-[#222222] mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`font-mono text-[13px] uppercase px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#f5f5f0] text-[#f5f5f0]"
                : "border-transparent text-[#888888] hover:text-[#f5f5f0]"
            }`}
          >
            {tab === "all" ? "All" : statusLabels[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]"
        />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-sm bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans pl-9 pr-3 py-2 outline-none focus:border-[#f5f5f0]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#555555] font-mono text-sm">
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#888888] font-sans text-[15px]">
            No posts match your filters.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#333]">
              <TableHead className="text-[#888] font-mono text-[11px] uppercase">
                Title
              </TableHead>
              <TableHead className="text-[#888] font-mono text-[11px] uppercase">
                Category
              </TableHead>
              <TableHead className="text-[#888] font-mono text-[11px] uppercase">
                Status
              </TableHead>
              <TableHead className="text-[#888] font-mono text-[11px] uppercase">
                Date
              </TableHead>
              <TableHead className="text-[#888] font-mono text-[11px] uppercase text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} className="border-[#333]">
                <TableCell className="text-[#f5f5f0] font-sans">
                  {post.title}
                </TableCell>
                <TableCell className="text-[#ccc] font-sans text-sm">
                  {post.categoryName || "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-mono uppercase ${
                      statusStyles[post.status ?? "draft"]
                    }`}
                  >
                    {statusLabels[post.status ?? "draft"]}
                  </span>
                </TableCell>
                <TableCell className="text-[#888] font-sans text-sm">
                  {post.status === "published"
                    ? formatDate(post.publishedAt)
                    : post.status === "scheduled"
                      ? formatDate(post.scheduledAt)
                      : formatDate(post.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteId(post.id)
                      setDeleteTitle(post.title)
                    }}
                    className="text-[#dc2626] font-mono text-sm uppercase transition-colors hover:text-[#ef4444]"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            type="button"
            onClick={() => fetchPosts(activeTab, search, Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1 text-[#888888] disabled:text-[#333333]"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-[11px] text-[#888888]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              fetchPosts(activeTab, search, Math.min(totalPages, page + 1))
            }
            disabled={page === totalPages}
            className="p-1 text-[#888888] disabled:text-[#333333]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

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
              Delete Post
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              This will permanently remove &quot;{deleteTitle}&quot; and its
              content. This cannot be undone.
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
