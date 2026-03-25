import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  return (
    <ScrollSection className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-white mb-12">
          What We Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="bg-gray-900 border-gray-800 rounded-lg p-6 hover:border-gray-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all duration-150"
            >
              <CardContent className="flex flex-col gap-4 p-0">
                <h3 className="font-mono font-bold text-xl text-white">
                  {service.name}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {service.shortDescription}
                </p>
                <p className="font-mono font-bold text-white">
                  {service.priceLabel}
                </p>
                <Button
                  variant="outline"
                  className="w-fit mt-2"
                  render={<Link href={`/services#${service.slug}`} />}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
