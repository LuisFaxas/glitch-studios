"use client"

import { useState, type FormEvent } from "react"
import { ScrollSection } from "@/components/home/scroll-section"

export function TechNewsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setStatus("submitting")
    setTimeout(() => {
      setStatus("success")
      setEmail("")
    }, 400)
  }

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
          Get Tech Reviews in Your Inbox
        </h2>
        <p className="mx-auto mt-3 font-sans text-[15px] leading-relaxed text-[#888]">
          Weekly reviews, benchmarks, and deep dives.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 md:flex-row"
          aria-label="Join the Tech newsletter"
        >
          <label htmlFor="tech-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="tech-newsletter-email"
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status !== "idle"}
            className="flex-1 border border-[#222] bg-[#111] px-4 py-3 font-sans text-[14px] text-[#f5f5f0] outline-none placeholder:text-[#444] focus:border-[#f5f5f0]"
          />
          <button
            type="submit"
            disabled={status !== "idle"}
            className="border border-[#f5f5f0] bg-[#f5f5f0] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#000000] transition-colors duration-200 hover:bg-transparent hover:text-[#f5f5f0] disabled:opacity-50"
          >
            {status === "success" ? "Subscribed ✓" : "Join the Tech List"}
          </button>
        </form>
        {status === "success" && (
          <p
            className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[#f5f5f0]"
            role="status"
          >
            Added — you&apos;ll hear from us soon.
          </p>
        )}
      </div>
    </ScrollSection>
  )
}
