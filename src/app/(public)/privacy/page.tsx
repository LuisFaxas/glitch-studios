import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Glitch Studios collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl px-6 py-16 font-sans">
      <header className="not-prose flex flex-col gap-3 border-b border-[#222] pb-6 mb-10">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Glitch Studios — Legal
        </span>
        <h1 className="font-mono text-[28px] uppercase tracking-[0.04em] font-semibold text-[#f5f5f0]">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-[var(--muted-foreground)]">
          Working draft — final policy ships at v4.0 launch. Last updated 2026-04-25.
        </p>
      </header>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account info:</strong> name, email, password (hashed), and the
          newsletter preferences you choose at signup.
        </li>
        <li>
          <strong>Activity:</strong> beats you preview / license, sessions you
          book, downloads you trigger.
        </li>
        <li>
          <strong>Payment:</strong> handled by Stripe and (where enabled) PayPal.
          We never store your full card number.
        </li>
        <li>
          <strong>Email engagement:</strong> open / click signals from Resend so
          we know which messages are hitting and which to retire.
        </li>
      </ul>

      <h2>What we don&rsquo;t do</h2>
      <ul>
        <li>We don&rsquo;t sell or rent your address.</li>
        <li>We don&rsquo;t share your data with advertisers.</li>
        <li>
          We don&rsquo;t use third-party analytics that profile you across the
          web.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use first-party cookies for sign-in sessions and cart persistence.
        No third-party tracking pixels.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>Export your data from the dashboard.</li>
        <li>
          Delete your account from the dashboard. License PDFs you&rsquo;ve
          received remain valid.
        </li>
        <li>Unsubscribe from any newsletter in one click — link in every email.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions: <Link href="/contact" className="underline">contact us</Link>.
      </p>
    </article>
  )
}
