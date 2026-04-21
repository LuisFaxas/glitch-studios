---
phase: 10-blog
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/reading-time.ts
  - src/components/blog/reading-time-badge.tsx
autonomous: true
requirements: [BLOG-02]
must_haves:
  truths:
    - "A reading-time helper exists that accepts post content (HTML or markdown) and returns an integer minute count"
    - "The helper is wrapped with react.cache() so the same post content rendered twice in one request returns a memoized result"
    - "The helper always returns at least 1 (never 0)"
    - "A ReadingTimeBadge component renders the value as '{N} MIN READ' in mono uppercase muted styling"
  artifacts:
    - path: "src/lib/reading-time.ts"
      provides: "readingTime() pure function + readingTimeCached cache-wrapped variant"
      exports: ["readingTime", "readingTimeCached"]
    - path: "src/components/blog/reading-time-badge.tsx"
      provides: "Presentational badge component for reading-time display"
      exports: ["ReadingTimeBadge"]
  key_links:
    - from: "src/components/blog/reading-time-badge.tsx"
      to: "src/lib/reading-time.ts readingTimeCached"
      via: "Server component passes pre-computed minutes as prop; badge itself is stateless"
      pattern: "minutes"
---

<objective>
Ship a deterministic reading-time helper and a stateless presentational badge. The helper strips HTML/markdown, counts tokens, and divides by 225 wpm with Math.ceil and a floor of 1 (per D-06). Wrap with react.cache() so the hero banner, each PostCard, and the post-detail page all share a single compute per request.

Purpose: Every other Phase 10 component that shows reading time (hero banner, PostCard, post-detail) consumes this single helper. One source of truth for the "N MIN READ" behavior.

Output: readingTime function, readingTimeCached cached variant, and ReadingTimeBadge component.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/10-blog/10-CONTEXT.md
@.planning/phases/10-blog/10-UI-SPEC.md

@src/lib/services/portfolio-for-service.ts
@src/components/blog/post-content.tsx

<interfaces>
The canonical react.cache() pattern this project uses.

From src/lib/services/portfolio-for-service.ts:

    import "server-only"
    import { cache } from "react"

    export const getPortfolioForService = cache(
      async (service: { slug: string; type: string }) => {
        return await db...
      }
    )

The existing ad-hoc reading-time in src/components/blog/post-content.tsx (lines 10-13) uses 200 wpm — we are superseding it with 225 wpm per D-06:

    function estimateReadTime(content: string): number {
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
      return Math.max(1, Math.ceil(wordCount / 200))
    }

That file (post-content.tsx) will be updated to consume the new helper in Plan 07.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create readingTime + readingTimeCached helpers</name>
  <files>src/lib/reading-time.ts, src/lib/reading-time.test.ts</files>
  <read_first>
    - src/lib/services/portfolio-for-service.ts (to mirror the react.cache() wrapping pattern exactly)
    - src/components/blog/post-content.tsx (to see the existing 200 wpm implementation we are replacing)
    - package.json (to confirm test runner — check for vitest devDependency before writing the test file)
  </read_first>
  <behavior>
    - Test 1: readingTime("Hello world") returns 1 (minimum floor)
    - Test 2: readingTime("") returns 1 (minimum floor, never 0)
    - Test 3: readingTime(225 tokens) returns 1 (225 / 225 = 1)
    - Test 4: readingTime(226 tokens) returns 2 (226 / 225 = 1.004, ceil -> 2)
    - Test 5: readingTime("<p><strong>Hello</strong> <em>world</em></p>") strips tags and counts 2 words -> returns 1
    - Test 6: markdown "# Heading\n\n**bold** _italic_ [link](url) word" counts tokens (<=225) -> returns 1
    - Test 7: whitespace-only content "   \n\t  " returns 1
  </behavior>
  <action>
    Create src/lib/reading-time.ts with this EXACT content:

        import "server-only"
        import { cache } from "react"

        const WORDS_PER_MINUTE = 225

        /**
         * Compute reading time in minutes for a post's content.
         * Strips HTML tags AND common markdown tokens (#, *, _, `, ~, >, [, ], (, ), !) before counting.
         * 225 wpm per D-06. Floor = 1 (never returns 0).
         *
         * Pure function — prefer readingTimeCached when calling from Server Components
         * so repeated renders of the same content reuse a single compute.
         */
        export function readingTime(content: string): number {
          if (!content) return 1
          const stripped = content
            .replace(/<[^>]*>/g, " ")              // HTML tags
            .replace(/[#*_`~>\[\]()!]/g, " ")      // common markdown punctuation
            .replace(/\s+/g, " ")                   // collapse whitespace
            .trim()
          if (!stripped) return 1
          const tokens = stripped.split(" ").filter(Boolean).length
          const minutes = Math.ceil(tokens / WORDS_PER_MINUTE)
          return Math.max(1, minutes)
        }

        /**
         * Request-scoped memoized variant. Identical content strings hit the cache
         * so rendering the same post in multiple components within a single request
         * computes once. Follow the pattern in src/lib/services/portfolio-for-service.ts.
         */
        export const readingTimeCached = cache((content: string): number => readingTime(content))

    Then check for vitest: `grep -q '"vitest"' package.json`.
    - If vitest is present: create src/lib/reading-time.test.ts covering the 7 behaviors above using `import { describe, it, expect } from "vitest"` and `import { readingTime } from "./reading-time"`.
    - If vitest is NOT present: skip the test file entirely. Do not invent a test runner. Document in SUMMARY.md that the helper was verified via the behavior contract and downstream consumers.
  </action>
  <verify>
    <automated>test -f src/lib/reading-time.ts &amp;&amp; grep -q "export function readingTime" src/lib/reading-time.ts &amp;&amp; grep -q "export const readingTimeCached" src/lib/reading-time.ts &amp;&amp; grep -q "cache(" src/lib/reading-time.ts &amp;&amp; grep -q "225" src/lib/reading-time.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - src/lib/reading-time.ts exists and exports `readingTime` (named function) and `readingTimeCached` (cache-wrapped)
    - File imports `"server-only"` and `cache` from `"react"`
    - Contains the literal `225` (words-per-minute constant)
    - Contains the guard `if (!content) return 1`
    - Strips HTML via `replace(/<[^>]*>/g, " ")`
    - Strips markdown punctuation via a regex covering at minimum `# * _`
    - `pnpm tsc --noEmit` exits 0
    - If vitest is configured, `pnpm test src/lib/reading-time` passes all 7 behavior cases
  </acceptance_criteria>
  <done>readingTime + readingTimeCached exist, strip HTML/markdown, compute at 225 wpm, floor = 1. Server Components can import and call readingTimeCached(post.content) to get N.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create ReadingTimeBadge presentational component</name>
  <files>src/components/blog/reading-time-badge.tsx</files>
  <read_first>
    - src/lib/reading-time.ts (to confirm return type is number)
    - src/components/blog/post-card.tsx (for the existing mono-label typography pattern — mono uppercase, muted color)
    - .planning/phases/10-blog/10-UI-SPEC.md Copywriting Contract section (exact format string is "{N} MIN READ")
  </read_first>
  <action>
    Create src/components/blog/reading-time-badge.tsx with this EXACT content:

        import clsx from "clsx"

        interface ReadingTimeBadgeProps {
          minutes: number
          className?: string
        }

        /**
         * Presentational badge. Format: "{N} MIN READ" in mono 11px uppercase muted.
         * Accepts pre-computed minutes (typically from readingTimeCached on the server).
         * Per D-06: floor = 1, but caller is responsible for enforcing that via readingTimeCached.
         */
        export function ReadingTimeBadge({ minutes, className }: ReadingTimeBadgeProps) {
          return (
            <span
              className={clsx(
                "font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]",
                className,
              )}
            >
              {minutes} MIN READ
            </span>
          )
        }

    This is a server-safe presentational component — no "use client" directive. It receives `minutes: number` as a prop and renders the string. Any consumer in a Client Component can import it freely because there are no React hooks or event handlers.

    Font/color rationale (per UI-SPEC Typography + Color tables):
    - font-mono = JetBrains Mono
    - text-[11px] = Label / Metadata size
    - font-bold = weight 700
    - uppercase tracking-wide = mono-uppercase site-wide rule
    - text-[#888888] = Muted color token
  </action>
  <verify>
    <automated>test -f src/components/blog/reading-time-badge.tsx &amp;&amp; grep -q "export function ReadingTimeBadge" src/components/blog/reading-time-badge.tsx &amp;&amp; grep -q "MIN READ" src/components/blog/reading-time-badge.tsx &amp;&amp; grep -q "text-\[11px\]" src/components/blog/reading-time-badge.tsx &amp;&amp; grep -q "text-\[#888888\]" src/components/blog/reading-time-badge.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - src/components/blog/reading-time-badge.tsx exists and exports `ReadingTimeBadge`
    - Component accepts `minutes: number` and optional `className?: string`
    - Renders the literal string `MIN READ` in the JSX
    - Uses Tailwind classes: `font-mono`, `text-[11px]`, `font-bold`, `uppercase`, `tracking-wide`, `text-[#888888]`
    - Does NOT contain `"use client"` directive (server-safe)
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>ReadingTimeBadge renders "{N} MIN READ" in the locked palette and typography. Hero, PostCard, and post-detail (Plan 07) can import and use it.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- If vitest is configured: all reading-time behavior tests pass
</verification>

<success_criteria>
- Reading-time compute is centralized in one file (src/lib/reading-time.ts)
- Cached variant exists for Server Components (react.cache pattern mirrored from portfolio-for-service.ts)
- Badge component exists and is reusable across hero, PostCard, post-detail
- No auto-running animations, no client state — pure presentation
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-02-SUMMARY.md` documenting: the 225 wpm + floor-1 algorithm, the react.cache() pattern, and the badge's exact Tailwind class set (for downstream plans that reference the same styling).
</output>
