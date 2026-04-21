interface VideoCardPlaceholderProps {
  title: string
}

export function VideoCardPlaceholder({ title }: VideoCardPlaceholderProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: [
          "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
          "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
        ].join(", "),
      }}
    >
      <h3 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-center line-clamp-3 text-[clamp(18px,3vw,28px)] leading-[1.1]">
        {title}
      </h3>
    </div>
  )
}
