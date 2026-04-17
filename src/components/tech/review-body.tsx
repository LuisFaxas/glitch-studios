interface ReviewBodyProps {
  sanitizedHtml: string
}

export function ReviewBody({ sanitizedHtml }: ReviewBodyProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div
        className="review-body prose prose-invert max-w-3xl font-sans text-[15px] leading-relaxed text-[#f5f5f0]"
        // eslint-disable-next-line react/no-danger -- html sanitized server-side via sanitizeReviewBody()
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </section>
  )
}
