interface ReviewProsConsProps {
  pros: string[]
  cons: string[]
}

export function ReviewProsCons({ pros, cons }: ReviewProsConsProps) {
  if (pros.length === 0 && cons.length === 0) return null
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Pros &amp; Cons
      </h2>
      <div className="grid grid-cols-1 gap-px bg-[#222] md:grid-cols-2">
        <div className="bg-[#111] p-6">
          <h3 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Pros</h3>
          <ul className="flex flex-col gap-2">
            {pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
                <span className="font-mono font-bold text-[#f5f5f0]" aria-hidden="true">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#111] p-6">
          <h3 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Cons</h3>
          <ul className="flex flex-col gap-2">
            {cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
                <span className="font-mono font-bold text-[#dc2626]" aria-hidden="true">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
