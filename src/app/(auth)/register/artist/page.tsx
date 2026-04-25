import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"
import { ArtistRequestForm } from "./artist-request-form"

export default async function ArtistRegisterPage() {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))
  return <ArtistRequestForm brand={brand} />
}
