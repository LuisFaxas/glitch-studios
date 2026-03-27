export const dynamic = "force-dynamic"

import { getRooms } from "./actions"
import { AdminRoomManager } from "@/components/admin/admin-room-manager"

export default async function AdminRoomsPage() {
  const rooms = await getRooms()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AdminRoomManager rooms={rooms} />
    </div>
  )
}
