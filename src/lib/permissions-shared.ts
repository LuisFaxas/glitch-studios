export type Permission =
  | "manage_content"
  | "manage_media"
  | "view_clients"
  | "send_newsletters"
  | "manage_bookings"
  | "manage_settings"
  | "manage_roles"
  | "reply_messages"

export const ALL_PERMISSIONS: Permission[] = [
  "manage_content",
  "manage_media",
  "view_clients",
  "send_newsletters",
  "manage_bookings",
  "manage_settings",
  "manage_roles",
  "reply_messages",
]
