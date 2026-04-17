# Quick Task 260416-wav: Animation Libraries Research
# React/Next.js ECG Heartbeat Pulse + Cyberpunk Motion

**Date:** 2026-04-17
**Status:** Complete

---

## Task Context

Stack: Next.js 16 + Tailwind v4 + Framer Motion (Motion.dev) already installed.
Use case: ECG/heartbeat line traveling across horizontal baseline flanking "TECH" text, plus broader cyberpunk motion effects.
Aesthetic: Monochrome cyberpunk (Glitch Tech sub-brand at /tech).

---

## Library Evaluations

### 1. Framer Motion / Motion.dev (ALREADY INSTALLED)

**What it does:** Declarative React animation library with physics, gestures, layout, and scroll-linked motion.

**Bundle size:** ~50KB gzip (already in bundle — zero marginal cost).

**ECG heartbeat fit:** YES — built-in `pathLength` and `pathOffset` props on `<motion.path>` animate SVG stroke drawing natively with no plugins. The `pathLength: 0 → 1` pattern creates the "line drawing itself" effect that forms an ECG trace.

**Pre-built heartbeat animations:** No. You build custom with better primitives.

**Integration:** Already installed. Zero additional overhead.

**Server components:** Client-only (needs `'use client'`).

**Verdict:** THE correct tool for the ECG use case. No additional library needed.

---

### 2. GSAP (GreenSock Animation Platform)

**Package:** `gsap` + `@gsap/react`
**Install:** `pnpm add gsap @gsap/react`

**What it does:** Industry-standard JS animation engine. Timeline-based, sequencing, morphing, scroll triggers. Went fully free in 2024 (Webflow sponsorship), including all previously paid plugins (DrawSVG, SplitText, MorphSVG, ScrollSmoother).

**Bundle size:** ~63KB gzip (bundlephobia: gsap core). Heavier than Motion but adds significant capability.

**ECG heartbeat fit:** EXCELLENT — DrawSVGPlugin was literally designed for this. Animates `stroke-dashoffset`/`stroke-dasharray` on SVG paths. There is a live GSAP community thread on creating animated ECG with DrawSVG.

**Pre-built heartbeat animations:** No pre-built, but DrawSVG is the canonical primitive.

**Integration:** Needs `useGSAP` hook from `@gsap/react` for lifecycle management. More setup than Motion for React. Medium integration effort.

**Server components:** Client-only.

**Verdict:** Best option IF you need sequential timelines, multiple elements, or scroll-sync. Overkill for a single ECG component when Motion is already installed.

---

### 3. Lottie / @lottiefiles/dotlottie-react

**Package:** `@lottiefiles/dotlottie-react`
**Install:** `pnpm add @lottiefiles/dotlottie-react`

**What it does:** Plays Adobe After Effects animations exported as JSON/dotLottie. Zero animation code required — drop in a file.

**Bundle size:** Lottie-web core ~82KB gzip. dotLottie-react format reduces file sizes 80% vs JSON.

**ECG heartbeat fit:** YES (pre-built assets exist). LottieFiles has multiple free ECG animations:
- https://lottiefiles.com/free-animation/heartbeat-ecg-loader-cqoa6R3aJO
- https://lottiefiles.com/free-animation/heartbeat-ecg-Iw2NJ9VEwI
- https://lottiefiles.com/free-animation/heartbeat-graph-ecg-cyTTflptVH
- https://lottiefiles.com/free-animation/heart-with-ecg-YmRr0zqixD

**Pre-built heartbeat animations:** YES — multiple free ECG Lottie JSON files available now.

**Limitation for Glitch Tech:** Most free Lottie ECG files are colored (green/red). Applying monochrome/cyberpunk tinting requires either editing the .lottie file in After Effects or using Lottie's color filter API.

**Integration:** Drop-in component. Very low effort.

**Server components:** Client-only.

**Verdict:** Fast path if you want pre-built. Theming to monochrome adds friction. Not ideal for tight cyberpunk aesthetic control.

---

### 4. Rive

**Package:** `@rive-app/react-canvas`
**Install:** `pnpm add @rive-app/react-canvas`

**What it does:** Interactive animation platform with state machines. Design in Rive Editor, export as `.riv` file, play with runtime. Far superior to Lottie for interactivity and file size.

**Bundle size:** JS runtime ~78KB WASM module. Rive files are 10-15x smaller than equivalent Lottie files.

**ECG heartbeat fit:** GOOD — if you create the animation in Rive Editor. State machines allow interactive control (e.g., pulse speed reacts to hover). No free ECG Rive files found.

**Pre-built heartbeat animations:** Not findable for free. Requires authoring in Rive Editor.

**Integration:** Medium. Need to create/find .riv file. `<RiveComponent />` or `useRive` hook.

**Server components:** Client-only.

**Verdict:** Best option for interactive animations that react to state. Too much authoring overhead for a decorative ECG line.

---

### 5. Motion Primitives

**Package:** `motion-primitives` (shadcn-style, components copied into project)
**Install:** Via shadcn CLI or manual copy from motion-primitives.com

**What it does:** Pre-built animated React components built on Framer Motion. Text reveals, blur effects, scroll-triggered fades, spotlight cursor effects. MIT license.

**Bundle size:** Zero — components are copied into your codebase. Only Framer Motion is a dep (already installed).

**ECG heartbeat fit:** No ECG/heartbeat component. Has `TextEffect`, `AnimatedBackground`, `Cursor`, `InView` components. Good for text animations around the ECG, not the ECG itself.

**Pre-built heartbeat animations:** No.

**Integration:** Copy-paste, zero additional deps. Very low effort.

**Server components:** Client-only (Framer Motion dependency).

**Verdict:** Highly useful for cyberpunk text effects flanking the ECG (text reveals, glitch text, blur in). Not a solution for the ECG itself.

---

### 6. React Bits (reactbits.dev)

**Package:** Copy-paste from reactbits.dev (shadcn-style)
**Install:** Copy components directly

**What it does:** 110+ animated React components. No mandatory Framer Motion dep — uses React Spring, GSAP, or Three.js internally. Includes BlurText, SplitText, GradientText, animated backgrounds (Dither — already used).

**Bundle size:** Zero marginal cost for copied components. Deps vary per component.

**ECG heartbeat fit:** No ECG component. Strongest for text effects and backgrounds.

**Pre-built heartbeat animations:** No.

**Integration:** Already familiar with (Dither component). Copy-paste.

**Server components:** Client-only.

**Verdict:** Best for cyberpunk text effects. BlurText + GradientText are strong candidates for the "TECH" text styling around the ECG.

---

### 7. Magic UI (magicui.design)

**Package:** Copy-paste from magicui.design (shadcn-style)
**Install:** Copy components directly

**What it does:** 150+ animated components. Pulsating Button, Ripple, Animated Beam, Orbiting Circles, Particle effects.

**Bundle size:** Zero marginal cost. Framer Motion dep (already installed).

**ECG heartbeat fit:** Has Ripple and Pulsating Button but no ECG/heartbeat line component. The "Animated Beam" component creates connecting lines that could stylistically complement an ECG.

**Pre-built heartbeat animations:** No ECG. Has generic pulse/ripple.

**Integration:** Copy-paste, familiar pattern.

**Server components:** Client-only.

**Verdict:** Good for decorative pulse accents (ripple effects around the ECG display). Not the ECG itself.

---

### 8. Anime.js v4

**Package:** `animejs`
**Install:** `pnpm add animejs`

**What it does:** Lightweight JS animation engine. v4 released 2024, fully ES module, tree-shakable. 10KB gzip for full library; 3KB for just `animate()`.

**Bundle size:** ~10KB gzip (entire library). Smallest JS animation engine.

**ECG heartbeat fit:** GOOD — can animate SVG stroke-dashoffset directly. No React hook, needs manual `useEffect` binding. Less ergonomic than Motion for React.

**Pre-built heartbeat animations:** No.

**Integration:** Medium — needs manual React binding via useEffect.

**Server components:** Client-only.

**Verdict:** Excellent if bundle size is critical and you don't want GSAP. For this project, Motion is already installed so Anime.js adds a duplicate dep with less ergonomic API.

---

## Final Recommendation: Use Motion.dev (Already Installed)

For the ECG heartbeat line traveling across a horizontal baseline, **Framer Motion's `pathLength` + `pathOffset` SVG animation is the right answer.** No new dependency required.

### How It Works

The ECG trace is an SVG `<path>` with the ECG waveform as its `d` attribute. Two properties drive the animation:

- `pathLength`: How much of the path has been drawn (0 = none, 1 = full)
- `pathOffset`: Where on the path the drawn segment starts

By animating `pathOffset` from 0 to 1 on loop (with `pathLength` set to a short value like 0.15), the waveform appears to travel from left to right — exactly like a cardiac monitor.

### Implementation

```tsx
'use client'
import { motion } from 'motion/react'

// ECG SVG path — flat baseline with one spike
// Adjust d="" to match desired waveform shape
const ECG_PATH = "M0,50 L60,50 L70,50 L80,20 L90,80 L100,30 L110,50 L120,50 L200,50"

export function ECGLine() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-12 overflow-visible">
      {/* Static baseline (dim) */}
      <path
        d={ECG_PATH}
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        className="text-white/10"
      />
      {/* Animated traveling segment (bright) */}
      <motion.path
        d={ECG_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="text-white"
        initial={{ pathLength: 0.15, pathOffset: 0 }}
        animate={{ pathOffset: 1 }}
        transition={{
          duration: 2,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </svg>
  )
}
```

### Layout: Flanking "TECH" Text

```tsx
<div className="flex items-center gap-4">
  <ECGLine />
  <span className="font-mono text-xs tracking-[0.3em] text-white/60 shrink-0">
    TECH
  </span>
  <ECGLine />
</div>
```

### For a Glowing Cyberpunk Effect

Add a second `<motion.path>` with blur filter and lower opacity for the glow trail:

```tsx
{/* Glow layer */}
<motion.path
  d={ECG_PATH}
  stroke="white"
  strokeWidth="4"
  fill="none"
  style={{ filter: "blur(3px)", opacity: 0.3 }}
  initial={{ pathLength: 0.15, pathOffset: 0 }}
  animate={{ pathOffset: 1 }}
  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
/>
```

---

## Supporting Libraries for Broader Cyberpunk Effects

| Use Case | Library | Install |
|----------|---------|---------|
| Text reveal / blur-in for "TECH" caption | Motion Primitives | copy-paste |
| Glitch text, split-text effects | React Bits (already used) | copy-paste |
| Pulsing ring/ripple accents | Magic UI (Ripple component) | copy-paste |
| Complex multi-element timelines | GSAP + DrawSVG | `pnpm add gsap @gsap/react` |
| Pre-built ECG (quick win, needs theming) | Lottie dotLottie | `pnpm add @lottiefiles/dotlottie-react` |

---

## Sources Referenced

- GSAP DrawSVG: https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/
- GSAP ECG forum: https://gsap.com/community/forums/topic/43210-need-help-with-creating-an-animated-ecg/
- Motion SVG animation docs: https://motion.dev/docs/react-svg-animation
- Rive vs Lottie: https://dev.to/uianimation/rive-vs-lottie-which-animation-tool-should-you-use-in-2025-p4m
- LottieFiles ECG animations: https://lottiefiles.com/free-animations/heartbeat
- Motion Primitives: https://motion-primitives.com/
- React Bits: https://reactbits.dev/
- Magic UI components: https://magicui.design/docs/components
- Anime.js v4: https://animejs.com/
