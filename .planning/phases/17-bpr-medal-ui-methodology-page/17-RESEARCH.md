# Phase 17: BPR Medal UI + Methodology Page — Research

**Researched:** 2026-04-23
**Domain:** Next.js 16 RSC UI components + static ISR page, Drizzle queries, monochrome design system consumption (no new deps)
**Confidence:** HIGH

---

## Summary

Phase 17 is a **pure UI + query phase** — zero new dependencies, zero new registry components. The DB schema (Phase 15), the BPR math (Phase 16 `bpr.ts`), and the design system (07.4 / 07.6) are all already in place. The phase's work is (a) a new presentational `<BPRMedal>` component, (b) a new static `/tech/methodology` page, and (c) wiring the medal into `ReviewRatingCard` and `ReviewCard`.

Research surfaced **two critical pitfalls the UI-SPEC does not call out** that the planner must address before executing:

1. **BPR score scale mismatch** — `tech_reviews.bpr_score` is declared `numeric(5,4)` (max 9.9999), but `computeBprScore()` in `src/lib/tech/bpr.ts` returns values on a 0–100 scale. No data has been ingested yet so the bug has not fired, but the moment Phase 16 commits a real score the insert will overflow. Phase 17's medal reads this field — the planner must decide whether Phase 17 (a) waits on a schema/compute fix from Phase 16, or (b) handles this coordination in its own plan.
2. **`tech_rubric_versions` table does not exist.** The UI-SPEC describes `getMethodologyData()` as reading from this table. It is not in `schema.ts` or any migration. All rubric metadata (version, published_at, test count, discipline count) must come from **static constants** (the `RUBRIC_V1_1` map in `src/lib/tech/rubric-map.ts` plus new copy constants). This matches the UI-SPEC's own fallback language in §Data Contract ("Discipline names/descriptions are static constants") but contradicts the `getMethodologyData()` signature that lists `tech_rubric_versions` as a data source.

**Primary recommendation:** Build `<BPRMedal>` + `<BPRMedalPlaceholder>` first (no DB dependency), then the methodology page from pure static constants, then extend `PublicReviewCard` / `PublicReviewDetail` query types last. Coordinate with Phase 16 executor on the `numeric(5,4)` scale decision before any real review is published with a BPR score.

---

<user_constraints>
## User Constraints (from UI-SPEC — CONTEXT.md not yet produced)

> No `/gsd:discuss-phase` CONTEXT.md exists for Phase 17. The `17-UI-SPEC.md` (status: `approved`, reviewed 2026-04-23) serves as the locked constraint source. Planner MUST treat the UI-SPEC as authoritative.

### Locked Decisions (from UI-SPEC — do not re-evaluate)

- **Monochrome only.** No accent colors introduced in Phase 17. The four medal tiers are distinguished entirely by fill + border treatment (MEDAL-01).
- **Medal tiers (fixed classnames from UI-SPEC §Color):**
  - Platinum ≥ 90: `bg-[#f5f5f0] border border-[#f5f5f0] text-[#000]`
  - Gold ≥ 80: `bg-[#888] border border-[#888] text-[#000]`
  - Silver ≥ 70: `bg-transparent border border-[#555] text-[#f5f5f0]` with tier label `text-[#888]`
  - Bronze ≥ 60: `bg-transparent border border-dashed border-[#444] text-[#888]` with tier label `text-[#555]`
  - `< 60` or `< 5 of 7` disciplines → render `<BPRMedalPlaceholder>` (detail page only) or omit medal entirely (review card)
- **No new stack dependencies.** Existing shadcn/base-ui Tooltip, Accordion, Breadcrumb are sufficient.
- **Formula renders as styled code block, NOT KaTeX/MathJax.** Single expression in `font-mono text-sm` on `bg-[#111] border border-[#222] p-6` surface.
- **`/tech/methodology` is `force-static` with `revalidate = 3600`.** Must load under 2 seconds.
- **All copy is committed to code.** Methodology page copy lives in constants (`src/lib/tech/methodology-copy.ts`), not the DB — this is explicitly a Phase 17 simplification vs. the STATE.md note about Tiptap-driven methodology content (that is deferred to v1.2).
- **Medal does NOT glitch.** Explicit exception to the site-wide hover-glitch rule. Page headings (via `<GlitchHeading>`) still glitch per MEMORY rule.
- **Medal tap target is 44×44 px** on mobile via `before:absolute before:inset-[-8px]` pseudo-element.
- **ARIA labels locked** in UI-SPEC §Copywriting Contract — do not rephrase.

### Claude's Discretion

- Component implementation shape (single file `bpr-medal.tsx` with two named exports is recommended but not strictly required)
- Exact prop names if they differ from UI-SPEC defaults (UI-SPEC proposes `tier`, `score`, `disciplineCount`, `variant`, `showTooltip`, `asLink` — deviating requires justification)
- Mobile layout of methodology tables (discipline table, medal threshold table) — UI-SPEC suggests stacked cards below 768px; executor may tune breakpoints
- Error state implementation (UI-SPEC specifies "`Rubric metadata unavailable — showing defaults.`" — wording may be adjusted but the static-fallback requirement is fixed)
- Test scope — Playwright verification required by Success Criterion #1 (four tier screenshots + null state), but specific test file names/locations are executor's call. Note `workflow.nyquist_validation = false` — no Validation Architecture section needed.

### Deferred Ideas (OUT OF SCOPE)

- DB-driven methodology prose (Tiptap editing of methodology sections) — v1.2 scope
- Additional rubric versions beyond v1.1 (changelog shows v1.1 as the only entry today)
- FAQ section on methodology page (UI-SPEC lists `#faq` as an optional anchor — omit unless user-requested)
- `<BPRMedal>` on leaderboard tables (Phase 18 scope, dependent on this phase)
- `<BPRMedal>` on tech homepage spotlight (Phase 19 flagship review scope)
- Section entrance animations on methodology page (UI-SPEC §Motion: "Could add ScrollSection entrance on a polish pass; not required for success criteria")
- Any change to the medal's non-glitching rule
- Any color introduction (monochrome is locked by MEDAL-01)
- Runtime rubric versioning beyond surfacing the `RUBRIC v1.1` badge
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **METH-05** | `/tech/methodology` page live — explains rubric, BPR formula, 7 eligible disciplines, medal thresholds, exclusion policy, rubric versioning | Research confirms: (a) no `tech_rubric_versions` table, so build from static constants; (b) existing ISR pattern `export const revalidate` is used on `/tech/reviews`, `/tech/page.tsx` — reuse; (c) `RUBRIC_V1_1` in `rubric-map.ts` is the source of truth for disciplines and test counts. |
| **METH-06** | Rubric version visibility — `Rubric v1.1` badge in review scorecard | Research confirms: `techReviews.rubricVersion` column exists (`text`, default `"1.1"`); `PublicReviewDetail` type does NOT yet expose it — must extend `getPublishedReviewBySlug`. |
| **MEDAL-01** | `<BPRMedal tier={...} score={...} />` — monochrome, colorblind-safe | Research confirms: (a) `BprTier` type + `bprMedal()` threshold function already exist in `src/lib/tech/bpr.ts`; (b) no existing `bpr-medal.tsx` scaffolding — this is a greenfield component; (c) design tokens (`#f5f5f0`, `#888`, `#555`, `#444`, `#111`) already defined in `src/styles/globals.css`. |
| **MEDAL-02** | Medal surfaces on review detail scorecard, review card (list + carousel + related), category leaderboard, tech homepage spotlight | Phase 17 scope is **detail scorecard + review card only** (see Deferred Ideas). Leaderboard + homepage spotlight are downstream phases (18, 19). |
| **MEDAL-03** | "Not enough data" state — no medal when < 5 of 7 eligible disciplines scored | Research confirms: `computeBprFromPairs()` returns `null` when fewer than 5 ratios; threshold enforced in `bpr.ts`. DB stores `bpr_score = NULL` + `bpr_tier = NULL` in that case. Placeholder chip must read both. |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

The `./CLAUDE.md` file contains actionable directives the planner MUST honor:

- **Package manager:** `pnpm` only. Never npm or yarn.
- **Node:** v24 with TypeScript. Full stack is Next.js 16.2 / React 19 / Tailwind 4 / Drizzle 0.45 / Better Auth / Neon.
- **CodeBox resource constraints (CRITICAL):** 8 cores / 19 GB RAM shared across all sessions. **NEVER run `next build`** as verification — use `pnpm tsc --noEmit` and `pnpm lint` instead. Never run heavy builds in parallel agents.
- **No screenshots auto-loaded into context** — reference by path only.
- **GSD workflow enforced** — edits must go through a GSD command (this research is part of `/gsd:research-phase`). Executor tasks follow `/gsd:execute-phase`.
- **Anti-patterns:** no AGENTS.md, no checkpoint.md, no persona framing in instruction files.
- **Brand name is GlitchTech** (not GlitchTek — older planning docs spell it `GlitchTek`, do not perpetuate that spelling in new surfaces).
- **No hover-glitch on the medal** — medal is intentionally exempt from the "every interactive element glitches" site rule (documented in UI-SPEC §Motion).
- **Hover-glitch on all page headings** — methodology page headings use `<GlitchHeading>` (MEMORY: `feedback_glitch_headers`).
- **Playwright used for visual verification** — part of the project's Phase 17 success criterion #1.

---

## Standard Stack

### Already installed and locked for this phase — no new dependencies required

| Library / Primitive | Version | Purpose in Phase 17 | Source of truth |
|--|--|--|--|
| Next.js | 16.2.1 | RSC for `/tech/methodology`, `generateStaticParams` pattern (not needed here — page has no dynamic segment) | `package.json` |
| React | 19.2.4 | All components | `package.json` |
| Tailwind CSS | 4.x | Monochrome styling, medal variant classnames | `package.json` + `globals.css` uses `@import "tailwindcss"` pattern |
| Drizzle ORM | 0.45.1 | Extended query for `bpr_score` / `bpr_tier` / `rubric_version` columns | `package.json` |
| `@base-ui/react` | 1.3.0 | Tooltip + Accordion primitives. **IMPORTANT:** shadcn wraps `@base-ui/react`, NOT Radix — UI-SPEC says "Radix" but codebase uses base-ui | `src/components/ui/tooltip.tsx`, `src/components/ui/accordion.tsx` |
| `lucide-react` | 1.6.0 | No new icons needed; `ArrowRight` / chevron icons already used in similar CTAs | existing usage |
| `postgres` + Neon driver | — | DB reads for review queries | existing `src/lib/db.ts` |
| `vitest` | 4.1.5 | Unit tests for `bpr.ts` exist (`src/lib/tech/bpr.spec.ts`). Medal rendering tested via Playwright, not vitest | `playwright.config.ts` + `vitest.config.ts` |
| `playwright` | 1.58.2 | Medal tier screenshots + methodology page load test | `playwright.config.ts` |

### Verified available — no install step required

- `src/components/ui/tooltip.tsx` — exports `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- `src/components/ui/accordion.tsx` — exports `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (uses base-ui `multiple` boolean prop, NOT `type="multiple"` — this was the Phase 16 Plan 03 discovery per STATE.md)
- `src/components/ui/breadcrumb.tsx` — exists, uses base-ui `mergeProps`
- `src/components/ui/glitch-heading.tsx` — exports `GlitchHeading` with `text: string` required prop (text is duplicated into two absolutely-positioned layers for the RGB-split effect)

### Alternatives Considered (for reference only — NOT to be used)

| Instead of | Would use | Why rejected |
|--|--|--|
| Static copy constants | DB-driven Tiptap content | UI-SPEC explicitly moves this to v1.2. Phase 17 uses constants. |
| KaTeX / MathJax for formula | Plain text in code block | UI-SPEC rejects — one expression does not justify a math-typesetting dependency on a monochrome brutalist site. |
| Framer Motion entrance animation on methodology sections | `<ScrollSection>` wrapper | UI-SPEC §Motion: explicitly deferred; MVP ships static. |
| `<img>` / Next.js `<Image>` on methodology page | No images at all | UI-SPEC: page is text + one code block. Faster load. |
| Client component for medal | Server component | Medal has no state, only conditional classnames + a link. Server component is correct. Tooltip is the only sub-piece that needs `"use client"` but only the tooltip wrapper, not the medal itself. |

**Installation:** No `pnpm install` required. All primitives exist.

---

## Architecture Patterns

### File layout (from UI-SPEC §Component Inventory — locked)

```
src/
├── components/tech/
│   ├── bpr-medal.tsx                          # NEW — exports BPRMedal + BPRMedalPlaceholder
│   ├── rubric-version-badge.tsx               # NEW — RubricVersionBadge
│   ├── methodology-formula.tsx                # NEW — BPR formula code block + prose
│   ├── methodology-discipline-table.tsx       # NEW — 7 eligible disciplines table
│   ├── methodology-medal-table.tsx            # NEW — 4 medal thresholds with chip previews
│   ├── methodology-exclusion-policy.tsx       # NEW — exclusion prose
│   ├── methodology-changelog.tsx              # NEW — accordion with v1.1 entry
│   ├── review-rating-card.tsx                 # MODIFIED — add BPR medal + rubric badge row
│   └── review-card.tsx                        # MODIFIED — swap star row for compact medal when bprScore !== null
├── lib/tech/
│   ├── bpr.ts                                 # NO CHANGE — exports BprTier, bprMedal(), computeBprScore()
│   ├── rubric-map.ts                          # NO CHANGE — source of truth for disciplines + test counts
│   ├── methodology-copy.ts                    # NEW — static DISCIPLINE_COPY, MEDAL_THRESHOLD_COPY, BPR_FORMULA_STRING, RUBRIC_CHANGELOG
│   ├── methodology.ts                         # NEW — getMethodologyData() (wraps copy + rubric-map — NO DB table read)
│   └── queries.ts                             # MODIFIED — extend PublicReviewCard / PublicReviewDetail with bpr fields + rubricVersion
└── app/(tech)/tech/
    └── methodology/
        └── page.tsx                           # NEW — force-static, revalidate = 3600
```

### Pattern 1: Server Component with "use client" leaf for interactivity

The medal itself is a pure RSC (no hooks, just conditional classnames + a `<Link>`). Only the tooltip leaf needs to be a client component, and base-ui `Tooltip` primitives already handle this internally.

```tsx
// src/components/tech/bpr-medal.tsx — RSC (no "use client")
// Source: UI-SPEC §Component Inventory (Phase 17 approved) + existing pattern from ReviewCard
import Link from "next/link"
import type { BprTier } from "@/lib/tech/bpr"

interface BPRMedalProps {
  tier: BprTier
  score: number                  // 0–100 scale (NOT 0–1 — see Pitfall #1)
  disciplineCount?: number       // defaults 7
  variant?: "compact" | "full"   // defaults "full"
  showTooltip?: boolean          // defaults true
  asLink?: boolean               // defaults true
}

const TIER_CLASSES: Record<BprTier, { bg: string; border: string; text: string; labelText: string }> = {
  platinum: { bg: "bg-[#f5f5f0]", border: "border border-[#f5f5f0]", text: "text-[#000]", labelText: "text-[#000]" },
  gold:     { bg: "bg-[#888]",    border: "border border-[#888]",    text: "text-[#000]", labelText: "text-[#000]" },
  silver:   { bg: "bg-transparent", border: "border border-[#555]",  text: "text-[#f5f5f0]", labelText: "text-[#888]" },
  bronze:   { bg: "bg-transparent", border: "border border-dashed border-[#444]", text: "text-[#888]", labelText: "text-[#555]" },
}

export function BPRMedal({ tier, score, disciplineCount = 7, variant = "full", showTooltip = true, asLink = true }: BPRMedalProps) {
  const classes = TIER_CLASSES[tier]
  const rounded = Math.round(score)
  // ...render logic per UI-SPEC §Visual Contract
}
```

**Pattern notes:**
- No `React.memo` — medal is trivially cheap to re-render
- No state — pure function of props
- Classnames as a lookup table (not a `cn()` cascade) — easier to grep and modify tier styling

### Pattern 2: Static ISR page (force-static + revalidate)

Copy the pattern from `src/app/(tech)/tech/page.tsx` and `src/app/(tech)/tech/reviews/page.tsx`:

```tsx
// src/app/(tech)/tech/methodology/page.tsx
// Source: existing pattern from src/app/(tech)/tech/page.tsx (revalidate = 300)
import type { Metadata } from "next"
import { getMethodologyData } from "@/lib/tech/methodology"

export const dynamic = "force-static"
export const revalidate = 3600  // 1 hour — longer than /tech (300s) because methodology changes rarely

export const metadata: Metadata = {
  title: "Methodology — Glitch Tech",
  description: "How we score, grade, and compare tech reviews.",
}

export default async function MethodologyPage() {
  const data = getMethodologyData()  // SYNCHRONOUS — pure constant return, not a DB call
  // ...
}
```

**Why `force-static` + `revalidate = 3600`:**
- The page has no user-dependent data and no dynamic segments
- Methodology copy is static constants — there is no DB read that needs to re-execute on every revalidation cycle
- `3600` is long enough that the page is effectively always cached; any change to methodology is a code PR + redeploy
- Matches UI-SPEC §Load Performance Requirement

### Pattern 3: Extending query types (additive — no breaking change)

`PublicReviewCard` and `PublicReviewDetail` must gain `bprScore`, `bprTier`, `bprDisciplineCount`. Extend the SELECT in `fetchCardRows` and `getPublishedReviewBySlug`:

```ts
// src/lib/tech/queries.ts — extend existing fetchCardRows / getPublishedReviewBySlug
// ALREADY PRESENT: import from @/db/schema includes techReviews which has bprScore, bprTier columns

// Example additive select fields inside fetchCardRows:
bprScore: techReviews.bprScore,
bprTier: techReviews.bprTier,
rubricVersion: techReviews.rubricVersion,
```

**The one field with no DB column: `bprDisciplineCount`.** The review table stores `bpr_score` (null or the final number) but does **not** store "how many disciplines contributed." The UI-SPEC requires this count for the tooltip copy.

**Three options for `bprDisciplineCount`:**

1. **Compute-on-read** — re-run `computeBprScore().perDiscipline`, count non-null. Expensive per card. Not recommended.
2. **Denormalize on ingest** — add a `bpr_discipline_count` column in Phase 17 via a new migration, populate on `computeBprScore` commit. Schema debt but correct.
3. **Derive lazily for detail pages only** — for the list/carousel medal variant use `disciplineCount = 7` default (tooltip reads "Based on all 7 eligible disciplines"), and only compute the real count on the detail page via a separate query. Matches UI-SPEC's `showTooltip={false}` on compact cards.

**Recommendation: Option 3.** The UI-SPEC already turns off tooltips on compact card medals (§Review Card Integration: "Compact medal `showTooltip={false}` on cards"). Only the detail scorecard medal needs the real count. The detail page can do one additional query to count the non-null per-discipline ratios, OR the `computeBprScore` caller (Phase 16 ingest commit) can be extended to store this count. Planner decides.

### Anti-patterns to Avoid

- **Hard-coding a `<div>` instead of `<Link>`.** UI-SPEC: the medal is always a `<Link>` when `asLink={true}` (the default). The click target must navigate to `/tech/methodology#bpr` (or `#exclusion-policy` for placeholder).
- **Using `text-2xl` / `text-lg` / `text-xs` anywhere outside medal + formula block.** UI-SPEC §Typography explicitly scope-limits these Tailwind utility sizes to medal internals and formula block only.
- **Putting the tooltip on the placeholder.** The placeholder has its own aria-label and links directly to `#exclusion-policy`. A hover tooltip duplicates information and creates awkward mobile UX.
- **Animating the medal on hover.** Medal is locked to "no motion" (UI-SPEC §Motion — explicit exception to site-wide glitch rule). Only the tooltip fades in.
- **Rendering the placeholder on review cards.** UI-SPEC: review cards omit the medal entirely when `bprScore === null` and fall back to the star rating. The placeholder is detail-page-only.
- **Reading `bpr_score` without scale normalization.** See Pitfall #1 below. Assume 0–100 scale in code but verify against actual stored value on first live ingest.
- **Using a Drizzle `findFirst` with `columns: { rubricVersion: true }` on a table that has a check constraint** — Phase 15 learned that `tech_reviews_published_at_chk` can fire on invalid updates. Reading is fine; just don't write.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|--|--|--|--|
| Monochrome medal variants | Custom CSS gradients or ad-hoc class cascades | Simple lookup table keyed by `BprTier` (pattern above) | Four tiers, four fixed classnames — a table is more readable and greppable than a `cn()` ladder |
| Tooltip | Custom hover portal + positioning | `src/components/ui/tooltip.tsx` (base-ui under the hood) | Handles focus-trap, keyboard dismiss, portal, reduced-motion, all automatically |
| Accordion for changelog | Custom `<details>` with animation | `src/components/ui/accordion.tsx` (base-ui) — use `multiple` boolean prop (NOT `type="multiple"`) per Phase 16 Plan 03 lesson | Keyboard nav + aria roles handled |
| ISR caching | Manual `fetch` with `revalidate` option + `cache: "force-cache"` | Page-level `export const revalidate = 3600` + `export const dynamic = "force-static"` | Next.js 16 App Router native pattern, matches existing `/tech/page.tsx` |
| Static page metadata | Inline `<head>` tags | `export const metadata: Metadata` | Already used on every `(tech)` route; Next.js handles dedup + OG + twitter |
| Breadcrumb chrome | Custom `<nav>` with chevrons | `src/components/ui/breadcrumb.tsx` | Already consumed by review detail page (Phase 07.6) |
| Math formula typesetting | KaTeX / MathJax | Plain text in styled code block | UI-SPEC §Design System: one expression is not worth the bundle cost |
| Glitch hover on headings | Inline animation classnames | `<GlitchHeading text="METHODOLOGY">METHODOLOGY</GlitchHeading>` | Site-wide rule — MEMORY `feedback_glitch_headers` |

**Key insight:** Phase 17 is a consumption phase, not an authoring phase. Every primitive the UI-SPEC calls for already exists. The executor's job is to compose them correctly.

---

## Runtime State Inventory

> **Not applicable — greenfield component phase.** Phase 17 creates new files and adds optional columns-worth of data plumbing, but it does NOT rename, refactor, or migrate any existing runtime state.

Explicit confirmation by category:

| Category | Items Found | Action Required |
|--|--|--|
| Stored data | None — no data migration needed. `bpr_score` / `bpr_tier` / `rubric_version` columns already exist (Phase 15) and default to null / "1.1". | None |
| Live service config | None — no external services read or consume Phase 17 output at runtime | None |
| OS-registered state | None — no scheduled tasks, systemd units, or launchd plists touched | None |
| Secrets / env vars | None — no new env vars introduced; existing `DATABASE_URL` used by Drizzle | None |
| Build artifacts | None — no new CLI tools, no new compiled packages, no new Docker images | None |

**The canonical question:** *After every Phase 17 file lands, what runtime systems still carry Phase 17 assumptions?* Answer: none — Phase 17 ships pure code and static assets, no runtime side effects beyond the Next.js ISR cache being warmed on first request.

---

## Environment Availability

> **Not applicable.** Phase 17 has no external tool, service, or runtime dependencies beyond those already running for every other phase (Node 24, pnpm, Postgres via Neon, Next.js dev server). No new binaries or services required.

Implicit dependencies (all verified present for current dev work on other phases):

| Dependency | Required By | Available | Version | Fallback |
|--|--|--|--|--|
| Node.js | All Next.js compilation + tests | ✓ | v24 (per CLAUDE.md) | — |
| pnpm | Package mgmt + scripts | ✓ | per nvm config | — |
| Postgres (Neon) | `PublicReviewDetail` query for bpr fields | ✓ | managed | Static fallback on methodology page (UI-SPEC §Empty state) |
| Playwright | Phase 17 success criterion #1 — medal screenshots | ✓ | 1.58.2 | — |
| TypeScript | `pnpm tsc --noEmit` verification | ✓ | 5.x (per CLAUDE.md) | — |

---

## Common Pitfalls

### Pitfall 1: BPR score scale mismatch (CRITICAL — blocks live data)

**What goes wrong:** `computeBprScore()` in `src/lib/tech/bpr.ts` returns values on a **0–100 scale** (the `computeBprFromPairs` helper explicitly multiplies by 100 on line 46: `return Math.exp(sumLn / ratios.length) * 100`). However, `tech_reviews.bpr_score` is declared `numeric(5, 4)` in both `schema.ts:780` and migration `0003_methodology_lock.sql:82` — that column holds values from `0.0000` to `9.9999`. A score of `88.5` from `computeBprScore` would fail the insert with a Postgres `numeric field overflow` error.

**Why it happens:** Schema was written assuming `bpr_score` is a decimal ratio (0.0000–1.0000), but the scoring function returns a percentage. Neither Phase 15 nor Phase 16 caught it because Phase 16 has not yet committed a real review's BPR score — no live ingest has hit the overflow.

**Evidence:**
- `src/lib/tech/bpr.ts:42-46` — `computeBprFromPairs` returns 0–100
- `src/lib/tech/bpr.spec.ts:7-16` — `bprMedal(90)` / `bprMedal(89.99)` threshold tests all use 0–100 scale; confirms the intended API surface
- `src/db/schema.ts:780` — `bprScore: numeric("bpr_score", { precision: 5, scale: 4 })` — max value 9.9999
- `src/actions/admin-tech-ingest.ts:488` — `bprScore: bprResult.score !== null ? String(bprResult.score) : null` — writes the raw 0–100 number as a stringified numeric. **This WILL fail at the DB layer the first time a real review commits with a finite BPR score.**

**How to avoid for Phase 17:**
1. **Flag this to the Phase 16 executor.** Phase 17 cannot assume the column is either 0–1 or 0–100 until Phase 16 settles it.
2. **Assume 0–100 in `<BPRMedal>` component code.** The UI-SPEC also assumes 0–100 (e.g. "Platinum: `score ≥ 90`"). Matches the threshold function.
3. **Defensive read in queries.ts:** if `bprScore` ever does come back as 0.0000–1.0000 (i.e. Phase 16 fixes the overflow by scaling down before insert), multiply by 100 before returning it in `PublicReviewCard` / `PublicReviewDetail`. The planner should spec the defensive read so the medal component never receives an ambiguous number.
4. **Coordinate with Phase 16 on the fix.** The clean fix is migration `0004_fix_bpr_precision.sql`: `ALTER COLUMN bpr_score TYPE numeric(6, 2)` (range 0.00–9999.99; holds any realistic percentage including overshoot > 100). This is NOT Phase 17 scope but Phase 17 cannot ship to production without it.

**Warning signs:** First real ingest throws `numeric field overflow`; dry-run Phase 17 against seeded review data and the medal shows an impossible score like `9%`.

### Pitfall 2: `tech_rubric_versions` table does not exist (HIGH — contradicts UI-SPEC)

**What goes wrong:** UI-SPEC §Data Contract and §Implementation Notes describe `getMethodologyData()` reading rubric metadata from `tech_rubric_versions` with fields `version`, `published_at`, etc. Grep of `schema.ts` and all migrations finds no such table.

**Why it happens:** The rubric is stored as a `text` column on `tech_reviews.rubric_version` (default `"1.1"`) and on `tech_benchmark_runs.rubric_version`. Phase 15 did not introduce a dedicated rubric-metadata table — instead, the rubric is an append-only constant in `src/lib/tech/rubric-map.ts` (`RUBRIC_V1_1` map). Phase 15 CONTEXT/STATE decisions confirm this: "Phase 15 seed is self-contained" and "43 entries in RUBRIC_V1_1".

**Evidence:**
- `grep -n "tech_rubric_versions\|techRubricVersions" src/db/schema.ts migrations/*.sql` → no matches
- `RUBRIC_V1_1` object in `src/lib/tech/rubric-map.ts` has 43 entries across 13 disciplines, 7 BPR-eligible
- UI-SPEC §Data Contract explicitly hedges: "Discipline names/descriptions are **static constants** on the server (`src/lib/tech/methodology-copy.ts`) — not DB-driven."

**How to avoid:**
- Implement `getMethodologyData()` as a **synchronous pure function** that returns data assembled from `RUBRIC_V1_1` + new `DISCIPLINE_COPY` / `MEDAL_THRESHOLD_COPY` / `RUBRIC_CHANGELOG` constants. No `db.*` calls.
- The `publishedAt` field comes from a `RUBRIC_CHANGELOG` constant: `{ "1.1": new Date("2026-04-23") }`. Source from Phase 15 seed commit date.
- Document in the methodology.ts file header that the function is pure — no error path needed because static constants cannot fail.
- UI-SPEC §Empty state says "If `getMethodologyData()` throws (DB unavailable), the page renders with a static fallback". Since the function never touches the DB, this fallback is moot — simplify the page to assume success.

### Pitfall 3: `bprDisciplineCount` is not stored anywhere

**What goes wrong:** UI-SPEC requires the tooltip to read "Based on **X of 7** eligible disciplines" where X is the count that actually contributed to the score. But `tech_reviews` has no column for this count — only `bpr_score` (the final number) and `bpr_tier`.

**Why it happens:** `computeBprScore` returns `perDiscipline: Record<string, number | null>` (source: `bpr.ts:74`), but the caller in `admin-tech-ingest.ts:486-492` only persists `score` and `tier` — the per-discipline breakdown is discarded.

**How to avoid (two options — planner chooses):**
- **Option A (clean):** Add a new column `bpr_discipline_count integer` in a Phase 17 migration; populate from `Object.values(perDiscipline).filter(v => v !== null).length` on ingest commit. One-line schema change + one-line ingest update.
- **Option B (defer):** For Phase 17, default `disciplineCount = 7` on all medals (matching UI-SPEC's compact-card behavior where `showTooltip={false}`). Detail page adds a separate count query that re-runs the discipline aggregation. More expensive but no schema change.

The UI-SPEC §Implementation Notes §Critical Path implicitly assumes option A ("extend `PublicReviewCard` with `bprDisciplineCount: number (0–7)`") — but this is called out as "required so review cards and detail pages can render without an extra fetch", which means option A is the cleaner path. Planner should pick A.

### Pitfall 4: Bronze tier label contrast is 3.1:1 — below WCAG AA

**What goes wrong:** Bronze tier label (`text-[#555]` on `#111` page background) is 3.1:1 — below the 4.5:1 threshold for normal text and 3:1 for large text (and at 11px, the label is NOT large text).

**Why it happens:** UI-SPEC §Accessibility explicitly documents this as an **accepted trade-off** — "Bronze is intentionally the 'barely earned' tier and the visual hierarchy demands the muted label. `aria-label` provides full accessible disclosure regardless." But it still fails WCAG AA mechanically.

**How to avoid:**
- Do NOT silently change Bronze to a higher-contrast color — the exception is load-bearing for visual hierarchy.
- DO ensure the `aria-label` is exhaustive and machine-readable (UI-SPEC §Copywriting Contract specifies the full template).
- DO leave a code comment in `bpr-medal.tsx` pointing to UI-SPEC §Accessibility: "Bronze label contrast exception accepted — documented in UI-SPEC."
- If a future audit flags this, the fix is not to change color but to scale the label up (which is an 07.4 design system change, not Phase 17).

### Pitfall 5: `GlitchHeading` requires a plain string `text` prop

**What goes wrong:** Executors sometimes pass JSX children to `<GlitchHeading>` and forget the required `text: string` prop — the duplicated layers won't render and the hover effect silently fails.

**Why it happens:** The component takes both `children` (the visible layer) AND `text` (the string used for the two absolutely-positioned glitch layers). If you pass only children, the glitch never fires.

**Evidence:** `src/components/ui/glitch-heading.tsx:4-8` — the `text: string` prop is required, used to duplicate content into `layer1` / `layer2` pseudo-elements.

**How to avoid:**
- Always pass both: `<GlitchHeading text="METHODOLOGY">METHODOLOGY</GlitchHeading>`.
- For all-caps headings, pass the uppercase form to both.
- For sub-section headings, pass exactly the visible text — the glitch effect mirrors the visible string.

### Pitfall 6: Playwright tests run against port 3004, NOT a fresh build

**What goes wrong:** Executors run `pnpm next build` to verify (forbidden per CLAUDE.md), or they forget that Playwright's `baseURL: "http://localhost:3004"` requires a running dev server.

**How to avoid:**
- Verification command is `pnpm tsc --noEmit && pnpm lint`.
- Playwright tests assume dev server is already on port 3004 (via PM2 per workspace config). Do NOT start a second server in the test file.
- Match existing test pattern from `tests/07.5-review-editor.spec.ts` and `tests/16.1-breakpoints.spec.ts`.

### Pitfall 7: Base-UI `Accordion` `multiple` prop is a boolean, not a string

**What goes wrong:** Copy-pasting Radix accordion code gives `<Accordion type="multiple">`, which silently fails in base-ui.

**Evidence:** STATE.md Phase 16 Plan 03 decision: "`@base-ui` accordion uses multiple boolean (not type='multiple')".

**How to avoid:** Use `<Accordion multiple>` or `<Accordion multiple={false}>`. Check `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` for a working example in this codebase.

---

## Code Examples

All examples use the patterns verified in the codebase.

### Example 1: BPR Medal component skeleton

```tsx
// src/components/tech/bpr-medal.tsx
// Source: UI-SPEC §Component Inventory §Visual Contract; styling from UI-SPEC §Color
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { BprTier } from "@/lib/tech/bpr"

const TIER_CLASSES: Record<BprTier, {
  bg: string; border: string; text: string; labelText: string
}> = {
  platinum: {
    bg: "bg-[#f5f5f0]", border: "border border-[#f5f5f0]",
    text: "text-[#000]", labelText: "text-[#000]",
  },
  gold: {
    bg: "bg-[#888]", border: "border border-[#888]",
    text: "text-[#000]", labelText: "text-[#000]",
  },
  silver: {
    bg: "bg-transparent", border: "border border-[#555]",
    text: "text-[#f5f5f0]", labelText: "text-[#888]",
  },
  bronze: {
    // Bronze label contrast exception accepted — see UI-SPEC §Accessibility.
    bg: "bg-transparent", border: "border border-dashed border-[#444]",
    text: "text-[#888]", labelText: "text-[#555]",
  },
}

const TIER_LABEL: Record<BprTier, string> = {
  platinum: "PLATINUM",
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE",
}

interface BPRMedalProps {
  tier: BprTier
  score: number                  // 0–100 scale. See Pitfall #1.
  disciplineCount?: number       // defaults 7
  variant?: "compact" | "full"   // defaults "full"
  showTooltip?: boolean          // defaults true
  asLink?: boolean               // defaults true
}

export function BPRMedal({
  tier,
  score,
  disciplineCount = 7,
  variant = "full",
  showTooltip = true,
  asLink = true,
}: BPRMedalProps) {
  const t = TIER_CLASSES[tier]
  const rounded = Math.round(score)
  const tooltipText = disciplineCount === 7
    ? "Based on all 7 eligible disciplines. Click for methodology."
    : `Based on ${disciplineCount} of 7 eligible disciplines. Click for methodology.`
  const ariaLabel = `${TIER_LABEL[tier]} medal: ${rounded} percent. Based on ${disciplineCount} of 7 eligible disciplines. See methodology.`

  const inner = variant === "compact" ? (
    <span className={[
      "inline-flex items-center gap-2 px-2 py-1 h-6 font-mono",
      t.bg, t.border, t.text,
    ].join(" ")}>
      <span className={["text-[11px] font-bold uppercase tracking-[0.1em]", t.labelText].join(" ")}>
        {TIER_LABEL[tier]}
      </span>
      <span className="text-xs font-bold">
        {rounded}
        <span className="opacity-80">%</span>
      </span>
    </span>
  ) : (
    <span className={[
      "relative inline-flex min-w-[120px] flex-col items-center px-4 py-3 font-mono",
      // 44x44 mobile tap target per UI-SPEC §Spacing Scale
      "before:absolute before:inset-[-8px] before:content-['']",
      t.bg, t.border, t.text,
    ].join(" ")}>
      <span className="text-2xl font-bold">
        {rounded}
        <span className="text-xs opacity-80">%</span>
      </span>
      <span className={["mt-2 text-[11px] font-bold uppercase tracking-[0.1em]", t.labelText].join(" ")}>
        {TIER_LABEL[tier]}
      </span>
    </span>
  )

  const wrapped = asLink ? (
    <Link
      href="/tech/methodology#bpr"
      aria-label={ariaLabel}
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
    >
      {inner}
    </Link>
  ) : (
    <span aria-label={ariaLabel}>{inner}</span>
  )

  if (!showTooltip) return wrapped

  return (
    <Tooltip>
      <TooltipTrigger render={wrapped} />
      <TooltipContent className="bg-[#111] border border-[#222] text-[#f5f5f0] font-sans text-[13px] px-3 py-2">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}

// Placeholder — rendered only on detail scorecard when bprScore === null AND count < 5
interface BPRMedalPlaceholderProps {
  disciplineCount: number
  asLink?: boolean
}

export function BPRMedalPlaceholder({ disciplineCount, asLink = true }: BPRMedalPlaceholderProps) {
  const inner = (
    <span className="inline-flex min-w-[120px] flex-col items-center border border-dashed border-[#333] bg-transparent px-4 py-3 text-[#888]">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
        NOT ENOUGH DATA
      </span>
      <span className="font-sans text-[13px] text-[#888]">
        {disciplineCount} of 7 disciplines scored
      </span>
    </span>
  )
  const ariaLabel = `Not enough data for a BPR medal. ${disciplineCount} of 7 eligible disciplines scored. See methodology for details.`
  return asLink ? (
    <Link href="/tech/methodology#exclusion-policy" aria-label={ariaLabel}>
      {inner}
    </Link>
  ) : (
    <span aria-label={ariaLabel}>{inner}</span>
  )
}
```

### Example 2: Methodology page skeleton

```tsx
// src/app/(tech)/tech/methodology/page.tsx
// Source: existing pattern from src/app/(tech)/tech/page.tsx (force-static ISR)
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { getMethodologyData } from "@/lib/tech/methodology"
import { MethodologyFormula } from "@/components/tech/methodology-formula"
import { MethodologyDisciplineTable } from "@/components/tech/methodology-discipline-table"
import { MethodologyMedalTable } from "@/components/tech/methodology-medal-table"
import { MethodologyExclusionPolicy } from "@/components/tech/methodology-exclusion-policy"
import { MethodologyChangelog } from "@/components/tech/methodology-changelog"
import { TechNewsletter } from "@/components/home/tech-newsletter"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Methodology — Glitch Tech",
  description: "How we score, grade, and compare tech reviews. BPR formula, 7 eligible disciplines, medal thresholds, exclusion policy.",
}

export default function MethodologyPage() {
  const data = getMethodologyData()

  return (
    <main className="min-h-screen bg-black text-[#f5f5f0]">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-16">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/tech">Tech</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem>Methodology</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-8 font-mono text-[44px] font-bold uppercase leading-none md:text-[64px]">
          <GlitchHeading text="METHODOLOGY">METHODOLOGY</GlitchHeading>
        </h1>
        <p className="mt-4 font-sans text-[15px] text-[#888]">
          How we score, grade, and compare tech reviews.
        </p>
        {/* Jump-to chip row per UI-SPEC */}
      </section>

      <MethodologyFormula formula={data.bprFormula} />
      <MethodologyDisciplineTable disciplines={data.disciplines.filter(d => d.bprEligible)} />
      <MethodologyMedalTable thresholds={data.medalThresholds} />
      <MethodologyExclusionPolicy />
      <MethodologyChangelog entries={data.rubricChangelog} />

      <section className="mx-auto max-w-5xl px-6 py-12 text-center">
        <Link
          href="/tech/reviews"
          aria-label="Back to tech reviews list"
          className="inline-flex items-center gap-3 border border-[#f5f5f0] bg-transparent px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-black"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>Back to Reviews</span>
        </Link>
      </section>

      <TechNewsletter />
    </main>
  )
}
```

### Example 3: `getMethodologyData()` — pure function

```ts
// src/lib/tech/methodology.ts
// NO "server-only" — pure function of constants, safe to import anywhere.
import { RUBRIC_V1_1, BPR_ELIGIBLE_DISCIPLINES, type BenchmarkDiscipline } from "./rubric-map"
import type { BprTier } from "./bpr"

const DISCIPLINE_COPY: Record<BenchmarkDiscipline, { name: string; description: string }> = {
  cpu: { name: "CPU", description: "Core compute performance across Geekbench 6, Cinebench 2024, and standard multi-thread tests." },
  gpu: { name: "GPU", description: "Graphics compute across 3DMark, Blender GPU, and real-world render workloads." },
  llm: { name: "LLM", description: "Local large-language-model inference throughput (tokens/sec) on standardized models." },
  video: { name: "Video", description: "Video encoding and decoding throughput — H.264, H.265, AV1." },
  dev: { name: "Dev", description: "Developer workload benchmarks — compile, link, test suite runtime." },
  python: { name: "Python", description: "Python-specific numeric and scripting workloads." },
  games: { name: "Games", description: "Real-world game performance — frame rates at standardized settings across a fixed title list." },
  memory: { name: "Memory", description: "Memory bandwidth via STREAM (AC only, not BPR-eligible)." },
  storage: { name: "Storage", description: "Sequential + random I/O via AmorphousDiskMark (AC only, not BPR-eligible)." },
  thermal: { name: "Thermal", description: "Sustained-load retention + peak temperature (AC only, not BPR-eligible)." },
  wireless: { name: "Wireless", description: "Wi-Fi + Thunderbolt throughput (AC only, not BPR-eligible)." },
  display: { name: "Display", description: "Color accuracy + gamut coverage via DisplayCAL (AC only, not BPR-eligible)." },
  battery_life: { name: "Battery Life", description: "Standardized battery drain scenarios (battery only, not BPR-eligible)." },
}

const MEDAL_THRESHOLDS: Array<{ tier: BprTier; minScore: number; maxScore: number | null; description: string }> = [
  { tier: "platinum", minScore: 90, maxScore: null, description: "Near-zero battery penalty." },
  { tier: "gold",     minScore: 80, maxScore: 89,   description: "Minor battery impact — holds most performance unplugged." },
  { tier: "silver",   minScore: 70, maxScore: 79,   description: "Noticeable dropoff on battery — workable but visible." },
  { tier: "bronze",   minScore: 60, maxScore: 69,   description: "Significant battery drop — plan on plugging in for heavy work." },
]

const RUBRIC_CHANGELOG = [
  {
    version: "1.1",
    publishedAt: new Date("2026-04-23"),
    highlights: [
      "43 tests across 13 disciplines",
      "7 disciplines BPR-eligible: CPU, GPU, LLM, Video, Dev, Python, Games",
      "Battery + AC modes captured for every BPR-eligible test",
      "Medal thresholds: Platinum ≥90, Gold ≥80, Silver ≥70, Bronze ≥60",
    ],
  },
]

const BPR_FORMULA = "BPR = exp( (1/n) × Σ ln(battery_i / ac_i) ) × 100"

export interface MethodologyData {
  disciplines: Array<{ slug: BenchmarkDiscipline; name: string; description: string; bprEligible: boolean }>
  bprFormula: string
  currentRubric: { version: string; publishedAt: Date; testCount: number; disciplineCount: number; bprEligibleCount: number }
  rubricChangelog: typeof RUBRIC_CHANGELOG
  medalThresholds: typeof MEDAL_THRESHOLDS
}

export function getMethodologyData(): MethodologyData {
  const allDisciplines = Object.keys(DISCIPLINE_COPY) as BenchmarkDiscipline[]
  const disciplines = allDisciplines.map(slug => ({
    slug,
    name: DISCIPLINE_COPY[slug].name,
    description: DISCIPLINE_COPY[slug].description,
    bprEligible: BPR_ELIGIBLE_DISCIPLINES.includes(slug),
  }))
  return {
    disciplines,
    bprFormula: BPR_FORMULA,
    currentRubric: {
      version: "1.1",
      publishedAt: RUBRIC_CHANGELOG[0].publishedAt,
      testCount: Object.keys(RUBRIC_V1_1).length,  // 43
      disciplineCount: allDisciplines.length,      // 13
      bprEligibleCount: BPR_ELIGIBLE_DISCIPLINES.length,  // 7
    },
    rubricChangelog: RUBRIC_CHANGELOG,
    medalThresholds: MEDAL_THRESHOLDS,
  }
}
```

### Example 4: Extending PublicReviewCard / Detail queries

```ts
// Inside src/lib/tech/queries.ts — addition to PublicReviewCard interface
export interface PublicReviewCard {
  // ... existing fields ...
  bprScore: number | null          // 0-100 scale (see Pitfall #1)
  bprTier: BprTier | null
  // Decision: bprDisciplineCount deferred — see Pitfall #3.
  // Planner chooses Option A (new column) or Option B (default 7).
}

// Inside fetchCardRows — extended SELECT
.select({
  // ... existing fields ...
  bprScore: techReviews.bprScore,    // numeric(5,4) — parse with parseFloat
  bprTier: techReviews.bprTier,      // enum: platinum | gold | silver | bronze
})

// ... row mapping:
return rows.map((r) => ({
  // ... existing ...
  bprScore: r.bprScore !== null ? parseFloat(r.bprScore) : null,
  bprTier: r.bprTier as BprTier | null,
}))
```

### Example 5: ReviewRatingCard modification pattern

```tsx
// src/components/tech/review-rating-card.tsx — MODIFIED
import { ReviewRatingBar } from "./review-rating-bar"
import { BPRMedal, BPRMedalPlaceholder } from "./bpr-medal"
import { RubricVersionBadge } from "./rubric-version-badge"
import type { BprTier } from "@/lib/tech/bpr"

interface ReviewRatingCardProps {
  ratings: { performance: number; build: number; value: number; design: number }
  overall: number
  // NEW:
  bprScore: number | null
  bprTier: BprTier | null
  bprDisciplineCount: number
  rubricVersion: string
}

export function ReviewRatingCard({ ratings, overall, bprScore, bprTier, bprDisciplineCount, rubricVersion }: ReviewRatingCardProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Rating
      </h2>
      <div className="border border-[#222] bg-[#111] p-6 md:p-8">
        {/* NEW row: BPR medal + rubric version badge */}
        <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          {bprScore !== null && bprTier !== null
            ? <BPRMedal tier={bprTier} score={bprScore} disciplineCount={bprDisciplineCount} />
            : <BPRMedalPlaceholder disciplineCount={bprDisciplineCount} />}
          <RubricVersionBadge version={rubricVersion} />
        </div>
        <div className="h-px w-full bg-[#222]" aria-hidden="true" />
        <div className="mt-6 flex flex-col gap-4">
          <ReviewRatingBar label="Performance" value={ratings.performance} delay={0.0} />
          <ReviewRatingBar label="Build Quality" value={ratings.build} delay={0.05} />
          <ReviewRatingBar label="Value" value={ratings.value} delay={0.1} />
          <ReviewRatingBar label="Design" value={ratings.design} delay={0.15} />
        </div>
        <div className="my-6 h-px w-full bg-[#222]" aria-hidden="true" />
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Overall
          </span>
          <span className="font-mono text-2xl font-bold text-[#f5f5f0] md:text-3xl">
            {overall.toFixed(1)} / 10
          </span>
        </div>
      </div>
    </section>
  )
}
```

---

## State of the Art

| Old approach | Current approach | Evidence in project |
|--|--|--|
| Framer Motion entrance on every section | Static RSC for methodology; no entrance animations on MVP | UI-SPEC §Motion §Methodology section entrance: "None on Phase 17 MVP" |
| Radix UI primitives | `@base-ui/react` primitives (successor of Radix, by the same team) | `src/components/ui/tooltip.tsx`, `accordion.tsx` — all base-ui imports |
| Star rating as primary medal on review cards | BPR medal when present, star as fallback only | UI-SPEC §Review Card Integration |
| DB-driven content via Tiptap for methodology | Static TypeScript constants | UI-SPEC §Data Contract — v1.2 scope deferral |
| Client components with `useState` for hover tooltips | Server component medal + `@base-ui/react` Tooltip leaf | `src/components/admin/newsletter-list-table.tsx` shows the pattern |

**Deprecated / outdated:**
- Any reference in older planning docs to "GlitchTek" — the tech sub-brand is **GlitchTech** (matches `glitchtech.io`). UI-SPEC §brand-note.

---

## Open Questions

1. **Which option for `bprDisciplineCount` — column or compute?**
   - Known: UI-SPEC requires the count for the tooltip copy.
   - Unclear: Phase 17 scope constraint vs. schema debt budget.
   - Recommendation: **Option A** (add `bpr_discipline_count integer` in a Phase 17 migration) because Phase 16 is still EXECUTING and can piggyback the schema change.

2. **Does Phase 17 ship before or after the `numeric(5,4)` scale fix?**
   - Known: Neither has live data yet; overflow bug hasn't fired.
   - Unclear: Which phase "owns" migration `0004_fix_bpr_precision.sql`.
   - Recommendation: Flag to the Phase 16 executor; Phase 17 assumes 0–100 scale in code; release blocker is that the overflow fix must ship before the first real ingest.

3. **Where does `publishedAt` for rubric v1.1 come from?**
   - Known: No `tech_rubric_versions` table. Phase 15 seed didn't stamp a timestamp.
   - Recommendation: Hard-code `new Date("2026-04-23")` in the `RUBRIC_CHANGELOG` constant (matches Phase 17 UI-SPEC date). Not DB-driven. Update manually on v1.2.

4. **Does the bottom CTA on methodology ("Back to Reviews") use the exact 07.6 button pattern?**
   - Known: UI-SPEC calls it "bordered-ghost → filled-on-hover pattern inherited from 07.6".
   - Recommendation: Grep the review detail page for the CTA button (`Compare to another product` button in `src/app/(tech)/tech/reviews/[slug]/page.tsx:158`) and reuse the exact classname stack, but with arrow left-rotated and labeled "Back to Reviews".

5. **Is there a visual regression baseline for the existing `ReviewRatingCard` that must not drift?**
   - Known: No existing baseline file in `tests/` directory matches "rating-card" or "scorecard".
   - Recommendation: Phase 17's Playwright test IS the first baseline for the modified card. Add it and commit the screenshot.

---

## Sources

### Primary (HIGH confidence)

- `src/lib/tech/bpr.ts` — exports `BprTier`, `bprMedal()`, `computeBprScore()`, `computeBprFromPairs()`. BPR scoring is 0–100 scale.
- `src/lib/tech/rubric-map.ts` — `RUBRIC_V1_1` map (43 entries, 13 disciplines), `BPR_ELIGIBLE_DISCIPLINES` (7: cpu/gpu/llm/video/dev/python/games).
- `src/lib/tech/queries.ts` — `PublicReviewCard`, `PublicReviewDetail`, `fetchCardRows` to extend.
- `src/db/schema.ts` — `techReviews` columns `bprScore: numeric(5,4)` (PITFALL), `bprTier: techBprTierEnum`, `rubricVersion: text default "1.1"`. `techBenchmarkTests` has `discipline + mode + bprEligible` columns. No `techRubricVersions` table.
- `src/db/migrations/0003_methodology_lock.sql` — confirms `numeric(5,4)` column and enum definitions.
- `src/components/ui/tooltip.tsx`, `accordion.tsx`, `breadcrumb.tsx` — verified present, all using `@base-ui/react`.
- `src/components/ui/glitch-heading.tsx` — requires `text: string` prop + children.
- `src/components/tech/review-rating-card.tsx` — current shape (38 lines; props `ratings` + `overall`).
- `src/components/tech/review-card.tsx` — current shape (66 lines; imports `Star` from lucide, uses `PublicReviewCard` type).
- `src/components/tech/related-reviews-carousel.tsx` — uses `ReviewCard` + `GlitchHeading`; Embla carousel.
- `src/app/(tech)/tech/reviews/[slug]/page.tsx` — shows the call site that will pass new props to `ReviewRatingCard`; uses `revalidate = 60`.
- `src/app/(tech)/tech/page.tsx` — shows `revalidate = 300` + ISR pattern to copy for methodology page.
- `src/actions/admin-tech-ingest.ts:480-520` — shows the commit-time `bprResult.score` write that will fire the numeric-overflow bug.
- `src/lib/tech/bpr.spec.ts` — vitest tests for 0–100 scale thresholds; confirms the intended API.
- `.planning/STATE.md` — Phase 15 decisions on schema (D-13 to D-17), Phase 16 decisions on accordion/vitest/rubric short-form keys.
- `.planning/ROADMAP.md:134-155` — Phase 17 plan seed: ~3 plans (component, page, wiring).
- `.planning/REQUIREMENTS.md` — METH-05, METH-06, MEDAL-01, MEDAL-02, MEDAL-03 full text.
- `.planning/phases/17-bpr-medal-ui-methodology-page/17-UI-SPEC.md` — approved design contract (600+ lines).
- `package.json` — Next.js 16.2.1, React 19.2.4, `@base-ui/react` 1.3.0, `drizzle-orm` 0.45.1, `zod` 4.3.6, Tailwind 4, Playwright 1.58.2, Vitest 4.1.5.
- `components.json` — shadcn config: style `base-nova`, baseColor `neutral`, iconLibrary `lucide`.
- `CLAUDE.md` (project) — pnpm only, no `next build`, no bulk GlitchTek rename, hover-glitch site rule, Playwright verification.

### Secondary (MEDIUM confidence)

- Phase 07.6 plan directory structure implies `ReviewCard` exists and is consumed by `RelatedReviewsCarousel` + `ReviewsGrid` + list page — confirmed by file grep but full call-site inventory is only partial (verified: `related-reviews-carousel.tsx`, `reviews-grid.tsx`). Executor must re-grep before modifying `ReviewCard` to catch any missed consumers.

### Tertiary (LOW confidence)

- None — all Phase 17 research is grounded in local file evidence. No WebSearch / Context7 calls were required because this phase introduces no new libraries; every primitive is already installed and exercised elsewhere in the codebase.

---

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — all primitives verified in `package.json` and `src/components/ui/`. No new deps means no version-compatibility research needed.
- Architecture: **HIGH** — ISR pattern, query extension pattern, component composition pattern all copied from existing phases (07.6, Phase 15, Phase 16.1).
- Pitfalls: **HIGH** — all four pitfalls are rooted in concrete file evidence (schema column, migration SQL, compute function source). The `numeric(5,4)` scale bug is the most important finding and is verifiable in ~3 file reads.
- Data contract: **HIGH** — `RUBRIC_V1_1` constant is the source of truth; `getMethodologyData()` is a pure function of constants; no DB table missing beyond what's already been catalogued.
- Design contract: **HIGH** — UI-SPEC is approved (status: `approved`, 666 lines), covers copy, color, spacing, typography, motion, and accessibility exhaustively.

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (30 days — pure UI phase on a stable stack, no fast-moving APIs)
**Author:** gsd-researcher (invoked via `/gsd:research-phase`)
**Upstream sources consumed:** `17-UI-SPEC.md`, `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `CLAUDE.md` (root + workspace + project)
