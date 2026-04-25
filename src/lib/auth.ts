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
import { ArtistApprovalInviteEmail } from "@/lib/email/artist-approval-invite"

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

// Phase 26 — conditional social providers.
// Build the providers object at module load time, only registering a
// provider when both env vars are present. Buttons in the UI also hide
// when a provider isn't registered (see src/lib/auth-providers.ts).
//
// CRITICAL naming: AUTH-22 specifies env vars META_CLIENT_ID/SECRET, but
// Better Auth's provider config key is `facebook` (covers FB + IG).
const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]> = {}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }
}
if (process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) {
  socialProviders.facebook = {
    clientId: process.env.META_CLIENT_ID,
    clientSecret: process.env.META_CLIENT_SECRET,
  }
}

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
      const isInvite = url.includes("invite=1")
      const brand: "studios" | "tech" = url.includes("brand=tech")
        ? "tech"
        : "studios"
      try {
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: isInvite
            ? "You're approved — set your password."
            : "Reset your Glitch Studios password",
          react: isInvite
            ? ArtistApprovalInviteEmail({
                name: user.name ?? "there",
                url,
                brand,
              })
            : PasswordResetEmail({ name: user.name, url }),
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
  socialProviders,
  account: {
    accountLinking: {
      enabled: false, // AUTH-23 — surfaces conflicts as account_not_linked error
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
