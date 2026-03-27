import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/booking/slots"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const serviceId = searchParams.get("serviceId")
  const date = searchParams.get("date")

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: serviceId, date" },
      { status: 400 }
    )
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format. Expected YYYY-MM-DD" },
      { status: 400 }
    )
  }

  try {
    const slots = await getAvailableSlots(serviceId, date)
    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Failed to fetch available slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    )
  }
}
