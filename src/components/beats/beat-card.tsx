"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Music } from "lucide-react"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { Waveform } from "@/components/player/waveform"
import { LicenseModal } from "@/components/beats/license-modal"
import { Badge } from "@/components/ui/badge"
import type { BeatSummary } from "@/types/beats"

export function BeatCard({ beat, variant = "compact" }: { beat: BeatSummary; variant?: "compact" | "large" }) {
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)
  const { currentBeat, isPlaying, currentTime, duration, play, pause, seek } = useAudioPlayer()
  const isCurrentBeat = currentBeat?.id === beat.id
  const isActivePlaying = isCurrentBeat && isPlaying
  const progress = isCurrentBeat && duration > 0 ? currentTime / duration : 0
  const isCompact = variant !== "large"

  function handleWaveformSeek(p: number) {
    if (!beat.previewAudioUrl) return
    if (!isCurrentBeat) {
      play({
        id: beat.id,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
    if (duration > 0) seek(p * duration)
  }

  const lowestPrice = beat.pricing
    .filter((p) => p.isActive)
    .sort((a, b) => Number(a.price) - Number(b.price))[0]

  const isSoldExclusive = beat.status === "sold_exclusive"

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation()
    if (!beat.previewAudioUrl) return

    if (isActivePlaying) {
      pause()
    } else {
      play({
        id: beat.id,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
  }

  return (
    <div
      data-testid="beat-card"
      className={`group relative overflow-hidden border border-[#222] bg-[#111] transition-colors hover:border-[#444] hover:bg-[#1a1a1a] ${
        isSoldExclusive ? "opacity-40" : ""
      }`}
    >
      {/* Glitch hover overlay */}
      {!isSoldExclusive && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
          aria-hidden="true"
        />
      )}
      {/* Cover art section */}
      <div className={`relative ${isCompact ? "aspect-[4/3]" : "aspect-square"}`}>
        {beat.coverArtUrl ? (
          <Image
            src={beat.coverArtUrl}
            alt={beat.title}
            fill
            className="object-cover"
            sizes={isCompact
              ? "(min-width:1280px)20vw,(min-width:1024px)25vw,(min-width:768px)33vw,50vw"
              : "(min-width:1024px)33vw,(min-width:768px)50vw,100vw"
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#222]">
            <Music className="h-6 w-6 text-[#555]" />
          </div>
        )}

        {/* Play overlay - only render when audio is available */}
        {beat.previewAudioUrl && (
          <button
            type="button"
            data-testid="beat-card-play"
            onClick={handlePlay}
            aria-label={
              isActivePlaying
                ? `Pause ${beat.title}`
                : `Play ${beat.title}`
            }
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          >
            {isActivePlaying ? (
              <Pause className={isCompact ? "h-8 w-8 text-white" : "h-12 w-12 text-white"} />
            ) : (
              <Play className={isCompact ? "h-8 w-8 text-white" : "h-12 w-12 text-white"} />
            )}
          </button>
        )}
      </div>

      {/* Waveform strip */}
      <div className={isCompact ? "px-2 pt-2" : "px-4 pt-3"}>
        <Waveform
          peaks={beat.waveformPeaks}
          progress={progress}
          height={isCompact ? 20 : 28}
          barRadius={1}
          gradient
          gradientColors={{ from: "#f5f5f0", to: "#a0a09a" }}
          gradientWaveColors={{ from: "#555555", to: "#333333" }}
          interactive
          onSeek={handleWaveformSeek}
        />
      </div>

      {/* Info section */}
      <div
        data-testid="beat-card-info"
        className={`cursor-pointer ${isCompact ? "px-2 py-2" : "p-4"}`}
        onClick={
          isSoldExclusive ? undefined : () => setLicenseModalOpen(true)
        }
        onKeyDown={
          isSoldExclusive
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setLicenseModalOpen(true)
                }
              }
        }
        role={isSoldExclusive ? undefined : "button"}
        tabIndex={isSoldExclusive ? undefined : 0}
      >
        {/* Row 1: Title + Price */}
        <div className="flex items-baseline justify-between gap-2">
          <span className={`truncate font-mono font-bold text-[#f5f5f0] ${isCompact ? "text-[13px]" : "text-[15px]"}`}>
            {beat.title}
          </span>
          {lowestPrice && (
            <span className={`shrink-0 font-mono font-bold text-[#f5f5f0] ${isCompact ? "text-[13px]" : "text-[15px]"}`}>
              FROM ${Number(lowestPrice.price).toFixed(0)}
            </span>
          )}
        </div>

        {/* Row 2: Producer name */}
        <span className="block truncate font-sans text-[11px] text-[#888]">
          {beat.producers[0]?.name ?? "Glitch Studios"}
        </span>

        {/* Row 3: Metadata badges */}
        <div className={`flex flex-wrap gap-1 ${isCompact ? "mt-1" : "mt-2"}`}>
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">
            {beat.genre}
          </Badge>
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">
            {beat.bpm} BPM
          </Badge>
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">
            {beat.key}
          </Badge>
        </div>

        {/* Row 4: Mood tags (hidden in compact) */}
        {!isCompact && beat.moods && beat.moods.length > 0 && (
          <span className="mt-1 block font-sans text-[11px] text-[#888]">
            {beat.moods.slice(0, 2).join(", ")}
          </span>
        )}
      </div>

      {/* License modal */}
      <LicenseModal
        beat={beat}
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
      />
    </div>
  )
}
