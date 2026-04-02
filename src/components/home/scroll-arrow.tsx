"use client"

import { motion, useReducedMotion } from "motion/react"

export function ScrollArrow() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center gap-3">
      {/* "SCROLL" text with glitch effect */}
      <span className="relative font-mono text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-[#f5f5f0]/60 select-none scroll-glitch-text">
        Scroll
      </span>

      {/* Large animated arrow — three stacked chevrons that pulse downward */}
      <motion.div
        className="flex flex-col items-center -space-y-3"
        animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg width="40" height="40" viewBox="0 0 40 20" className="text-[#f5f5f0]/20">
          <path d="M4 4 L20 16 L36 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
        </svg>
        <svg width="40" height="40" viewBox="0 0 40 20" className="text-[#f5f5f0]/40">
          <path d="M4 4 L20 16 L36 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
        </svg>
        <svg width="40" height="40" viewBox="0 0 40 20" className="text-[#f5f5f0]/70">
          <path d="M4 4 L20 16 L36 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" />
        </svg>
      </motion.div>

      {/* Glitch animation for the text */}
      <style jsx>{`
        .scroll-glitch-text {
          animation: scroll-glitch 4s infinite;
        }
        @keyframes scroll-glitch {
          0%, 92% {
            text-shadow: none;
            transform: translate(0);
          }
          93% {
            text-shadow: -2px 0 #f5f5f0, 2px 0 #f5f5f0;
            transform: translate(-1px, 0);
          }
          94% {
            text-shadow: 2px 0 rgba(255,0,80,0.5), -2px 0 rgba(0,200,255,0.5);
            transform: translate(2px, 0);
          }
          95% {
            text-shadow: -1px 0 rgba(255,0,80,0.5), 1px 0 rgba(0,200,255,0.5);
            transform: translate(-1px, 0);
          }
          96%, 100% {
            text-shadow: none;
            transform: translate(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-glitch-text {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
