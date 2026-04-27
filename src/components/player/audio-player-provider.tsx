"use client"

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
  type RefObject,
} from "react"
import { PlayerBar } from "@/components/player/player-bar"

export interface PlayerBeat {
  id: string
  slug: string
  title: string
  artist: string
  previewAudioUrl: string
  coverArtUrl: string | null
  waveformPeaks: number[] | null
}

interface AudioPlayerContextValue {
  currentBeat: PlayerBeat | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isMinimized: boolean
  audioRef: RefObject<HTMLAudioElement | null>
  play: (beat: PlayerBeat) => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setMinimized: (minimized: boolean) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

export function useAudioPlayer(): AudioPlayerContextValue {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider")
  }
  return context
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentBeat, setCurrentBeat] = useState<PlayerBeat | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  const play = useCallback(
    (beat: PlayerBeat) => {
      const audio = audioRef.current
      if (!audio) return

      // If same beat and paused, just resume
      if (currentBeat?.id === beat.id && audio.paused) {
        audio.play()
        setIsPlaying(true)
        return
      }

      // If same beat and already playing, do nothing
      if (currentBeat?.id === beat.id && !audio.paused) {
        return
      }

      // New beat: load and play
      setCurrentBeat(beat)
      audio.src = beat.previewAudioUrl
      audio.load()
      audio.play()
      setIsPlaying(true)
      setIsMinimized(false)
    },
    [currentBeat?.id],
  )

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentBeat) return

    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [currentBeat])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
  }, [])

  const setMinimizedState = useCallback((minimized: boolean) => {
    setIsMinimized(minimized)
  }, [])

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Phase 29.3 Suspect #4 fix: memoize context value so consumers
  // (PlayerBar, WidgetNowPlaying) don't re-render on every parent render.
  // Without this, ANY parent re-render (e.g., usePathname change in
  // (tech)/layout.tsx, sidebar collapse) cascades a fresh value object →
  // re-renders WidgetNowPlaying which has a <canvas> waveform. Compounds
  // with chip-click churn on the leaderboard.
  // audioRef is a stable ref so it is intentionally NOT in deps.
  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentBeat,
      isPlaying,
      currentTime,
      duration,
      isMinimized,
      audioRef,
      play,
      pause,
      toggle,
      seek,
      setMinimized: setMinimizedState,
    }),
    [
      currentBeat,
      isPlaying,
      currentTime,
      duration,
      isMinimized,
      play,
      pause,
      toggle,
      seek,
      setMinimizedState,
    ],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <PlayerBar />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" />
    </AudioPlayerContext.Provider>
  )
}
