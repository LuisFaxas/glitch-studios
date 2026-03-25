"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import WaveSurfer from "wavesurfer.js"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { MidiPianoRoll } from "@/components/beats/midi-piano-roll"
import { LicenseModal } from "@/components/beats/license-modal"
import type { BeatSummary } from "@/types/beats"

interface BeatDetailPanelProps {
  beat: BeatSummary
}

export function BeatDetailPanel({ beat }: BeatDetailPanelProps) {
  const { currentBeat, audioRef } = useAudioPlayer()
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)

  const isCurrentBeat = currentBeat?.id === beat.id

  // Create WaveSurfer for the detail panel waveform display
  useEffect(() => {
    if (
      !isCurrentBeat ||
      !beat.previewAudioUrl ||
      !waveformContainerRef.current ||
      !audioRef.current
    )
      return

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
      wavesurferRef.current = null
    }

    const ws = WaveSurfer.create({
      container: waveformContainerRef.current,
      waveColor: "#555555",
      progressColor: "#f5f5f0",
      height: 40,
      barWidth: 2,
      barGap: 1,
      cursorWidth: 0,
      normalize: true,
      interact: false,
      media: audioRef.current,
    })

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [isCurrentBeat, beat.previewAudioUrl, audioRef])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden bg-[#0a0a0a] border-t border-[#222]"
    >
      <div className="flex flex-col gap-6 px-4 py-6">
        {/* Exclusive badge */}
        {beat.status === "sold_exclusive" && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#555] border border-[#333] px-2 py-0.5">
              Exclusive SOLD
            </span>
          </div>
        )}

        {/* Waveform */}
        <div>
          {isCurrentBeat && beat.previewAudioUrl ? (
            <div
              ref={waveformContainerRef}
              className="h-10 w-full"
            />
          ) : (
            <div className="flex h-10 items-center justify-center border border-[#222] bg-[#111]">
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
                Play to see waveform
              </span>
            </div>
          )}
        </div>

        {/* MIDI tracks */}
        {beat.midiFileUrl && (
          <MidiPianoRoll midiFileUrl={beat.midiFileUrl} />
        )}

        {/* Description */}
        {beat.description && (
          <p className="text-[15px] text-[#888] font-sans leading-[1.5]">
            {beat.description}
          </p>
        )}

        {/* License CTA */}
        <div>
          <button
            type="button"
            onClick={() => setLicenseModalOpen(true)}
            className="cursor-pointer bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-3 rounded-none transition-opacity hover:opacity-90"
          >
            License Beat
          </button>
        </div>
      </div>

      {/* License Modal */}
      <LicenseModal
        beat={beat}
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
      />
    </motion.div>
  )
}
