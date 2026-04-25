import { Suspense } from "react"
import { getAvailableSocialProviders } from "@/lib/auth-providers"
import { CustomerWizard } from "./customer-wizard"

export default function CustomerRegisterPage() {
  const providers = getAvailableSocialProviders()
  return (
    <Suspense fallback={null}>
      <CustomerWizard availableProviders={providers} />
    </Suspense>
  )
}
