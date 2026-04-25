import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Glitch Studios accounts and licensing.",
}

export default function TermsPage() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl px-6 py-16 font-sans">
      <header className="not-prose flex flex-col gap-3 border-b border-[#222] pb-6 mb-10">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Glitch Studios — Legal
        </span>
        <h1 className="font-mono text-[28px] uppercase tracking-[0.04em] font-semibold text-[#f5f5f0]">
          Terms of Service
        </h1>
        <p className="text-[14px] text-[var(--muted-foreground)]">
          Working draft — final terms ship at v4.0 launch. Last updated 2026-04-25.
        </p>
      </header>

      <p>
        These Terms of Service govern your use of Glitch Studios (the
        &ldquo;Service&rdquo;), including beat licensing, studio bookings, and
        related products operated by Glitch Studios.
      </p>

      <h2>1. Account</h2>
      <p>
        You agree to provide accurate information when you register and to
        keep your credentials confidential. You can delete your account at
        any time from your dashboard.
      </p>

      <h2>2. Beat licensing</h2>
      <p>
        Beat licenses are granted at the tier you purchase (MP3 lease, WAV
        lease, stems, unlimited, or exclusive). License terms are documented
        on the license PDF emailed at purchase. Refunds are not available
        once a license PDF or download has been delivered.
      </p>

      <h2>3. Studio bookings</h2>
      <p>
        Booking deposits are non-refundable inside the cancellation window
        documented at checkout. Beyond that window, cancellations follow the
        room&rsquo;s refund policy (full / partial / none).
      </p>

      <h2>4. Conduct</h2>
      <p>
        You agree not to misuse the Service, including reselling licenses
        you don&rsquo;t own, scraping the catalog, or harassing other
        members. We reserve the right to suspend accounts that violate this.
      </p>

      <h2>5. Disclaimer & liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo;. To the maximum extent
        permitted by law, Glitch Studios is not liable for indirect,
        incidental, or consequential damages.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update these terms. Continued use after a change constitutes
        acceptance of the new terms. Material changes will be emailed to
        active accounts.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions: <Link href="/contact" className="underline">contact us</Link>.
      </p>
    </article>
  )
}
