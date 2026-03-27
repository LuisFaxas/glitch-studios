import { NextRequest, NextResponse } from "next/server"
import { getAvailableDates } from "@/lib/booking/availability"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const serviceId = searchParams.get("serviceId")
  const month = searchParams.get("month")

  if (!serviceId || !month) {
    return NextResponse.json(
      { error: "Missing required parameters: serviceId, month" },
      { status: 400 }
    )
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Invalid month format. Expected YYYY-MM" },
      { status: 400 }
    )
  }

  try {
    const availableDates = await getAvailableDates(
      serviceId,
      new Date(`${month}-01`)
    )
    const dates = Object.fromEntries(availableDates)
    return NextResponse.json({ dates })
  } catch (error) {
    console.error("Failed to fetch available dates:", error)
    return NextResponse.json(
      { error: "Failed to fetch available dates" },
      { status: 500 }
    )
  }
}
