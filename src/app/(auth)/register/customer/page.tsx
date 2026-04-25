import { Suspense } from "react"
import { getAvailableSocialProviders } from "@/lib/auth-providers"
import { getCustomerJoinStats } from "@/lib/auth-stats"
import { CustomerWizard } from "./customer-wizard"

export default async function CustomerRegisterPage() {
  const providers = getAvailableSocialProviders()
  const stats = await getCustomerJoinStats()
  return (
    <Suspense fallback={null}>
      <CustomerWizard availableProviders={providers} stats={stats} />
    </Suspense>
  )
}
