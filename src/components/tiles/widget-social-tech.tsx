export function WidgetSocialTech() {
  return (
    <div className="col-span-2 flex gap-1">
      {["Instagram", "YouTube", "X", "SoundCloud"].map((platform) => (
        <div
          key={platform}
          className="flex flex-1 aspect-square flex-col items-center justify-center border border-[#222222] bg-[#0a0a0a] text-[#444444]"
          aria-label={`${platform} — coming soon`}
        >
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em]">
            Soon
          </span>
        </div>
      ))}
    </div>
  )
}
