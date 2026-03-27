export const dynamic = "force-dynamic"

import { getTestimonials } from "@/actions/admin-content"
import { AdminTestimonialTable } from "@/components/admin/admin-testimonial-table"

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Testimonials
        </h1>
      </div>
      <AdminTestimonialTable testimonials={testimonials} />
    </div>
  )
}
