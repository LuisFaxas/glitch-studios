import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL,
  sessionOptions: {
    // The rankings page mounts useSession() in the shell. better-auth defaults
    // to refetching on every visibilitychange, which can re-render the shell
    // during Safari's wake/focus/style recovery path.
    refetchOnWindowFocus: false,
  },
  plugins: [adminClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
