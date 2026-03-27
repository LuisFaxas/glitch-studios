export const dynamic = "force-dynamic"

import { getPackages, getServicesWithConfig } from "./actions"
import { AdminPackageManager } from "@/components/admin/admin-package-manager"

export default async function AdminPackagesPage() {
  const [packages, services] = await Promise.all([
    getPackages(),
    getServicesWithConfig(),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AdminPackageManager packages={packages} services={services} />
    </div>
  )
}
