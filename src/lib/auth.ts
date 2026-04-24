import "server-only"
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
  trustedOrigins: [
    "http://localhost:3004",
    "http://192.168.1.122:3004",
    "http://100.123.116.23:3004",
    "https://glitch-studios.codebox.local",
    "https://glitchstudios.io",
    "https://www.glitchstudios.io",
    "https://glitchtech.io",
    "https://www.glitchtech.io",
  ],
  emailAndPassword: {
    enabled: true,
    // Phase 23 stub — Phase 24 (Email Delivery End-to-End) replaces this body with
    // a Resend call. CONTRACT (LOCKED for Phase 24 handoff): signature is
    //   sendResetPassword({ user, url, token }, request) => Promise<void>
    // - `user` contains the full DB user (email + name)
    // - `url` is fully constructed by Better Auth (includes callbackURL)
    // - `token` is the raw token (already embedded in `url`)
    // Phase 24: replace the console.log below with
    //   await resend.emails.send({ from, to: user.email, subject,
    //     react: <ResetPasswordEmail url={url} name={user.name} /> })
    // DO NOT CHANGE the function signature or surrounding config.
    sendResetPassword: async ({ user, url }) => {
      console.log(
        `[Phase 23 stub] Password reset requested for ${user.email}. Reset URL: ${url}`,
      )
    },
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
