import { ReviewRatingBar } from "./review-rating-bar"

interface ReviewRatingCardProps {
  ratings: {
    performance: number
    build: number
    value: number
    design: number
  }
  overall: number
}

export function ReviewRatingCard({ ratings, overall }: ReviewRatingCardProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Rating
      </h2>
      <div className="border border-[#222] bg-[#111] p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <ReviewRatingBar label="Performance" value={ratings.performance} delay={0.0} />
          <ReviewRatingBar label="Build Quality" value={ratings.build} delay={0.05} />
          <ReviewRatingBar label="Value" value={ratings.value} delay={0.1} />
          <ReviewRatingBar label="Design" value={ratings.design} delay={0.15} />
        </div>
        <div className="my-6 h-px w-full bg-[#222]" aria-hidden="true" />
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Overall
          </span>
          <span className="font-mono text-2xl font-bold text-[#f5f5f0] md:text-3xl">
            {overall.toFixed(1)} / 10
          </span>
        </div>
      </div>
    </section>
  )
}
