"use client"

import { HeroSection } from "@/components/home/hero-section"
import { TechPulseLine } from "@/components/home/tech-pulse-line"
import styles from "@/components/tiles/logo-tile.module.css"

// D-06 (Phase 16.1, post-UAT revision): bring the heartbeat wordmark design
// from the tech hero INTO the Studios hero. The ECG pulse line + beam-glitch
// auto-pulse + under-logo wordmark ("STUDIOS") was originally tech-only; the
// user's direction is that this heartbeat IS the brand's hero signature and
// both brands should share it — Tech just substitutes the under-logo text
// ("TECH") while everything else is identical.
//
// TechPulseLine is reused as-is (the component is brand-agnostic — it's an
// ECG pulse SVG with a delay prop, no tech-specific styling). Same beam-
// glitch CSS module from logo-tile.module.css.
interface StudiosHeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundMediaUrl?: string
}

export function StudiosHeroSection({
  title,
  subtitle = "Music Production // Video // Creative Services",
  ctaText = "Book a Session",
  ctaLink = "/services",
  backgroundMediaUrl,
}: StudiosHeroSectionProps = {}) {
  return (
    <HeroSection
      title={title}
      subtitle={subtitle}
      ctaText={ctaText}
      ctaLink={ctaLink}
      backgroundMediaUrl={backgroundMediaUrl}
      tagline="Music & Video Production Studio"
      wordmark={
        <div className="flex w-full flex-col items-center gap-3 md:gap-4">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
            <div className={styles.beamLayer1} aria-hidden="true" />
            <div className={styles.beamLayer2} aria-hidden="true" />
          </div>
          <div className="flex w-full items-center gap-3 md:gap-4">
            <TechPulseLine delay={0} />
            <span
              className={`${styles.glitchTextWrapper} font-mono text-lg md:text-3xl font-bold uppercase tracking-[0.5em] text-[#f5f5f0]`}
              aria-label="Studios"
            >
              STUDIOS
              <span
                className={`${styles.glitchTextLayer} ${styles.glitchTextLayer1}`}
                aria-hidden="true"
              >
                STUDIOS
              </span>
              <span
                className={`${styles.glitchTextLayer} ${styles.glitchTextLayer2}`}
                aria-hidden="true"
              >
                STUDIOS
              </span>
            </span>
            <TechPulseLine delay={1} />
          </div>
        </div>
      }
    />
  )
}
