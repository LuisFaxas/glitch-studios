"use client"

import { useEffect, useState } from "react"

const sizeMap = {
  sm: "text-xl",
  md: "text-[32px]",
  lg: "text-5xl md:text-[64px]",
} as const

type GlitchLogoProps = {
  size?: keyof typeof sizeMap
  animate?: boolean
}

export function GlitchLogo({ size = "md", animate = true }: GlitchLogoProps) {
  const [settled, setSettled] = useState(!animate)

  useEffect(() => {
    if (!animate) return
    const timer = setTimeout(() => setSettled(true), 1500)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <span
      className={`glitch-logo relative inline-block font-mono font-bold uppercase leading-none ${sizeMap[size]}`}
      data-text="GLITCH"
      style={{
        textShadow: "0 0 10px rgba(255,255,255,0.3)",
        color: "#ffffff",
      }}
    >
      GLITCH
      <style jsx>{`
        .glitch-logo {
          position: relative;
        }
        .glitch-logo::before,
        .glitch-logo::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .glitch-logo::before {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          animation: ${settled ? "glitch-subtle 3s steps(2, start) infinite" : "glitch-dramatic 1.5s steps(2, start)"};
        }
        .glitch-logo::after {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          animation: ${settled ? "glitch-subtle 3s steps(2, start) infinite reverse" : "glitch-dramatic 1.5s steps(2, start) reverse"};
        }
        @media (prefers-reduced-motion: reduce) {
          .glitch-logo::before,
          .glitch-logo::after {
            animation: none;
          }
        }
      `}</style>
    </span>
  )
}
