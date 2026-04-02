import Link from "next/link"
import { ScrollSection } from "@/components/home/scroll-section"

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
          What We Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#111111] border border-[#222222] rounded-none p-6 hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors duration-200"
            >
              <div className="flex flex-col gap-4">
                <h3 className="font-mono font-bold text-xl text-[#f5f5f0]">
                  {service.name}
                </h3>
                <p className="text-[#888888] leading-relaxed">
                  {service.shortDescription}
                </p>
                <p className="font-mono font-bold text-[#f5f5f0]">
                  {service.priceLabel}
                </p>
                <Link
                  href={`/services#${service.slug}`}
                  className="border border-[#f5f5f0] bg-transparent text-[#f5f5f0] px-6 py-2 rounded-none font-mono text-sm uppercase tracking-[0.05em] hover:bg-[#f5f5f0] hover:text-[#000000] transition-colors duration-200 inline-flex items-center w-fit mt-2"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
