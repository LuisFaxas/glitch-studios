import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))

  return (
    <div data-brand={brand} className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
}
