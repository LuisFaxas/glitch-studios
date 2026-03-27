import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"
import { db } from "./db"
import * as schema from "@/db/schema"

const ac = createAccessControl(defaultStatements)
const ownerAc = ac.newRole({
  user: [
    "create", "list", "set-role", "ban", "impersonate",
    "impersonate-admins", "delete", "set-password", "get", "update",
  ],
  session: ["list", "revoke", "delete"],
})

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["owner", "admin"],
      roles: {
        owner: ownerAc,
        admin: adminAc,
      },
    }),
  ],
})
