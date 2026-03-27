import { unsubscribe } from "@/actions/newsletter"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>
}) {
  const { email, token } = await searchParams

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4">
        <div className="max-w-md text-center">
          <h1
            className="mb-4 font-mono text-xl font-bold uppercase tracking-wider text-[#f5f5f0]"
          >
            Invalid Link
          </h1>
          <p className="mb-8 text-[15px] text-[#888]">
            This unsubscribe link is invalid or incomplete.
          </p>
          <Link
            href="/"
            className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f5f5f0] underline"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  const result = await unsubscribe(decodeURIComponent(email), token)

  if (!result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4">
        <div className="max-w-md text-center">
          <h1
            className="mb-4 font-mono text-xl font-bold uppercase tracking-wider text-[#f5f5f0]"
          >
            Invalid Link
          </h1>
          <p className="mb-8 text-[15px] text-[#888]">
            {result.message}
          </p>
          <Link
            href="/"
            className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f5f5f0] underline"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4">
      <div className="max-w-md text-center">
        <h1
          className="mb-4 font-mono text-xl font-bold uppercase tracking-wider text-[#f5f5f0]"
        >
          Unsubscribed
        </h1>
        <p className="mb-8 text-[15px] text-[#888]">
          You have been unsubscribed from Glitch Studios newsletter.
        </p>
        <Link
          href="/"
          className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f5f5f0] underline"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
