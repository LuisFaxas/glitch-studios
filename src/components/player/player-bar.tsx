"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Play,
  Pause,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { Waveform } from "@/components/player/waveform"
import ElasticSlider from "@/components/ui/ElasticSlider"

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function PlayerBar() {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    isMinimized,
    audioRef,
    toggle,
    seek,
    setMinimized,
  } = useAudioPlayer()

  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted, audioRef])

  const handleVolumeChange = useCallback(
    (v: number) => {
      setVolume(v)
      if (v > 0) setIsMuted(false)
    },
    [],
  )

  // Progress for waveform (0-1)
  const progress = duration > 0 ? currentTime / duration : 0

  function handleSeek(p: number) {
    if (duration > 0) seek(p * duration)
  }

  const shouldShow = currentBeat && !isMinimized
  const showMinimizedBar = currentBeat && isMinimized

  return (
    <>
      {/* Minimized restore bar */}
      <AnimatePresence>
        {showMinimizedBar && (
          <motion.button
            type="button"
            initial={{ y: 32 }}
            animate={{ y: 0 }}
            exit={{ y: 32 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setMinimized(false)}
            className="fixed left-0 right-0 z-40 flex items-center justify-center gap-2 h-8 bg-[#111111] border-t border-[#222222] bottom-[var(--tab-bar-height,0px)] md:bottom-0 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            <Maximize2 className="h-3 w-3 text-[#888888]" />
            <span className="font-mono text-[11px] text-[#888888] truncate max-w-[200px]">
              {currentBeat.title} — {currentBeat.artist}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full player bar */}
      <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 72 }}
          animate={{ y: 0 }}
          exit={{ y: 72 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed left-0 right-0 z-40 h-[72px] bg-[#111111] border-t border-[#222222] bottom-[var(--tab-bar-height,0px)] md:bottom-0"
        >
          {/* Desktop layout */}
          <div className="hidden md:flex items-center h-full px-4 gap-4">
            {/* Cover art */}
            {currentBeat.coverArtUrl ? (
              <img
                src={currentBeat.coverArtUrl}
                alt={`${currentBeat.title} cover`}
                className="h-12 w-12 rounded-none object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-none bg-[#222222] flex-shrink-0" />
            )}

            {/* Track info */}
            <div className="flex flex-col min-w-0 flex-shrink-0 max-w-[160px]">
              <span className="font-mono text-[15px] font-bold text-[#f5f5f0] truncate">
                {currentBeat.title}
              </span>
              <span className="font-sans text-[11px] font-normal text-[#888888] truncate">
                {currentBeat.artist}
              </span>
            </div>

            {/* Waveform — uses pre-computed peaks, no CORS fetch needed */}
            <div className="flex-1 min-w-0">
              <Waveform
                peaks={currentBeat.waveformPeaks}
                progress={progress}
                height={48}
                barWidth={3}
                barGap={1}
                barRadius={2}
                gradient
                gradientColors={{ from: "#f5f5f0", to: "#666660" }}
                gradientWaveColors={{ from: "#555555", to: "#333333" }}
                interactive
                onSeek={handleSeek}
              />
            </div>

            {/* Time display */}
            <span className="flex-shrink-0 min-w-[80px] text-right font-mono text-[13px] font-normal text-[#888888]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex-shrink-0 p-2 text-[#f5f5f0] hover:text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center flex-shrink-0 w-[140px] text-[#888888]">
              <ElasticSlider
                defaultValue={volume}
                startingValue={0}
                maxValue={100}
                onChange={handleVolumeChange}
                leftIcon={<VolumeX className="h-4 w-4" />}
                rightIcon={<Volume2 className="h-4 w-4" />}
              />
            </div>

            {/* License Beat CTA */}
            <button
              type="button"
              className="flex-shrink-0 px-4 py-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors rounded-none"
            >
              License Beat
            </button>

            {/* Minimize */}
            <button
              type="button"
              onClick={() => setMinimized(true)}
              aria-label="Minimize player"
              className="flex-shrink-0 p-2 text-[#888888] hover:text-[#f5f5f0] transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile layout */}
          <div className="flex flex-col md:hidden h-full">
            {/* Row 1: Cover art, track info + time, play/pause */}
            <div className="flex items-center px-3 gap-3" style={{ height: "36px" }}>
              {/* Cover art */}
              {currentBeat.coverArtUrl ? (
                <img
                  src={currentBeat.coverArtUrl}
                  alt={`${currentBeat.title} cover`}
                  className="h-10 w-10 rounded-none object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-none bg-[#222222] flex-shrink-0" />
              )}

              {/* Track info */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-mono text-[13px] font-bold text-[#f5f5f0] truncate">
                    {currentBeat.title}
                  </span>
                  <span className="font-mono text-[11px] font-normal text-[#888888] flex-shrink-0">
                    {formatTime(currentTime)}/{formatTime(duration)}
                  </span>
                </div>
                <span className="font-sans text-[10px] font-normal text-[#888888] truncate">
                  {currentBeat.artist}
                </span>
              </div>

              {/* Play/Pause */}
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex-shrink-0 p-2 text-[#f5f5f0] hover:text-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Row 2: Waveform strip - full width with 44px touch zone */}
            <div className="px-3 py-[10px]">
              <Waveform
                peaks={currentBeat.waveformPeaks}
                progress={progress}
                height={24}
                barRadius={1}
                gradient
                gradientColors={{ from: "#f5f5f0", to: "#a0a09a" }}
                interactive
                onSeek={handleSeek}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
