"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

type Service = {
  id: string
  name: string
  slug: string
  type: string
  description: string
  shortDescription: string
  priceLabel: string
  features: string[] | null
  ctaText: string | null
  sortOrder: number | null
  isActive: boolean | null
}

interface ServiceTabsProps {
  services: Service[]
}

export function ServiceTabs({ services }: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState<string | undefined>(
    services[0]?.slug
  )

  // Support deep-linking via URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && services.some((s) => s.slug === hash)) {
      setActiveTab(hash)
    }
  }, [services])

  if (services.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-400">No services available at the moment.</p>
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value as string)
        window.history.replaceState(null, "", `#${value}`)
      }}
    >
      <TabsList
        variant="line"
        className="w-full flex overflow-x-auto scrollbar-none mb-8"
      >
        {services.map((service) => (
          <TabsTrigger
            key={service.slug}
            value={service.slug}
            className="text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white px-4 py-2 whitespace-nowrap font-mono text-sm"
          >
            {service.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {services.map((service) => (
        <TabsContent key={service.slug} value={service.slug}>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 md:p-12">
            <h2 className="font-mono font-bold uppercase text-2xl md:text-3xl tracking-tight text-white mb-6">
              {service.name}
            </h2>

            <p className="text-white leading-relaxed mb-8 max-w-3xl">
              {service.description}
            </p>

            <p className="text-xl font-mono font-bold text-white mb-8" style={{ fontVariantNumeric: "tabular-nums" }}>
              {service.priceLabel}
            </p>

            {service.features && service.features.length > 0 && (
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <Check className="size-5 text-white shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="bg-gray-800 text-white border border-gray-600 px-8 py-3 hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
              render={<Link href={`/contact?service=${service.slug}`} />}
            >
              {service.ctaText || "Book Now"}
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
