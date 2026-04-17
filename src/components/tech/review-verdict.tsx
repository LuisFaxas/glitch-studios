interface ReviewVerdictProps {
  text: string
}

export function ReviewVerdict({ text }: ReviewVerdictProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="border border-[#222] bg-[#111] p-6 md:p-10">
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Verdict
        </p>
        <p className="font-sans text-lg leading-relaxed text-[#f5f5f0] md:text-xl">
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </section>
  )
}
