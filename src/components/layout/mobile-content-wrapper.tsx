"use client"

import { useAudioPlayer } from "@/components/player/audio-player-provider"
import clsx from "clsx"

export function MobileContentWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  const { currentBeat, isMinimized } = useAudioPlayer()
  // Player is visually active when a beat is loaded AND not minimized
  const playerActive = !!currentBeat && !isMinimized

  return (
    <main
      className={clsx(
        "page-content flex-1 min-w-0 min-h-screen overflow-x-hidden",
        "transition-[padding-bottom] duration-200 ease-out",
        "md:pb-0",
        playerActive
          ? "pb-[calc(var(--tab-bar-height)+var(--spacing-player)+env(safe-area-inset-bottom))]"
          : "pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </main>
  )
}
