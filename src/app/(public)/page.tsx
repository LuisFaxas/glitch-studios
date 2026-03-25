import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center gap-8 px-4">
      <GlitchLogo size="lg" />
      <p className="text-lg text-gray-400 md:text-xl">
        Music. Video. Vision.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" size="lg" render={<Link href="/services" />}>
          Book a Session
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/beats" />}>
          Browse Beats
        </Button>
      </div>
    </div>
  )
}
