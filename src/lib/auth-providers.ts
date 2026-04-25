import "server-only"

export type SocialProvider = "google" | "github" | "facebook"

/**
 * Returns the list of social providers that have BOTH env vars set.
 * Server-only — reads process.env directly.
 *
 * Consumed by `(auth)/login/page.tsx` and `(auth)/register/customer/page.tsx`
 * (server components) which pass the result as a prop to `<SocialAuthRow>`.
 */
export function getAvailableSocialProviders(): SocialProvider[] {
  const providers: SocialProvider[] = []
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) providers.push("google")
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) providers.push("github")
  if (process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) providers.push("facebook")
  return providers
}
