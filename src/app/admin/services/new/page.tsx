export const dynamic = "force-dynamic"

import { ServicePageForm } from "@/components/admin/service-page-form"

export default function NewServicePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        New Service
      </h1>
      <ServicePageForm />
    </div>
  )
}
