import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"
import { Resend } from "resend"
import { db } from "./db"
import * as schema from "@/db/schema"
import { PasswordResetEmail } from "@/lib/email/password-reset"
import { AccountVerificationEmail } from "@/lib/email/account-verification"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = "Glitch Studios <noreply@glitchstudios.io>"

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
    sendResetPassword: async ({ user, url }) => {
      try {
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Reset your Glitch Studios password",
          react: PasswordResetEmail({ name: user.name, url }),
        })
        if (error) {
          console.error("[email:reset] Resend send failed:", error)
        }
      } catch (err) {
        console.error("[email:reset] Unexpected error:", err)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Verify your Glitch Studios email",
          react: AccountVerificationEmail({ name: user.name, url }),
        })
        if (error) {
          console.error("[email:verify] Resend send failed:", error)
        }
      } catch (err) {
        console.error("[email:verify] Unexpected error:", err)
      }
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
