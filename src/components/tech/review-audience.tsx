interface ReviewAudienceProps {
  audienceFor: string | null
  audienceNotFor: string | null
}

export function ReviewAudience({ audienceFor, audienceNotFor }: ReviewAudienceProps) {
  if (!audienceFor && !audienceNotFor) return null
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Who It&apos;s For
      </h2>
      <div className="grid grid-cols-1 gap-px bg-[#222] md:grid-cols-2">
        {audienceFor && (
          <div className="bg-[#111] p-6">
            <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Who it&apos;s for</h3>
            <p className="font-sans text-[15px] leading-relaxed text-[#f5f5f0]">{audienceFor}</p>
          </div>
        )}
        {audienceNotFor && (
          <div className="bg-[#111] p-6">
            <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Who it&apos;s not for</h3>
            <p className="font-sans text-[15px] leading-relaxed text-[#f5f5f0]">{audienceNotFor}</p>
          </div>
        )}
      </div>
    </section>
  )
}
