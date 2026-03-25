import { BeatForm } from "@/components/admin/beats/beat-form"

export default function NewBeatPage() {
  return (
    <div className="p-6 max-w-[640px] mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        New Beat
      </h1>
      <BeatForm mode="create" />
    </div>
  )
}
