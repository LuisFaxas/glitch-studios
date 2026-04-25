import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"
import { getArtistJoinStats } from "@/lib/auth-stats"
import { ArtistRequestForm } from "./artist-request-form"

export default async function ArtistRegisterPage() {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))
  const stats = await getArtistJoinStats()
  return <ArtistRequestForm brand={brand} stats={stats} />
}
