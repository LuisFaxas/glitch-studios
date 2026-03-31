"use client"

import { useRef, useEffect, useCallback } from "react"

interface WaveformProps {
  peaks: number[] | null
  progress: number // 0-1
  height: number // canvas px height
  barWidth?: number // default 2
  barGap?: number // default 1
  waveColor?: string // default "#555555"
  progressColor?: string // default "#f5f5f0"
  interactive?: boolean // enables click/drag scrub
  onSeek?: (progress: number) => void // 0-1
  className?: string
  barRadius?: number // default 0 (sharp bars)
  mirrored?: boolean // default false
  mirrorOpacity?: number // default 0.35
  gradient?: boolean // default false
  gradientColors?: { from: string; to: string } // played portion gradient
  gradientWaveColors?: { from: string; to: string } // unplayed portion gradient
}

export function Waveform({
  peaks,
  progress,
  height,
  barWidth = 2,
  barGap = 1,
  waveColor = "#555555",
  progressColor = "#f5f5f0",
  interactive = false,
  onSeek,
  className,
  barRadius = 0,
  mirrored = false,
  mirrorOpacity = 0.35,
  gradient = false,
  gradientColors,
  gradientWaveColors,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Calculate seek position from mouse/touch event
  const getPosition = useCallback((clientX: number): number => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const rect = canvas.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  // Draw waveform on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // Set canvas pixel dimensions for sharp rendering
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    const step = barWidth + barGap
    const barCount = Math.floor(displayWidth / step)
    if (barCount <= 0) return

    const progressX = progress * displayWidth

    // If no peaks, render flat line at 30% height
    const peaksData = peaks && peaks.length > 0 ? peaks : null

    // Create gradients if enabled
    let progressFill: string | CanvasGradient = progressColor
    let waveFill: string | CanvasGradient = waveColor

    if (gradient) {
      const pColors = gradientColors ?? { from: progressColor, to: "#888888" }
      const wColors = gradientWaveColors ?? { from: waveColor, to: "#333333" }

      const pGrad = ctx.createLinearGradient(0, 0, 0, displayHeight)
      pGrad.addColorStop(0, pColors.from)
      pGrad.addColorStop(1, pColors.to)
      progressFill = pGrad

      const wGrad = ctx.createLinearGradient(0, 0, 0, displayHeight)
      wGrad.addColorStop(0, wColors.from)
      wGrad.addColorStop(1, wColors.to)
      waveFill = wGrad
    }

    if (mirrored) {
      // Mirrored rendering: top half + reflection below
      const centerY = displayHeight / 2

      for (let i = 0; i < barCount; i++) {
        let amplitude: number
        if (peaksData) {
          const peakIndex = Math.floor((i / barCount) * peaksData.length)
          amplitude = peaksData[peakIndex] ?? 0
        } else {
          amplitude = 0.3
        }

        const barH = Math.max(1, amplitude * centerY)
        const x = i * step
        const isPlayed = x + barWidth <= progressX

        // Top bar (grows upward from center)
        ctx.globalAlpha = 1
        ctx.fillStyle = isPlayed ? progressFill : waveFill
        if (barRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(x, centerY - barH, barWidth, barH, barRadius)
          ctx.fill()
        } else {
          ctx.fillRect(x, centerY - barH, barWidth, barH)
        }

        // Bottom bar (reflection, grows downward from center)
        ctx.globalAlpha = mirrorOpacity
        if (barRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(x, centerY, barWidth, barH, barRadius)
          ctx.fill()
        } else {
          ctx.fillRect(x, centerY, barWidth, barH)
        }
      }

      ctx.globalAlpha = 1
    } else {
      // Standard rendering: bars grow upward from bottom
      for (let i = 0; i < barCount; i++) {
        let amplitude: number
        if (peaksData) {
          const peakIndex = Math.floor((i / barCount) * peaksData.length)
          amplitude = peaksData[peakIndex] ?? 0
        } else {
          amplitude = 0.3
        }

        const barHeight = Math.max(2, amplitude * displayHeight)
        const x = i * step
        const y = displayHeight - barHeight

        ctx.fillStyle = x + barWidth <= progressX ? progressFill : waveFill

        if (barRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, barRadius)
          ctx.fill()
        } else {
          ctx.fillRect(x, y, barWidth, barHeight)
        }
      }
    }
  }, [
    peaks,
    progress,
    height,
    barWidth,
    barGap,
    waveColor,
    progressColor,
    barRadius,
    mirrored,
    mirrorOpacity,
    gradient,
    gradientColors,
    gradientWaveColors,
  ])

  // ResizeObserver for responsive canvas
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      draw()
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [draw])

  // Redraw on progress/peaks change
  useEffect(() => {
    draw()
  }, [draw])

  // Mouse/touch event handlers for scrubbing
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!interactive || !onSeek) return
      e.preventDefault()
      e.stopPropagation()
      isDragging.current = true
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      onSeek(getPosition(clientX))
    },
    [interactive, onSeek, getPosition],
  )

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging.current || !interactive || !onSeek) return
      e.preventDefault()
      e.stopPropagation()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      onSeek(getPosition(clientX))
    },
    [interactive, onSeek, getPosition],
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Global mouseup/touchend to stop dragging
  useEffect(() => {
    if (!interactive) return
    const handleUp = () => {
      isDragging.current = false
    }
    window.addEventListener("mouseup", handleUp)
    window.addEventListener("touchend", handleUp)
    return () => {
      window.removeEventListener("mouseup", handleUp)
      window.removeEventListener("touchend", handleUp)
    }
  }, [interactive])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: interactive ? "pointer" : "default",
        }}
        onMouseDown={interactive ? handlePointerDown : undefined}
        onMouseMove={interactive ? handlePointerMove : undefined}
        onTouchStart={interactive ? handlePointerDown : undefined}
        onTouchMove={interactive ? handlePointerMove : undefined}
        onTouchEnd={interactive ? handlePointerUp : undefined}
      />
    </div>
  )
}
