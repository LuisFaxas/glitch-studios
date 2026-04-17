import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Glitch Tech",
  description: "About the Glitch Tech product review vertical.",
}

export default function TechAboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-7xl px-4 py-24">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-4xl">
          About Glitch Tech
        </h1>
        <p className="mt-4 font-sans text-sm text-[#888]">
          Glitch Tech is the product review vertical of Glitch Studios.
          Detailed copy to be written in a future phase.
        </p>
      </section>
    </main>
  )
}
