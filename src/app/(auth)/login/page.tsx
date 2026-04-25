import { Suspense } from "react"
import { getAvailableSocialProviders } from "@/lib/auth-providers"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const providers = getAvailableSocialProviders()
  return (
    <Suspense fallback={null}>
      <LoginForm availableProviders={providers} />
    </Suspense>
  )
}
