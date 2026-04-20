import Link from "next/link"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"

type Service = {
  id: string
  name: string
  slug: string
  shortDescription: string
  priceLabel: string
}

interface ServicesOverviewProps {
  services: Service[]
}

export function ServicesOverview({ services }: ServicesOverviewProps) {
  if (services.length === 0) return null

  return (
    <ScrollSection className="py-16 md:py-24 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-mono font-bold uppercase text-2xl md:text-4xl tracking-tight text-[#f5f5f0] mb-12">
          <GlitchHeading text="What We Do">What We Do</GlitchHeading>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services#${service.slug}`}
              className="bg-[#111111] border border-[#222222] rounded-none p-4 md:p-6 hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors duration-200 group"
            >
              <div className="flex flex-col gap-2 md:gap-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-mono font-bold text-base md:text-xl text-[#f5f5f0]">
                    {service.name}
                  </h3>
                  <p className="font-mono font-bold text-sm text-[#f5f5f0] shrink-0">
                    {service.priceLabel}
                  </p>
                </div>
                <p className="text-[#888888] text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                  {service.shortDescription}
                </p>
                <span
                  className="border border-[#f5f5f0] bg-transparent text-[#f5f5f0] px-6 py-2 rounded-none font-mono text-sm uppercase tracking-[0.05em] group-hover:bg-[#f5f5f0] group-hover:text-[#000000] transition-colors duration-200 items-center w-fit hidden md:inline-flex"
                >
                  Learn More
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
