// Phase 29.1 — methodology page consolidated into /tech/about (D-02).
//
// FRAGMENT-PRESERVATION CONTRACT:
// The redirect target intentionally has NO fragment. Per Next.js 16 +
// browser redirect semantics: when a 308 target has its own fragment,
// browsers DROP the inbound fragment and use the server-supplied one.
// When the target has NO fragment, browsers PRESERVE the inbound fragment.
//
// Therefore:
//   /tech/methodology#bpr          → /tech/about#bpr           (preserved)
//   /tech/methodology#disciplines  → /tech/about#disciplines   (preserved)
//   /tech/methodology#glitchmark   → /tech/about#glitchmark    (preserved)
//   /tech/methodology              → /tech/about               (no fragment, lands at top)
//
// DO NOT change the target to "/tech/about#methodology" — that breaks D-02
// by overriding any inbound deep-link fragment with #methodology.
import { permanentRedirect } from "next/navigation"

export default function MethodologyRedirect() {
  permanentRedirect("/tech/about")
}
