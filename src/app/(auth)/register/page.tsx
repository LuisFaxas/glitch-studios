import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"
import { RegisterRoleSelect } from "./register-role-select"

export default async function RegisterPage() {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))
  return <RegisterRoleSelect brand={brand} />
}
