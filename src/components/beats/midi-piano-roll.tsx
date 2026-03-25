"use client"

import { useEffect, useState } from "react"
import { Midi } from "@tonejs/midi"

interface MidiPianoRollProps {
  midiFileUrl: string
}

interface ParsedTrack {
  name: string
  notes: { time: number; duration: number; velocity: number }[]
}

const TRACK_LABELS: Record<string, string> = {
  kick: "KICK",
  bass: "BASS",
  snare: "SNARE",
  hihat: "HI-HAT",
  "hi-hat": "HI-HAT",
  hat: "HI-HAT",
  clap: "CLAP",
  melody: "MELODY",
  lead: "LEAD",
  pad: "PAD",
  synth: "SYNTH",
  piano: "PIANO",
  guitar: "GUITAR",
  strings: "STRINGS",
  808: "808",
  perc: "PERC",
  percussion: "PERC",
  drums: "DRUMS",
  keys: "KEYS",
  fx: "FX",
  vocal: "VOCAL",
  vox: "VOX",
}

function labelTrack(trackName: string, index: number): string {
  if (!trackName || trackName.trim() === "") return `TRACK ${index + 1}`

  const lower = trackName.toLowerCase().trim()
  for (const [pattern, label] of Object.entries(TRACK_LABELS)) {
    if (lower.includes(pattern)) return label
  }
  return trackName.toUpperCase()
}

export function MidiPianoRoll({ midiFileUrl }: MidiPianoRollProps) {
  const [tracks, setTracks] = useState<ParsedTrack[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadMidi() {
      try {
        setLoading(true)
        setError(false)

        const response = await fetch(midiFileUrl)
        if (!response.ok) throw new Error("Failed to fetch MIDI file")

        const arrayBuffer = await response.arrayBuffer()
        const midi = new Midi(arrayBuffer)

        if (cancelled) return

        const parsed: ParsedTrack[] = []
        let maxTime = 0

        midi.tracks.forEach((track, i) => {
          if (track.notes.length === 0) return

          const notes = track.notes.map((note) => {
            const endTime = note.time + note.duration
            if (endTime > maxTime) maxTime = endTime
            return {
              time: note.time,
              duration: note.duration,
              velocity: note.velocity,
            }
          })

          parsed.push({
            name: labelTrack(track.name, i),
            notes,
          })
        })

        if (parsed.length === 0) {
          setError(true)
        } else {
          setTracks(parsed)
          setTotalDuration(maxTime)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMidi()
    return () => {
      cancelled = true
    }
  }, [midiFileUrl])

  if (loading) {
    return (
      <div className="animate-pulse rounded-none border border-[#222] bg-[#111] p-4">
        <div className="h-24 w-full bg-[#222]" />
      </div>
    )
  }

  if (error || tracks.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-none border border-[#222] bg-[#111] p-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
          No MIDI data available
        </span>
      </div>
    )
  }

  const LABEL_WIDTH = 80
  const TRACK_HEIGHT = 28
  const GAP = 2
  const PADDING = 16
  const svgWidth = 600
  const svgHeight = tracks.length * (TRACK_HEIGHT + GAP) + PADDING * 2

  // Scale timeline to show first 8 bars or full duration
  const barsToShow = 8
  const assumedBPM = 120
  const barDuration = (60 / assumedBPM) * 4
  const timelineEnd =
    totalDuration <= barDuration * barsToShow
      ? totalDuration
      : barDuration * barsToShow
  const noteAreaWidth = svgWidth - LABEL_WIDTH - PADDING * 2

  function timeToX(time: number): number {
    return LABEL_WIDTH + PADDING + (time / timelineEnd) * noteAreaWidth
  }

  function durationToWidth(dur: number): number {
    return Math.max((dur / timelineEnd) * noteAreaWidth, 2)
  }

  // Grid lines (per bar)
  const gridLines: number[] = []
  for (let t = 0; t <= timelineEnd; t += barDuration) {
    gridLines.push(t)
  }

  return (
    <div className="overflow-x-auto rounded-none border border-[#222] bg-[#111] p-4">
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="min-w-[400px]"
        preserveAspectRatio="xMinYMin meet"
      >
        {/* Grid lines */}
        {gridLines.map((t) => (
          <line
            key={`grid-${t}`}
            x1={timeToX(t)}
            y1={PADDING}
            x2={timeToX(t)}
            y2={svgHeight - PADDING}
            stroke="#222"
            strokeWidth={1}
          />
        ))}

        {/* Track lanes */}
        {tracks.map((track, i) => {
          const y = PADDING + i * (TRACK_HEIGHT + GAP)

          return (
            <g key={`track-${i}`}>
              {/* Lane separator */}
              {i > 0 && (
                <line
                  x1={0}
                  y1={y - GAP / 2}
                  x2={svgWidth}
                  y2={y - GAP / 2}
                  stroke="#222"
                  strokeWidth={1}
                />
              )}

              {/* Track label */}
              <text
                x={8}
                y={y + TRACK_HEIGHT / 2}
                dominantBaseline="central"
                fill="#888"
                fontSize="11"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="start"
              >
                {track.name}
              </text>

              {/* Notes */}
              {track.notes.map((note, ni) => {
                if (note.time > timelineEnd) return null
                const opacity = 0.4 + note.velocity * 0.6
                return (
                  <rect
                    key={`note-${i}-${ni}`}
                    x={timeToX(note.time)}
                    y={y + 1}
                    width={durationToWidth(note.duration)}
                    height={TRACK_HEIGHT - GAP}
                    fill="#f5f5f0"
                    opacity={opacity}
                    rx={0}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
