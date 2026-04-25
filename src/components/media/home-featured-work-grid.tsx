import Link from "next/link"
import { getHomeFeatureMedia } from "@/lib/media/queries"
import { MediaEmbed } from "./media-embed"
import { GlitchHeading } from "@/components/ui/glitch-heading"

/**
 * Home "Our Work" — 3-up grid of admin-pinned home_feature videos.
 *
 * Per CONTEXT D-12: when no home_feature rows exist, this returns null
 * and the home page reflows naturally. Do NOT render placeholder slots.
 *
 * Per CONTEXT D-09/D-10: 3-up on desktop, 1-stacked on mobile, 2-up tablet.
 * Per UI-SPEC: H2 "Our Work" wrapped in GlitchHeading (hover-glitch site rule).
 */
export async function HomeFeaturedWorkGrid() {
  const items = await getHomeFeatureMedia()

  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="home-featured-work-heading"
      className="border-t border-[#1a1a1a] py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2
          id="home-featured-work-heading"
          className="mb-4 font-mono text-2xl font-bold uppercase tracking-tight text-[#f5f5f0]"
        >
          <GlitchHeading text="Our Work">Our Work</GlitchHeading>
        </h2>
        <p className="mb-12 text-sm text-[#888]">
          Selected videos from the studio.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => (
            <article key={item.id} className="bg-[#111] border border-[#222]">
              <MediaEmbed
                externalId={item.externalId}
                title={item.title ?? "Glitch Studios video"}
                thumbnailUrl={item.thumbnailUrl}
              />
              <div className="p-4">
                <h3 className="font-mono text-lg font-bold uppercase text-[#f5f5f0]">
                  <GlitchHeading text={item.title ?? "Untitled"}>
                    {item.title ?? "Untitled"}
                  </GlitchHeading>
                </h3>
                {item.description && (
                  <p className="mt-2 text-sm text-[#888] line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:mt-16">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 border border-[#222] px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#f5f5f0] transition-colors hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#0a0a0a]"
          >
            See all work →
          </Link>
        </div>
      </div>
    </section>
  )
}
