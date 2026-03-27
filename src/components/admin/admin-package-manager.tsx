"use client"

import { useState, useTransition } from "react"
import {
  createPackage,
  updatePackage,
  deletePackage,
} from "@/app/admin/packages/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface PackageRow {
  id: string
  serviceId: string
  name: string
  sessionCount: number
  discountPercent: number
  isActive: boolean | null
  createdAt: Date
  serviceName: string
}

interface ServiceOption {
  id: string
  name: string
}

export function AdminPackageManager({
  packages,
  services,
}: {
  packages: PackageRow[]
  services: ServiceOption[]
}) {
  const [editPkg, setEditPkg] = useState<PackageRow | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditPkg(null)
    setIsOpen(true)
  }

  function openEdit(pkg: PackageRow) {
    setEditPkg(pkg)
    setIsOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editPkg) {
          await updatePackage(editPkg.id, formData)
          toast.success("Package updated")
        } else {
          await createPackage(formData)
          toast.success("Package created")
        }
        setIsOpen(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save package"
        )
      }
    })
  }

  function handleDelete() {
    if (!editPkg) return
    if (!confirm("Delete this package? This cannot be undone.")) return
    startTransition(async () => {
      try {
        await deletePackage(editPkg.id)
        toast.success("Package deleted")
        setIsOpen(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete package"
        )
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Session Packages
        </h1>
        <button
          onClick={openCreate}
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2"
        >
          + Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="text-[#888] font-mono text-sm space-y-2">
          <p>No packages configured.</p>
          <p className="text-[#555] text-[11px]">
            Examples: "4-Session Pack" 15% off, "8-Session Pack" 25% off,
            "12-Session Pack" 30% off
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#222]">
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                Service
              </TableHead>
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                Package Name
              </TableHead>
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                Sessions
              </TableHead>
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                Discount %
              </TableHead>
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888]">
                Active
              </TableHead>
              <TableHead className="font-mono text-[13px] font-bold uppercase text-[#888] w-24">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id} className="border-[#222]">
                <TableCell className="font-mono text-sm text-[#f5f5f0]">
                  {pkg.serviceName}
                </TableCell>
                <TableCell className="font-mono text-sm text-[#f5f5f0]">
                  {pkg.name}
                </TableCell>
                <TableCell className="font-mono text-sm text-[#f5f5f0]">
                  {pkg.sessionCount}
                </TableCell>
                <TableCell className="font-mono text-sm text-[#f5f5f0]">
                  {pkg.discountPercent}%
                </TableCell>
                <TableCell>
                  <span
                    className={`font-mono text-[11px] uppercase px-2 py-0.5 ${
                      pkg.isActive
                        ? "bg-[#222] text-[#f5f5f0]"
                        : "bg-[#222] text-[#555]"
                    }`}
                  >
                    {pkg.isActive ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openEdit(pkg)}
                    className="text-[#f5f5f0] font-mono text-[11px] uppercase font-bold mr-3 hover:underline"
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#000] border border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold text-[20px] uppercase text-[#f5f5f0]">
              {editPkg ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription className="text-[#888] text-sm">
              {editPkg
                ? "Update package details."
                : "Create a new session package with discount pricing."}
            </DialogDescription>
          </DialogHeader>
          <PackageForm
            pkg={editPkg}
            services={services}
            onSubmit={handleSubmit}
            onDelete={editPkg ? handleDelete : undefined}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PackageForm({
  pkg,
  services,
  onSubmit,
  onDelete,
  isPending,
}: {
  pkg: PackageRow | null
  services: ServiceOption[]
  onSubmit: (formData: FormData) => void
  onDelete?: () => void
  isPending: boolean
}) {
  const [isActive, setIsActive] = useState(pkg?.isActive ?? true)

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Service *
        </Label>
        <select
          name="serviceId"
          required
          defaultValue={pkg?.serviceId ?? ""}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
        >
          <option value="">Select a service...</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          Package Name *
        </Label>
        <input
          name="name"
          required
          defaultValue={pkg?.name ?? ""}
          className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          placeholder="4-Session Pack"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Session Count *
          </Label>
          <input
            name="sessionCount"
            type="number"
            min="2"
            required
            defaultValue={pkg?.sessionCount ?? 4}
            className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          />
        </div>
        <div>
          <Label className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Discount %
          </Label>
          <input
            name="discountPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={pkg?.discountPercent ?? 15}
            className="w-full mt-1 px-3 py-2 bg-[#000] border border-[#333] text-[#f5f5f0] font-mono text-sm focus:border-[#f5f5f0] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          id="pkg-active"
        />
        <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
        <Label htmlFor="pkg-active" className="font-mono text-[13px] text-[#f5f5f0]">
          {isActive ? "Active" : "Inactive"}
        </Label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Package"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="text-[#dc2626] font-mono font-bold text-sm uppercase px-4 py-2 border border-[#dc2626] disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
