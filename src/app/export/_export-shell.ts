// Shared CSS for all /export/<asset> routes. Hides the root-layout chrome that
// would otherwise bleed into small viewports (FloatingCartButton on mobile,
// Next.js dev indicator, route announcer, etc.) and pins #export-root to a
// fixed full-viewport box with a transparent background — the canonical shell
// every brand-engine asset renders inside.
//
// Why a string constant instead of a CSS module: the value gets injected into
// a `<style>` tag in the React tree, not imported into a CSS-in-JS pipeline.
// That keeps every export client trivially self-contained — no extra build
// step, no CSS module hashing surprises in the screenshot.
export const EXPORT_SHELL_CSS = `
  html, body { background: transparent !important; }
  /* Hide layout chrome that would otherwise occlude small-viewport assets.
     None of these are part of any /export/<asset> page's intended output. */
  button[aria-label^="Shopping cart"],
  [data-nextjs-toast-errors-parent],
  [data-nextjs-route-announcer],
  [data-nextjs-toolbar],
  nextjs-portal {
    display: none !important;
  }
  #export-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
`
