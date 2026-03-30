"use client"

import { motion, useReducedMotion, type Easing } from "motion/react"

type ScrollVariant = "fade-up" | "clip-reveal" | "stagger" | "slide-left" | "slide-right"

interface ScrollSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: ScrollVariant
}

interface VariantConfig {
  initial: { opacity?: number; y?: number; x?: number; clipPath?: string }
  whileInView: { opacity?: number; y?: number; x?: number; clipPath?: string }
  transition: { duration: number; ease: Easing }
}

const variantConfigs: Record<Exclude<ScrollVariant, "stagger">, VariantConfig> = {
  "fade-up": {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  "clip-reveal": {
    initial: { clipPath: "inset(100% 0 0 0)" },
    whileInView: { clipPath: "inset(0% 0 0 0)" },
    transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] },
  },
  "slide-left": {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
  },
  "slide-right": {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
  },
}

// Reduced motion: simple opacity fade only
const reducedMotionConfig: VariantConfig = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" },
}

// Stagger container variants
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Stagger item variants
const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Reduced motion stagger variants
const reducedStaggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
      delayChildren: 0,
    },
  },
}

const reducedStaggerItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export function ScrollSection({
  children,
  className,
  delay = 0,
  variant = "fade-up",
}: ScrollSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  if (variant === "stagger") {
    const containerVars = shouldReduceMotion
      ? reducedStaggerContainerVariants
      : staggerContainerVariants

    return (
      <motion.section
        variants={containerVars}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className={className}
      >
        {children}
      </motion.section>
    )
  }

  const config = shouldReduceMotion
    ? reducedMotionConfig
    : variantConfigs[variant]

  return (
    <motion.section
      initial={config.initial}
      whileInView={config.whileInView}
      transition={{ ...config.transition, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/**
 * Sub-component for use inside a <ScrollSection variant="stagger"> container.
 * Each ScrollSectionItem staggers in sequence.
 */
export function ScrollSectionItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const itemVars = shouldReduceMotion
    ? reducedStaggerItemVariants
    : staggerItemVariants

  return (
    <motion.div variants={itemVars} className={className}>
      {children}
    </motion.div>
  )
}
