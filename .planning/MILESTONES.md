# Milestones

## v3.0 GlitchTek Launch (Closed partial: 2026-04-24)

**Shipped:** Phases 15, 16, 16.1, 17 (4 phases, ~17 plans)

**Key accomplishments:**

- **Phase 15 — Methodology Lock + Schema:** rubric v1.1 seeded (43 entries across 13 disciplines), `tech_benchmark_runs`/`tech_reviews`/`tech_review_discipline_exclusions` columns added, `getBenchmarkRunsForProducts` DISTINCT ON refactor, `getBenchmarkSpotlight` RUBRIC_V1_1 id-lookup fix
- **Phase 16 — JSONL Ingest Pipeline:** pure-math `computeBprScore()` + admin ingest server action with dry-run + commit in one transaction, Zod v4 validation, Playwright E2E with env-guarded skip, vitest adopted as unit runner
- **Phase 16.1 — Public Site Maintenance:** sub-brand same-tab nav, splash per-brand sessionStorage, GlitchTech hero visual parity, cart/sign-in hover-glitch, social icons, `/tech/benchmarks` empty state, 8-breakpoint Playwright audit
- **Phase 17 — BPR Medal UI + Methodology Page:** `<BPRMedal>` component family with monochrome tier palette, `/tech/methodology` force-static ISR page with formula + 7 disciplines + thresholds + changelog, medal wired into review detail scorecard + review cards + homepage spotlight (all 4 MEDAL-02 surfaces)

**Closed with carry-over (moved to v4.0):**

- **Phase 17.5** Trailer Video Surface (one-liner, not specced)
- **Phase 18** Category Master Leaderboard (headline v3.0 feature — never shipped)
- **Phase 19** Flagship MBP Review Published (content work, waiting on Mac benchmarks 2026-04-25)
- **Phase 20** GlitchTek Blog
- **Phase 20.5** Launch Blockers Bundle (rolled into v4.0 individual phases)
- **Phase 21** Deploy Hardening (domain, per-brand sitemap, OG tags)
- **Backlog:** 999.3 (Resend/email — launch blocker), 999.4 (perf audit — launch blocker), 999.5 (admin cosmetic cleanup), 999.6 (programmatic CLI)
- **GlitchMark:** industry-standard aspiration — parked 2026-04-23, never roadmapped, captured in memory [project_glitchmark.md](../../.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_glitchmark.md), becomes a real phase in v4.0
- **HUMAN-UAT pending:** 17 (live review with populated BPR, compact medal on list — both blocked on published review)
- **Deferred items:** rubric v1.2 remediation (field-vs-key), audio continuity cross-brands, deep flow audit, social coming-soon→live workflow
- **Phase 999.2** admin auth UX closed as not-a-bug (2026-04-24)

**Why partial close:** v4.0 reframes remaining work as a cohesive "production launch + polish" milestone rather than executing v3.0's original phase-by-phase plan. Audit-driven discovery determines v4.0 phase structure.

---

## v2.0 Quality Overhaul (Shipped: 2026-04-21)

**Phases completed:** 17 phases, 70 plans, 93 tasks

**Key accomplishments:**

- Fixed independent sidebar scroll, merged 7 sidebar sections to 5, added QuickActions grid and extracted ActivityFeed with three-tier visual hierarchy
- Redesigned hero with 3 CTAs (Book/Browse/Portfolio) and wired server-side beats + blog data fetching via Promise.allSettled
- Splash logo animation with sessionStorage gate, 5 scroll-section variants, real logo in hero/footer, bouncing scroll indicator, and beat card spacing
- Four new beat catalog building blocks: BeatCard with play overlay and license modal, BeatCardGrid with responsive columns, ViewToggle with inverted icon states, FilterBar consolidating search/dropdowns/BPM/clear into one sticky bar
- View-switching beats catalog with FilterBar, AnimatePresence crossfade between card/list views, redesigned list rows with 56px art and producer name, desktop column headers
- Deferred
- Waveform peaks JSONB column, peak extraction utility with audio-decode, and reusable canvas Waveform component with interactive scrubbing
- Real peak-based waveforms in beat cards (interactive scrub), list rows (visual progress), and sidebar mini-player with cover art, time, and scrubable waveform
- Desktop time display and mobile interactive waveform replacing 2px progress bar with 44px touch-target canvas
- Playwright mobile audit capturing 39 screenshots across 11 pages at 375/390/430px with true mobile emulation, overflow detection, and multi-state captures
- Restructured 6-slot tab bar with menu at position 5, dynamic player-aware content padding via MobileContentWrapper, and safe-area-correct player bar stacking
- Mobile hero reduced to 70vh with container-relative centering (top-1/2, bottom-16) replacing viewport-relative positioning; splash overlay verified at 375px via Playwright
- Deferred
- Restructured mobile menu to 3 nav items with 4-row breathing grid, staggered entrance animation, and swipe-down-to-dismiss gesture
- Created:
- Created:
- Created:
- Sidebar primitives:
- Modified:
- Created:
- Created:
- Pending user approval.
- Public Drizzle query layer + sanitize/winner/youtube utilities + review-body prose styles — foundation for every page in 07.6
- Single-source `<ReviewCard>` server component consuming `PublicReviewCard` — becomes the visual contract for reviews across 4 surfaces
- Full `/tech/reviews/[slug]` RSC rendering 16 sections (breadcrumb → hero → verdict → body → rating → pros/cons → gallery → video → specs → benchmarks → audience → related → compare CTA → newsletter), plus JSON-LD Review schema and safe generateStaticParams
- `/tech/reviews` with category pills + sort + debounced search all URL-synced via nuqs, cursor load-more, and a mobile filter Sheet that opens from the right
- Two new browse surfaces: `/tech/categories` level-1 tile grid with product/review counts, and `/tech/categories/[slug]` dynamic route with breadcrumb + children + reviewed/unreviewed product sections
- `/tech/compare` with Command-based product picker, winner-detecting specs table, dynamic-Recharts benchmark bar charts (eager-3 + IntersectionObserver lazy rest), and tabs for Specs / Benchmarks / Price
- Tech homepage (`/tech/`) now fetches latest 3 reviews, top-level categories, and Geekbench spotlight in parallel; all three sections consume real data via prop-passed components. Admin publish/unpublish triggers public revalidation.
- Role-conditional login redirect (admin/owner → /admin, client → /dashboard) + post-registration to /dashboard — fixes NAV-01 bug and aligns with D-04
- Desktop sidebar now shows initials avatar + MY ACCOUNT link + sign-out icon when logged in (collapsed + expanded). Mobile overlay logged-in tile becomes My Account → /dashboard. Logged-out states unchanged.
- `/dashboard` now greets the user and shows recent purchases + upcoming bookings instead of redirecting to /dashboard/purchases. Empty states copy locked from UI-SPEC. Replaces 9-line skeleton with full RSC.
- Baseline mobile audit captured: 8 screenshots at 375px, 10 breaks documented with Wave 2/3 resolver mapping.
- Portfolio-service match convention locked: Option C (union OR). Zero overlap today, so EXAMPLE WORK hides everywhere per UI-SPEC fallback.
- Booking-live flag infrastructure live: getBookingLive, setBookingLive, source-aware newsletter. Wave 2 can consume immediately.
- Coming-soon mode end-to-end live: manifesto renders, admin can toggle, sitewide Book CTAs reroute, pre-existing /booking bug fixed.
- Service detail panel expanded to 9 UI-SPEC sections; mobile accordion now defaults to first service.
- Wizard polished per D-10/D-11/D-12/D-13: 5-row summary sidebar, step subtitles, terms block, rich tiles, 8px stepper dots.
- Phase 09 closure: all 10 mobile breaks resolved or deferred with reason; verification spec green (6 passed, 1 skipped).

---
