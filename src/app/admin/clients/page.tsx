export const dynamic = "force-dynamic"

import { getClients } from "@/actions/admin-clients"
import { ClientListTable } from "@/components/admin/client-list-table"

export default async function AdminClientsPage() {
  const { clients, totalPages } = await getClients({ page: 1 })

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Clients
        </h1>
      </div>

      <ClientListTable
        initialClients={clients}
        initialTotalPages={totalPages}
      />
    </div>
  )
}
