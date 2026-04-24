# Roadmap: Glitch Studios

## Milestones

- ✅ **v1.0 Full Scaffold** — Phases 1-4.1 (shipped 2026-03-28)
- ✅ **v2.0 Quality Overhaul** — Phases 5-14 (shipped 2026-04-21)
- ⚠️ **v3.0 GlitchTek Launch** — Phases 15-17 shipped; 17.5, 18, 19, 20, 20.5, 21 carried over (closed partial 2026-04-24)
- 🚧 **v4.0 Production Launch** — Phase 22 active (audit-driven; phases 23+ derived from audit output)

## Phases

<details>
<summary>✅ v1.0 Full Scaffold (Phases 1-4.1) — SHIPPED 2026-03-28</summary>
See `.planning/milestones/v1.0-ROADMAP.md`
</details>

<details>
<summary>✅ v2.0 Quality Overhaul (Phases 5-14) — SHIPPED 2026-04-21</summary>
See `.planning/milestones/v2.0-ROADMAP.md`
</details>

### 🚧 v4.0 Production Launch (Active)

**Milestone Goal:** Get the site to production — polished, performant, content-complete, credible. Audit-driven direction captured in [22-AUDIT.md](phases/22-visual-audit-discovery/22-AUDIT.md). GlitchMark ships as a new composite scoring system (distinct from BPR). Artist platform BETA with Trap Snyder as first beta user. Glitchy 3D mascot demoed. AI agents evaluated + implemented. Remaining v3.0 launch work completes inside this milestone.

**Process:** Audit completed 2026-04-24 — 25 phases derived from Sections A-J findings. Sequencing runs launch-blockers first, then foundation, then features, polish, revenue/growth, launch readiness.

- [x] **Phase 22: Visual Audit & Discovery** — full site walk + v3.0 carry-over triage + GlitchMark role lock + derived 25 phases (completed 2026-04-24, AUDIT-01..04)

**🚨 Launch-blocker cluster (parallelizable):**
- [x] **Phase 23: Debug Broken Pages & Missing Routes** — fix /admin homepage editor (404), /admin/clients + /admin/roles (500), /admin/media drag-drop upload, /forgot-password + /reset-password missing routes, /about dead link, mobile checkout Stripe failure, mobile nav double-tap bug (completed 2026-04-24)
  - **Plans:** 7 plans (all Wave 1 — all files disjoint, fully parallelizable)
    - [x] 23-01-PLAN.md — Admin homepage editor 404 (sidebar href fix + Quick Action tile)
    - [x] 23-02-PLAN.md — /about dead-link removal (GlitchTech nav + stray anchors → /tech/methodology)
    - [x] 23-03-PLAN.md — /admin/clients + /admin/roles 500s (shared local-repro diagnosis + targeted fix)
    - [x] 23-04-PLAN.md — Mobile nav double-tap (overlay useDragControls refactor + bottom-tab prefetch)
    - [x] 23-05-PLAN.md — Mobile checkout Stripe (route hardening + Vercel log diagnosis + real-device verify)
    - [x] 23-06-PLAN.md — /forgot-password + /reset-password scaffolds (Better Auth stub, Phase 24 handoff)
    - [x] 23-07-PLAN.md — /admin/media drag-drop (R2 CORS + env diagnosis, code-change only if diagnosis demands)
- [x] **Phase 24: Email Delivery End-to-End** — Resend wired + React Email templates (verify, reset, booking confirm, order receipt, newsletter, contact auto-reply, admin invite) — EMAIL-01..08 (completed 2026-04-24)
- [x] **Phase 25: Performance Audit + Fixes** — admin context switcher 2-3s → <500ms, admin edit→ingest 4s, public cold-nav p95, mobile LCP, image/bundle/query audits — PERF-01..07 (completed 2026-04-24)

**🔐 Auth + UX:**
- [ ] **Phase 26: Brand-Aware Auth UI Redesign** — brand-themed login/register/forgot/reset/verify surfaces; split register (customer wizard vs artist request flow); social login (Google + Meta + GitHub)

**🎬 Foundation:**
- [ ] **Phase 27: Media/Video Strategy Foundation** — canonical YouTube (long) + Instagram (short) embed pattern; schema `media_item` with entity attachments; admin add-video flow; reusable components (embed, carousel, hero)

**🏆 Tech product core (the headline):**
- [ ] **Phase 28: GlitchMark System** — research + lock formula, schema, compute on ingest, methodology page section — GLITCHMARK-01..08
- [ ] **Phase 29: Master Leaderboard** — `/tech/categories/[slug]/rankings` sortable/filterable with GlitchMark + BPR + any benchmark column — RANK-01..07
- [ ] **Phase 30: Per-Benchmark Pages** — `/tech/benchmarks` landing + `/tech/benchmarks/[slug]` cross-category leaderboard per benchmark
- [ ] **Phase 31: Category Detail Editorial Reframe** — pivot `/tech/categories/[slug]` from ranked product list to curated editorial hub with "best for" cards

**🎨 Artist platform BETA:**
- [ ] **Phase 32: Artist Platform v4.0 Admin-Invite BETA** — artist role + dashboard (profile, upload beats/songs/videos/portfolio, light customization, custom T&Cs); admin-invite only (no public signup); cross-display with Studios store; revenue share ledger; Trap Snyder beta-tests

**💰 Beats commerce overhaul:**
- [ ] **Phase 33: Beat Licensing Model Research + Redesign** — research landscape (tiered vs flat-rate), decision on positioning, schema + UI redesign
- [ ] **Phase 34: Custom Beats Offering + Services Redesign** — 2-tab Services page (Custom Beats / Studio Sessions), custom beat intake flow, admin custom-beat requests, home hero CTA pivots to Custom Beats

**📝 Content:**
- [ ] **Phase 35: Blog Redesign (cross-brand, research-driven, typed)** — research best blog pages, predetermined type taxonomy (comparison / buyer guide / news / making-of / tutorial), template per type, video-first pattern — covers Studios + GlitchTech — BLOG-01..05
- [ ] **Phase 36: Flagship MBP Review + Trailer Videos** — publish MBP 16 M5 Max review (real content) + surface two trailers — FLAG-01..04, VIDEO-01..02

**📱 Polish sweeps:**
- [ ] **Phase 37: Mobile-Native-Feel Sweep** — swipe gestures on drawers/sheets/modals, swipe-minimize player bar, pull-to-refresh on lists, admin mobile redesign (dismissible sidebar OR bottom-nav)
- [ ] **Phase 38: GlitchTech Brand-Wide Editorial Polish** — hero sections, review card hierarchy, category tile polish, cross-link sweep, BPR medal visual redesign (realistic illustrations replacing monochrome), missing methodology nav link, GlitchTech mobile menu content bleed fix
- [ ] **Phase 39: Admin List-Page Pattern Rollout** — shared `AdminListPage` component (search/filter/view-switch/thumbnail preview), applied across beats/bundles/products/reviews/categories/benchmarks/blog
- [ ] **Phase 40: Public Per-Page Polish** — home scroll arrow clickable (site-wide), mobile hero proportion fixes, "What We Do" overhaul, GlitchTech cross-link image, GlitchTech intro mobile — POLISH-*

**💸 Revenue + growth:**
- [ ] **Phase 41: Affiliate Marketing Infrastructure** — schema (`product_affiliate_links`), render logic on every product surface, tracking + cloaking via `/go/[...]`, FTC disclosure, admin analytics dashboard
- [ ] **Phase 42: AI Agents — Discovery + Selection (discuss-only)** — evaluate platforms (Claude / OpenAI / OpenRouter / hybrid), evaluate orchestration (n8n vs custom), pick stack, document decisions — no code
- [ ] **Phase 43: AI Agents — Implementation** — build agents on chosen stack: review writing assistant, benchmark organization, blog creation helper, multi-surface asset pipeline, admin helpers (auto-BPM, transcription, tagging), newsletter automation
- [ ] **Phase 44: Glitchy 3D Mascot Integration (demo)** — bring 3D raccoon character on-site as visual presence + demo; idle loops, hover reactions, `/about` introduction page; NOT conversational in v4.0 (that's v5.0+); architect so conversational upgrade is wire-up, not rebuild

**🚀 Launch readiness:**
- [ ] **Phase 45: SEO + Growth Infrastructure** — structured data on all surfaces, meta/OG per route, per-brand sitemaps, canonical URLs, internal linking sweep, Core Web Vitals, rich results validation
- [ ] **Phase 46: Production Deploy Hardening** — glitchtech.io custom domain + SSL, UAT admin cleanup (DEPLOY-05), env audit, error tracking (Sentry), analytics, backup verification, 301 www→apex — DEPLOY-01..09

### ⚠️ v3.0 GlitchTech Launch (Closed Partial 2026-04-24)

**Shipped in v3.0:**
- [x] **Phase 15: Methodology Lock + Schema** — migrations, rubric v1.1 seed, query refactors (completed 2026-04-21)
- [x] **Phase 16: JSONL Ingest Pipeline** — 3-step wizard (upload → dry-run → commit) (completed 2026-04-22)
- [x] **Phase 16.1: Public Site Maintenance + Bug Sweep** — sub-brand SPA nav, visual parity, wiring, audit sweep (completed 2026-04-23)
- [x] **Phase 17: BPR Medal UI + Methodology Page** — monochrome medal, /tech/methodology (completed 2026-04-24)

**Carried over to v4.0 (work preserved, re-framed under v4.0 scope):**
- ⤴ Phase 17.5 Trailer Video Surface → v4.0 VIDEO-*
- ⤴ Phase 18 Category Master Leaderboard → v4.0 RANK-*
- ⤴ Phase 19 Flagship MBP Review → v4.0 FLAG-*
- ⤴ Phase 20 GlitchTek Blog → v4.0 BLOG-*
- ⤴ Phase 20.5 Launch Blockers Bundle → split into v4.0 EMAIL-* / PERF-* / DEPLOY-*
- ⤴ Phase 21 Deploy Hardening → v4.0 DEPLOY-*
- ⤴ Backlog 999.3 (Resend) → v4.0 EMAIL-*
- ⤴ Backlog 999.4 (Perf) → v4.0 PERF-*
- ⤴ Backlog 999.5 (Admin cosmetic) → v4.0 POLISH-* (audit-scoped)
- ⤴ Backlog 999.6 (Programmatic CLI) → post-launch, not in v4.0
- ⤴ **GlitchMark** (never roadmapped, parked 2026-04-23) → v4.0 GLITCHMARK-*

## Phase Details

### Phase 22: Visual Audit & Discovery (v4.0)

**Goal:** Walk the live site together, capture every issue, edge case, and idea from the user's head. Triage every v3.0 carry-over. Design GlitchMark. Output a populated `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` whose findings derive the phase structure for 23+.

**Depends on:** v3.0 closed partial; `phases/22-visual-audit-discovery/22-AUDIT.md` scaffold exists; dev server on `localhost:3004`.

**Requirements:** AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04

**Success Criteria** (what must be TRUE):
1. Every section A–J of AUDIT.md has user feedback inline (or explicit `[OK]` if nothing to say). Blank sections are blockers.
2. Every v3.0 carry-over item (17.5, 18, 19, 20, 20.5, 21, 999.3, 999.4, 999.5, 999.6, HUMAN-UAT pending) is triaged `[IN v4.0]` / `[BACKLOG]` / `[DROP]` with a one-line rationale.
3. GlitchMark Section I has answers on: formula approach, per-what (device/category), relationship to BPR, UI surfaces, methodology transparency, versioning. "TBD — decide in phase" is a valid answer for the formula specifically.
4. AUDIT.md Section K populated with the proposed phase 23+ structure, derived from sections A–J findings, and presented to the user for approval.
5. User approval recorded — PROJECT.md and REQUIREMENTS.md updated to reflect the derived phase list; ROADMAP.md has phases 23+ defined with goals and REQ-ID maps.

**Plans:** No traditional plans — this phase is conversational. One "plan" per audit section completed, committed as we go. Roughly:
- 22-01 Sections A–B (public Studios + GlitchTech walk)
- 22-02 Sections C–D (auth, dashboard, admin walk)
- 22-03 Sections E–F (global components + cross-page flows)
- 22-04 Section G (edge cases)
- 22-05 Section H (v3.0 carry-over triage)
- 22-06 Section I (GlitchMark design session)
- 22-07 Section J (brain dump capture)
- 22-08 Section K (derive phases 23+ + user approval + update PROJECT/REQUIREMENTS/ROADMAP)

**UI hint:** no (this phase doesn't ship UI, it scopes what UI ships next)

---

### Phase 15: Methodology Lock + Schema

**Goal**: All schema gaps are closed and rubric v1.1 is seeded before any ingest or leaderboard code can be written — no feature in Phase 16+ can proceed without this foundation

**Depends on**: Phase 14 (v2.0 shipped). No external pre-flight dependencies — this phase IS the pre-flight.

**Requirements**: METH-01, METH-02, METH-03, METH-04, METH-07

**Success Criteria** (what must be TRUE):
1. `pnpm tsc --noEmit` passes after migration — all new columns (mode, discipline, bpr_eligible, run_uuid, rubric_version, ingest_batch_id, source_file, bpr_score, bpr_tier, brand) are reflected in Drizzle types without errors
2. Rubric v1.1 seed runs idempotently: `pnpm tsx src/db/seeds/rubric-v1.1.ts` can be run twice with no duplicate rows and no errors
3. `getBenchmarkRunsForProducts` returns at most one row per `(product_id, test_id, mode)` pair after refactor — `/tech/compare` renders without regression when tested with seeded products
4. `getBenchmarkSpotlight` resolves via test `id` lookup (not ilike name match) — changing a test name in `tech_benchmark_tests` no longer breaks the spotlight query
5. `UNIQUE(product_id, test_id, run_uuid)` constraint exists on `tech_benchmark_runs` and rejects a duplicate insert with a clear Postgres error

**Plans**: 3 plans
- [x] 15-01-PLAN.md — Drizzle migration DDL: 4 new pgEnums, 14 column additions across 3 tech tables, new `tech_review_discipline_exclusions` table (name corrected from ROADMAP `tech_benchmark_exclusions` — D-20 + METH-02 authoritative), partial UNIQUE index with WHERE superseded=false, published_at CHECK constraint
- [x] 15-02-PLAN.md — `src/lib/tech/rubric-map.ts` (RUBRIC_V1_1 Record with 39 entries across all 13 disciplines) + `src/db/seeds/rubric-v1.1.ts` idempotent append-only seed
- [x] 15-03-PLAN.md — `getBenchmarkRunsForProducts` DISTINCT ON refactor + `getBenchmarkSpotlight` RUBRIC_V1_1 id-lookup fix + runtime assertion script (no `next build` per CodeBox constraint)

**UI hint**: no

---

### Phase 16: JSONL Ingest Pipeline

**Goal**: Admin can upload a JSONL file from the Mac bench harness, preview exactly which rows will be inserted or skipped, and commit the ingest atomically — with BPR score recomputed and stored immediately after commit

**Depends on**: Phase 15 (schema columns + rubric seed must exist for test-name matching and BPR computation)

**Requirements**: ING-01, ING-02, ING-03, ING-04, ING-05, ING-06

**Success Criteria** (what must be TRUE):
1. Uploading the CPU §3.1 JSONL file from the Mac bench session through the 3-step wizard produces a dry-run preview showing matched rows in green, duplicates in yellow, and unknown discipline/tool rows in red — no partial writes until step 3 is confirmed
2. Committing an ingest wraps all inserts in a single `db.transaction()` — introducing a deliberate syntax error mid-JSONL causes full rollback with zero rows persisted
3. Ingesting the same file a second time marks the previous run as `superseded = true` and inserts the new run, rather than duplicating or silently overwriting
4. A JSONL file with ambient_temp_c > 26 in the header is blocked with an error message until admin checks the override checkbox and enters a reason
5. After a successful commit, `tech_reviews.bpr_score` and `bpr_tier` are updated and `revalidatePath` fires — the review detail page shows the updated BPR medal without a manual redeploy

**Plans**: 4 plans
Plans:
- [x] 16-01-PLAN.md — bpr.ts: computeBprScore (geometric mean) + bprMedal (tier thresholds) + unit tests
- [x] 16-02-PLAN.md — admin-tech-ingest.ts: ingestBenchmarkRunsDryRun + commitBenchmarkIngest server actions (Zod validation, transaction, BPR recompute, revalidatePath)
- [x] 16-03-PLAN.md — ingest wizard UI: 3-step wizard page + discipline accordion + ambient override + supersede confirm
- [x] 16-04-PLAN.md — Import Benchmark Data link on edit page + JSONL fixtures + Playwright E2E tests

**UI hint**: no

---

### Phase 16.1: Public Site Maintenance + Bug Sweep (INSERTED)

**Goal**: Fix accumulated public-facing papercuts noticed on the deployed site before building new v3.0 surfaces (17+) on top. No new features — only existing behavior brought to "actually works" state, so upcoming design review reflects finished components rather than broken ones.

**Depends on**: Phase 16 (complete). No other dependencies.

**Scope — bugs called out from the deployed version (2026-04-23):**

1. **Sub-brand navigation opens a new tab** — Studios ↔ GlitchTech nav breaks SPA continuity. Audio player bar disappears when switching because a fresh page loads. Expected: same-tab `router.push`, player state preserved.
2. **Cart + sign-in buttons** — only the logo hit area is clickable (not the full button); missing site-wide hover-glitch that other buttons have.
3. **Intro logo glitch animation** — the splash from Phase 06.1 doesn't appear on deployed site. Regression or render condition gate.
4. **GlitchTech hero** — should mirror the Studios heartbeat design (adapted copy for the tech brand).
5. **No blog link in GlitchTech sidebar** — sidebar nav omits /tech/blog entry.
6. **Social media buttons broken/hidden** — both Studios and GlitchTech footers/sidebars. Real handles: YT `glitchtech_io`, IG `glitchtech.io`, TikTok `glitchtech.io` for Tech; Studios handles TBD with user.
7. **Stale "phase 7.6" copy on benchmarks page** — placeholder text references an old phase label; replace with current-phase stub or proper empty state.
8. **Full public-site audit sweep** — walk every route from prior phases, catalog regressions, triage into this phase vs 999.x backlog.
9. **Responsive breakpoint regressions** — homepage (and likely other routes) "total mess" at 13" laptop viewport (≈1280–1440px); glitch logo clips severely. Need Playwright-based coverage across mobile (iPhone SE 375, iPhone 14 Pro 393, iPad 768/1024) + laptop (1280, 1366, 1440) + desktop (1920) with regression fixes per route.

**Not in scope:**
- GlitchTech homepage carousels — per user direction, content modules populate naturally in Phase 17–19; homepage "feels plain" is expected until then.
- Admin-side issues — already tracked in 999.4 / 999.5 (999.2 closed 2026-04-24 as not-a-bug).
- Email / Resend — 999.3.
- Programmatic CLI for AI workflow — 999.6.

**Success Criteria** (what must be TRUE):
1. Clicking the sub-brand switcher stays in the same tab, current route transitions via client navigation, and the audio player bar (if playing) continues without interruption.
2. Cart and sign-in buttons accept clicks across their full bounding box and exhibit the site-wide hover-glitch effect consistent with other header buttons.
3. Intro logo glitch animation renders on site load (or whatever the designed condition is) on both Studios and GlitchTech public routes.
4. GlitchTech `/tech` hero matches Studios hero visual rhythm (same heartbeat pattern + motion timing), with tech-adapted copy.
5. `/tech` sidebar has a Blog entry pointing at `/tech/blog`.
6. Social media icons render on both brand footers/sidebars, link to correct handles, open in a new tab.
7. `/tech/benchmarks` stale "phase 7.6" copy is replaced with a current-phase placeholder or proper empty state.
8. Audit sweep report committed: every existing public route listed with pass/fail/deferred status.
9. Every public route renders without layout breakage across the defined breakpoint matrix (375 / 393 / 768 / 1024 / 1280 / 1366 / 1440 / 1920); Playwright viewport screenshots committed as visual regression baseline.

**Plans**: 5 plans (to be detailed in /gsd:plan-phase)
- [ ] 16.1-01 — Sub-brand SPA navigation + audio player persistence
- [ ] 16.1-02 — Visual parity pass (hero heartbeat, button glitch effects, intro logo animation)
- [ ] 16.1-03 — Wiring & stale content (social buttons, sidebar blog link, benchmarks placeholder)
- [ ] 16.1-04 — Public-site audit sweep + triage report
- [ ] 16.1-05 — Responsive breakpoint audit + fixes (13" laptop priority, plus mobile/tablet/desktop coverage)

**UI hint**: yes

---

### Phase 17: BPR Medal UI + Methodology Page

**Goal**: Readers can see a monochrome BPR medal on every review and click through to a methodology page that explains the formula, the 7 eligible disciplines, medal thresholds, and rubric versioning policy in full

**Depends on**: Phase 15 (rubric in DB for methodology page data). Can start in parallel with Phase 16 — the medal component and methodology page need no live benchmark data to be built; they require only the schema columns from Phase 15.

**Requirements**: METH-05, METH-06, MEDAL-01, MEDAL-02, MEDAL-03

**Success Criteria** (what must be TRUE):
1. `<BPRMedal tier="platinum" score={0.9312} />` renders the correct monochrome styling (Platinum: white bg / black text; Gold: `#888` bg / black text; Silver: outlined `#555` border; Bronze: dashed `#444` border) — confirmed via Playwright screenshot at all four tiers plus the null state
2. Every review detail page scorecard shows the BPR medal (or a "not enough data" placeholder) and a `Rubric v1.1` badge — confirmed with a published review that has bpr_score populated
3. Hovering the BPR medal shows "Based on X of 7 disciplines. See methodology." tooltip and the component links to `/tech/methodology#bpr`
4. `/tech/methodology` page is publicly accessible, loads under 2 seconds, and contains: the exact BPR formula (geomean expression), the 7 BPR-eligible disciplines listed by name, medal threshold table (90/80/70%), the exclusion policy, and a rubric version changelog entry for v1.1
5. A review with fewer than 5 of the 7 BPR-eligible disciplines scored renders no medal badge — the "Not enough data" state is visible and links to the methodology page explanation

**Plans**: 3 plans
- [x] 17-01-PLAN.md — BPRMedal + BPRMedalPlaceholder + RubricVersionBadge components, bpr_discipline_count schema column + migration, query type extensions
- [x] 17-02-PLAN.md — getMethodologyData() pure function + /tech/methodology force-static ISR page (formula, disciplines, thresholds, exclusion, changelog)
- [x] 17-03-PLAN.md — Wire medal + rubric badge into ReviewRatingCard + ReviewCard; Playwright visual baselines for 4 tiers + placeholder + methodology page

**UI hint**: yes

---

### Phase 18: Category Master Leaderboard

**Goal**: Readers can navigate to `/tech/categories/[slug]/rankings` and see every published review in that category ranked side-by-side with BPR medal, sortable columns, and URL-stateful filters — the headline v3.0 feature

**Depends on**: Phase 15 (schema), Phase 16 (benchmark runs and bpr_score populated for at least one product), Phase 17 (`<BprMedal>` component used in leaderboard table)

**Requirements**: RANK-01, RANK-02, RANK-03, RANK-04, RANK-05, RANK-06, RANK-07

**Success Criteria** (what must be TRUE):
1. `/tech/categories/laptops/rankings` loads with the MBP 16 M5 Max row visible, sorted by BPR score descending by default, with rank `#`, product name linked to review, BPR medal, GlitchTek score, Geekbench MC (AC), price, and year columns all rendering
2. Clicking any column header toggles ascending/descending sort — sort column and direction persist in the URL (`?sort=cpu_mc&dir=asc`) and survive a full page refresh with the same sort applied
3. Filter sidebar (desktop) / Sheet (mobile) controls for price range, year, CPU architecture, and medal tier all function — applying a filter updates the URL and narrows visible rows without a page reload; "Reset filters" clears all params
4. Null score cells render `—` with a `title` tooltip showing "Not included in this review" or "Excluded — {reason}" — they always sort to the bottom regardless of sort direction (NULLS LAST enforced)
5. On a 375px viewport the leaderboard switches from a table to per-product cards showing rank + medal + name + top 3 metrics + link — no horizontal scroll on the card view; clicking a column header on `/tech/methodology` opens in a new tab at the correct anchor

**Plans**: ~4 plans
- 01 — `src/lib/tech/leaderboard.ts`: `getLeaderboardRows()` (published reviews only, NULLS LAST, DISTINCT ON canonical runs, rubric version filter) + `getLeaderboardBenchmarkColumns()`; `unstable_cache` wrapper on category tree queries
- 02 — `@tanstack/react-table` install + `pnpm dlx shadcn@latest add toggle-group`; `src/components/tech/leaderboard-table.tsx` client component: TanStack Table + nuqs URL state + sticky first 2 columns + null cell rendering + mobile card fallback at <768px
- 03 — `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx`: server fetch all rows + benchmark columns, pass to `<LeaderboardTable>`; filter sidebar / Sheet; empty state CTA; rubric version badge; "View Rankings" link added to category detail page
- 04 — Playwright verification: desktop sort + filter persistence, mobile card layout at 375px, null cell tooltips, methodology anchor link opens new tab; `pnpm tsc --noEmit` + `pnpm lint` pass

**UI hint**: yes

---

### Phase 19: Flagship MBP Review Published

**Goal**: The MBP 16" M5 Max 64GB review is live on GlitchTek — benchmarks ingested for all 13 disciplines (or legitimately excluded), review article written and published, and the product visible across every surface that references published reviews

**Depends on**: Phase 16 (ingest pipeline required to load benchmark data), Phase 17 (BPR medal must render on the published review), Phase 18 (leaderboard must show the product)

**Requirements**: FLAG-01, FLAG-02, FLAG-03, FLAG-04

**Success Criteria** (what must be TRUE):
1. Product `mbp-16-m5max-64gb` exists in `/admin/tech/products` under the Laptops category with a complete spec sheet (CPU, GPU cores, unified memory, storage, display, weight, MSRP, release year) and the review is in `status = 'published'` with `published_at` not null
2. All 13 disciplines have either benchmark runs ingested (AC + battery where applicable) or an explicit entry in `tech_benchmark_exclusions` with a valid `reason_enum` — the ingest wizard shows 0 pending disciplines on the review's admin detail page
3. The published review passes 5/5 template completeness checks: verdict ≥ 150 chars, body HTML contains all 13 discipline `<h3>` section headers, gallery ≥ 3 images at 16:9 aspect ratio, BPR medal is visible in the scorecard, Rubric v1.1 badge is displayed
4. The review title and H1 contain no unqualified superlatives — any comparative claim includes a scope qualifier (e.g., "Highest CPU score among reviewed MacBooks on GlitchTek")
5. The review and product appear on: `/tech/reviews/mbp-16-m5max-64gb` (detail), `/tech/reviews` list, `/tech/categories/laptops/rankings` leaderboard with BPR medal, tech homepage featured carousel, and `/tech/compare` product picker

**Plans**: ~3 plans
- 01 — Create product record via `/admin/tech/products/new`: spec sheet, category assignment, hero image upload; create review draft via `/admin/tech/reviews/new`
- 02 — Ingest all JSONL files from Mac bench session via Phase 16 wizard (CPU AC + battery, GPU, Memory, Storage, LLM, Video, Dev, Python, Games, Thermal, Battery, Wireless, Display — or explicit exclusions); verify bpr_score + bpr_tier populated after each discipline commit
- 03 — Write review body in Tiptap (13 discipline sections, verdict, pros/cons, audience callouts); upload gallery images (≥3 at 1920×1080 16:9); run 5/5 completeness checklist; publish; Playwright spot-check: review appears on all 5 surfaces listed in success criterion 5

**UI hint**: no

---

### Phase 20: GlitchTek Blog

**Goal**: The GlitchTek brand has its own blog at `/tech/blog` that is independent from the Glitch Studios blog — existing Studios posts are unaffected, and admin can author tech posts through the same editor with brand auto-selected from context

**Depends on**: Phase 15 (brand discriminator column on `blog_posts` and `blog_categories` tables — the only hard dependency). Can run in parallel with Phases 16-19 after Phase 15 ships.

**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05

**Success Criteria** (what must be TRUE):
1. All existing Studios blog posts remain fully functional at `/blog` — listing, detail, category filter, and admin CRUD all work with `WHERE brand = 'studios'` applied; no regressions from the migration
2. `/tech/blog` loads a list page with the same PostCard / BlogHeroBanner / CategoryFilter components used by the Studios blog — only the brand filter differs; the GlitchTek layout wraps it automatically via the `(tech)/` route group
3. Navigating to `/admin/tech/blog/new` shows the blog editor with brand pre-set to `tech` — saving creates a post that appears at `/tech/blog` but not at `/blog`
4. Category slugs that exist in both brands (e.g., `news`) are stored with distinct `(slug, brand)` pairs — the `UNIQUE(slug, brand)` constraint on `blog_categories` replaces the old `UNIQUE(slug)` constraint without data loss
5. `pnpm tsc --noEmit` passes after all 6 new route files and the 4 modified action functions are in place

**Plans**: ~3 plans
- 01 — Modify `src/actions/admin-blog.ts`: add `brand` param (default `"studios"`) to `listPosts`, `upsertPost`, `listCategories`, `saveCategory`; inject as Drizzle `where` filter; add "Blog" nav link to `src/app/admin/tech/page.tsx`
- 02 — 2 public routes: `src/app/(tech)/tech/blog/page.tsx` + `src/app/(tech)/tech/blog/[slug]/page.tsx` (near-copies of Studios blog routes with `brand: "tech"` injected into all queries)
- 03 — 4 admin routes: `src/app/admin/tech/blog/` (list, new, [id]/edit, categories); verify Studios blog regression-free via Playwright spot-check on `/blog` + `/tech/blog` at desktop and mobile

**UI hint**: yes

---

### Phase 21: Deploy Hardening

**Goal**: glitchtech.io resolves in production with a valid TLS certificate, per-brand sitemaps are live, OG tags correctly identify each brand, and the middleware rewrite that serves `/tech` at the `glitchtech.io` root is verified end-to-end in production

**Depends on**: Phase 18 (leaderboard live) and Phase 19 (flagship review published — highest-value content to index on day one). Phase 20 should also be complete so `/tech/blog` is included in the sitemap.

**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04

**Success Criteria** (what must be TRUE):
1. `https://glitchtech.io` loads the GlitchTek homepage in a browser with a valid TLS certificate (green lock), `www.glitchtech.io` 301-redirects to the apex domain, and both DNS records resolve from an external DNS checker (e.g., dnschecker.org)
2. `https://glitchtech.io/sitemap.xml` lists tech routes only (reviews, categories, methodology, blog) with `lastmod` dates; `https://glitchstudios.io/sitemap.xml` lists studios routes only — neither contains routes from the other brand
3. A tech review detail page (`/tech/reviews/mbp-16-m5max-64gb`) has `og:site_name = "GlitchTek"` and `og:title` containing the product name; a Studios blog post has `og:site_name = "Glitch Studios"` — verified via `curl -s <url> | grep og:site_name`
4. `https://glitchtech.io/tech/reviews` (the reviews list) and `https://glitchtech.io/tech/categories/laptops/rankings` (the leaderboard) both load correctly — the middleware rewrite that maps `glitchtech.io` → `(tech)/` route group is confirmed working in production, not just in local dev

**Plans**: ~3 plans
- 01 — Cloudflare DNS: add A + AAAA records for `glitchtech.io` and `www.glitchtech.io` pointing to Vercel edge IPs; add `www` 301 page rule; add custom domains in Vercel project settings; confirm TLS provisioned
- 02 — Modify `src/app/sitemap.ts`: add tech review slugs (from `getAllPublishedReviewSlugs`), category slugs, `/tech/methodology`, `/tech/blog` routes — keyed by `glitchtech.io` base URL; studios routes keyed by `glitchstudios.io`; verify `robots.txt` disallows `/admin` and `/dashboard` on both origins
- 03 — OG meta audit: confirm `layout.tsx` in `(tech)/` route group sets `og:site_name = "GlitchTek"` and `layout.tsx` in studios sets `"Glitch Studios"`; production smoke test: load flagship review + leaderboard on `glitchtech.io` in browser; confirm no mixed-brand content

**UI hint**: no

---

## Progress

**Execution Order:**
v1.0: 1 → 1.1 → 1.2 → 1.3 → 1.4 → 2 → 3 → 4 → 4.1
v2.0: 5 → 6 → 6.1 → 7 → 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6 → 8 → 9 → 10 → 11 → 12 → 14 (13 deferred)
v3.0: 15 → 16 → 16.1 → 17 (shipped); 17.5, 18, 19, 20, 20.5, 21 carried over to v4.0
v4.0: 22 (audit done) → 23/24/25 (launch blockers, parallel) → 26 → 27 → 28/33/35 (parallel tracks) → 29 (headline leaderboard) → 30/31/32 (parallel) → 34/36 → 37-40 (polish sweeps) → 41/42 → 43/44 → 45 → 46 (launch)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation + Public Site | v1.0 | 6/6 | Complete | 2026-03-25 |
| 1.1 Foundation Bug Fixes | v1.0 | 2/2 | Complete | 2026-03-25 |
| 1.2 Design Language Overhaul | v1.0 | 3/3 | Complete | 2026-03-25 |
| 1.3 Supabase DB Driver Fix | v1.0 | 1/1 | Complete | 2026-03-25 |
| 1.4 Visual Polish & Sidebar Overhaul | v1.0 | 3/3 | Complete | 2026-03-25 |
| 2. Beat Store | v1.0 | 8/8 | Complete | 2026-03-26 |
| 3. Booking System | v1.0 | 6/6 | Complete | 2026-03-26 |
| 4. Admin Dashboard + Email | v1.0 | 8/8 | Complete | 2026-03-27 |
| 4.1 Stabilization & Integration Fix | v1.0 | 2/3 | Complete | 2026-03-28 |
| 5. Admin Dashboard UX | v2.0 | 1/1 | Complete | 2026-03-29 |
| 6. Homepage | v2.0 | 2/2 | Complete | 2026-03-30 |
| 6.1 Homepage Flair | v2.0 | 3/3 | Complete | 2026-03-30 |
| 7. Beats Catalog | v2.0 | 2/3 | Complete (Plan 03 deferred) | 2026-03-31 |
| 7.1 Listening Experience & Waveform Overhaul | v2.0 | 3/3 | Complete | 2026-03-31 |
| 7.2 Mobile Experience Overhaul | v2.0 | 3/4 | Complete (Plan 04 deferred) | 2026-04-01 |
| 7.3 Mobile Menu Overhaul | v2.0 | 1/1 | Complete | - |
| 7.4 Brand architecture & Glitch Tech sub-brand foundation | v2.0 | 5/5 | Complete | - |
| 7.5 Product reviews data model & admin input | v2.0 | 7/7 | Complete | - |
| 7.6 Reviews display & comparison tables | v2.0 | 7/7 | Complete | - |
| 8. Auth & Navigation | v2.0 | 3/3 | Complete | 2026-04-18 |
| 9. Services & Booking | v2.0 | 7/7 | Complete | - |
| 10. Blog | v2.0 | 7/7 | Complete | 2026-04-21 |
| 11. Portfolio | v2.0 | 7/7 | Complete | 2026-04-21 |
| 12. Artists & Team | v2.0 | 7/7 | Complete | 2026-04-21 |
| 13. Contact | v2.0 | 0/0 | Deferred | - |
| 14. Global Polish | v2.0 | 3/3 | Complete | 2026-04-21 |
| 15. Methodology Lock + Schema | v3.0 | 3/3 | Complete    | 2026-04-21 |
| 16. JSONL Ingest Pipeline | v3.0 | 4/4 | Complete   | 2026-04-22 |
| 16.1. Public Site Maintenance + Bug Sweep | v3.0 | 5/5 | Complete | 2026-04-23 |
| 17. BPR Medal + Methodology Page | v3.0 | 4/4 | Complete    | 2026-04-24 |
| 17.5. Trailer Video Surface | v3.0 | 0/0 | Carried over → v4.0 VIDEO-* | - |
| 18. Category Master Leaderboard | v3.0 | 0/4 | Carried over → v4.0 RANK-* | - |
| 19. Flagship MBP Review | v3.0 | 0/3 | Carried over → v4.0 FLAG-* | - |
| 20. GlitchTek Blog | v3.0 | 0/3 | Carried over → v4.0 BLOG-* | - |
| 20.5. Launch Blockers Bundle | v3.0 | 0/0 | Carried over → v4.0 EMAIL-/PERF-/DEPLOY-* | - |
| 21. Deploy Hardening | v3.0 | 0/3 | Carried over → v4.0 DEPLOY-* | - |
| 22. Visual Audit & Discovery | v4.0 | 8/8 | Complete | 2026-04-24 |
| **23. Debug Broken Pages & Missing Routes** | **v4.0** | **0/tbd** | **Up next 🚨** | - |
| 24. Email Delivery End-to-End | v4.0 | 3/3 | Complete    | 2026-04-24 |
| 25. Performance Audit + Fixes | v4.0 | 3/3 | Complete    | 2026-04-24 |
| 26. Brand-Aware Auth UI Redesign | v4.0 | 0/tbd | Not started | - |
| 27. Media/Video Strategy Foundation | v4.0 | 0/tbd | Not started | - |
| 28. GlitchMark System | v4.0 | 0/tbd | Not started | - |
| 29. Master Leaderboard | v4.0 | 0/tbd | Not started | - |
| 30. Per-Benchmark Pages | v4.0 | 0/tbd | Not started | - |
| 31. Category Detail Editorial Reframe | v4.0 | 0/tbd | Not started | - |
| 32. Artist Platform Admin-Invite BETA | v4.0 | 0/tbd | Not started | - |
| 33. Beat Licensing Model Redesign | v4.0 | 0/tbd | Not started | - |
| 34. Custom Beats + Services Redesign | v4.0 | 0/tbd | Not started | - |
| 35. Blog Redesign (cross-brand) | v4.0 | 0/tbd | Not started | - |
| 36. Flagship MBP Review + Trailers | v4.0 | 0/tbd | Not started | - |
| 37. Mobile-Native-Feel Sweep | v4.0 | 0/tbd | Not started | - |
| 38. GlitchTech Brand-Wide Polish | v4.0 | 0/tbd | Not started | - |
| 39. Admin List-Page Pattern Rollout | v4.0 | 0/tbd | Not started | - |
| 40. Public Per-Page Polish | v4.0 | 0/tbd | Not started | - |
| 41. Affiliate Marketing Infrastructure | v4.0 | 0/tbd | Not started | - |
| 42. AI Agents Discovery + Selection | v4.0 | 0/tbd | Not started | - |
| 43. AI Agents Implementation | v4.0 | 0/tbd | Not started | - |
| 44. Glitchy 3D Mascot (demo) | v4.0 | 0/tbd | Not started | - |
| 45. SEO + Growth Infrastructure | v4.0 | 0/tbd | Not started | - |
| 46. Production Deploy Hardening | v4.0 | 0/tbd | Not started | - |

## Backlog

### Phase 999.5: Email Template Visual Redesign (BACKLOG)

**Goal:** Redesign all 8 production email templates to match the Glitch Studios cyberpunk aesthetic — not just functional minimalism.

**Scope:**
- `password-reset.tsx`, `account-verification.tsx`, `booking-confirmation.tsx`, `booking-modification.tsx`, `booking-reminder.tsx`, `purchase-receipt.tsx`, `admin-contact-notification.tsx`, `newsletter-broadcast.tsx`
- Apply hero imagery, glitch-effect typography (safe subset email clients support), brand colors, wordmark header, per-flow iconography.
- Extract shared `<EmailLayout>` primitive during the redesign (deferred from Phase 24 CONTEXT.md D-09).
- Brand-split consideration: Studios vs GlitchTech mail visual variants if Phase 38 brand-split is active.

**Originally surfaced from:** Phase 24 completion (user feedback — "we definitely need a phase later to create the email templates to match the super cool of the website").

**Depends on:** Resend Pro upgrade if brand-split (one domain per brand).

### Phase 999.6: Newsletter Strategy + Campaign System (BACKLOG)

**Goal:** Design the newsletter beyond the transactional broadcast shell — content strategy, campaign templates, segmentation, growth hooks.

**Scope:**
- Campaign template variants (beat drop, studio tour, review embargo, monthly wrap, artist spotlight).
- Content calendar + cadence policy.
- Segment-aware sends using existing `newsletterSubscribers.tags` (beat_buyer, studio_client).
- Growth CTAs: inline beat previews, booking widgets, review teasers.
- Analytics on open rate / click rate (Resend webhook → admin dashboard).

**Builds on:** existing `newsletter-broadcast.tsx` template + `src/actions/admin-newsletter.ts` compose flow.

**Originally surfaced from:** Phase 24 completion (user feedback — "we need to create the newsletters and all that stuff later").

### Phase 999.2: Admin Auth UX — Separate Admin Sign-in from Client Sidebar (CLOSED — NOT A BUG)

**Status:** Closed 2026-04-24 during `/gsd:discuss-phase 999.2`. Keep as-is.

**Why closed:** The unified `/login` page already routes correctly by role (admins → `/admin`, clients → `/dashboard`) via Better Auth's `user.role`. The Phase 16 UAT finding was a first-impression nit, not broken behavior — admins clicking the sidebar "Sign In" tile end up in the right place. Phase 08 D-08 (no separate `/admin/login`, role-based post-login redirect) remains the correct architecture.

**Not reopening unless:** Real users report confusion, or a security/compliance reason emerges to separate the auth surfaces.

**Originally surfaced from:** Phase 16 UAT (2026-04-22).

### Phase 999.4: Site-Wide Performance Audit (BACKLOG — CRITICAL)

**Goal:** [Captured for future planning] Diagnose and fix site-wide performance regressions. Several interactions take multiple seconds when they should feel instant.

**Observed symptoms (2026-04-22):**
- Admin context switcher STUDIOS ⇄ TECH takes 3–4 seconds per toggle
- Navigation from admin edit page → ingest wizard takes ~4 seconds (confirmed twice during UAT)
- User reports "this is all across the website" — not isolated to admin

**Likely suspects (to investigate, not decisions):**
- Hard navigation instead of `router.push` / soft transitions on the context switcher
- Server components making serial data-fetching waterfalls on every route change
- Middleware / proxy.ts running expensive work on every request
- `force-dynamic` on pages that could be statically rendered or cached
- Large client bundles forcing re-hydration
- Unindexed DB queries on hot paths (tech_products / tech_benchmark_runs lookups)

**Surfaced from:** Phase 16 UAT (2026-04-22) — flagged as CRITICAL by user. Should be audited before public launch / Phase 21 deploy hardening.

**Requirements:** TBD (likely new PERF-* ids)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — priority: HIGH)

### Phase 999.6: Programmatic Ingest + Admin CLI for AI workflow (BACKLOG — HIGH)

**Goal:** [Captured for future planning] Primary content workflow is Claude Code running in a session ("ingest this bench log for this review," "create a new review for MBP 16 M5 Max," "attach these benchmarks"). The admin wizard is a fallback for human Josh — the CLI/scriptable path is the daily driver. Claude should be able to do every admin operation without opening a browser.

**Scope (sketch):**
- Script/CLI (e.g., `pnpm admin ingest --review {id} --file path.jsonl --mode ac`) that wraps `ingestBenchmarkRunsDryRun` + `commitBenchmarkIngest` from Phase 16
- Same for review CRUD, product CRUD, media uploads, publish/unpublish, gallery attachment
- Auth: service-role token or a signed admin session Claude can pass via env
- Output: structured JSON so Claude can parse results and follow up (e.g., BPR score, inserted count, revalidate confirmations)
- Dry-run + confirm mode to match the wizard's safety model

**Why this matters:** The user's stated primary workflow is AI-driven content production. Every minute spent in a browser filling forms is friction. Current state: Phase 16 built the UI but not the scriptable path — so Claude can't actually do the work it's supposed to do.

**Surfaced from:** Phase 16 UAT (2026-04-22) — user interrupted the manual UAT flow to explain the real workflow. "I don't want to copy-paste JSONL into a browser — Claude should do this."

**Requirements:** TBD (likely new CLI-* ids: ingest, review-crud, product-crud, media, publish)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — priority: HIGH, unblocks AI-driven content)

### Phase 999.5: Admin Details Overlay — Padding Fix (BACKLOG)

**Goal:** [Captured for future planning] The Details drawer on the admin review editor (and likely other admin overlays) has no side padding — the DETAILS title, close X, rating rows, pros/cons controls, and media fields all sit flush against the left and right borders. Needs consistent inset padding.

**Scope (small):**
- Audit the admin drawer/sheet component wrapper padding tokens
- Likely a single className fix on the Sheet/Drawer container (e.g., add `px-6` or design-token equivalent)
- Check other admin overlays share the same wrapper and benefit

**Surfaced from:** Phase 16 UAT (2026-04-22) — screenshot shows cramped Details panel on the MBP review edit page.

**Requirements:** TBD (cosmetic, no new REQ-IDs expected)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — standalone admin polish, 999.2 was closed)

### Phase 999.3: Resend + Transactional Email Integration (BACKLOG)

**Goal:** [Captured for future planning] Wire up Resend SDK + React Email templates so every email-sending feature actually delivers mail. Currently nothing email-related works.

**What's broken right now:**
- Better Auth password reset / forgot-password flow (no recovery path for locked-out admins — surfaced during Phase 16 UAT)
- Booking confirmation / reminder emails
- Contact form submission replies
- Newsletter broadcasts
- Any email verification the auth layer expects

**Surfaced from:** Phase 16 UAT (2026-04-22) — during UAT we needed to sign in as admin but had no way to recover the `admin@glitchstudios.com` password because the forgot-password email would not deliver. Had to create a new UAT account + promote directly via SQL. This same dead-end will hit any real user.

**Requirements:** TBD (likely new EMAIL-* ids — account recovery, transactional templates, delivery tracking)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — likely needs to ship before public launch / Phase 21)

### Phase 999.7: Seed Representative Tech Catalog for Dev (BACKLOG)

**Goal:** [Captured for future planning] Seed one full MacBook Pro 16" M5 Max review + product + category breadcrumbs + gallery + benchmark run so `/tech/reviews/[slug]` renders against live data during dev. Driven by `project_placeholder_first_build` — the plan is to design the whole launch surface against ONE real record before building a fleet.

**What's broken right now:**
- `/tech/reviews/macbook-pro-m4` returns 404 (Phase 16.1 Plan 04 audit finding F-1). The `WidgetLatestReview` widget's hardcoded href was rerouted to `/tech/reviews` so the click target resolves, but the dynamic-route detail surface still can't be viewed with real data.

**Scope:**
- Add `src/db/seed-tech-catalog.ts` that inserts: 1 category (Laptops, already exists), 1 product (MacBook Pro 16" M5 Max), 1 published review (title, verdict, bodyHtml, ratings, pros, cons, gallery), and 1 benchmark run against rubric v1.1
- Add `pnpm db:seed-tech` script
- Update `WidgetLatestReview` to take a `review` prop and accept a server-rendered href, not a hardcoded string
- Swap placeholder image URLs to real uploads OR keep `placehold.co` for the seed-only review and document

**Surfaced from:** Phase 16.1 Plan 04 audit sweep (2026-04-23) — 3 blocker findings across viewports for the same 404 slug.

**Requirements:** TBD (new CATALOG-* ids)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — unblocks design review on tech detail surface)

### Phase 999.8: Replace Placeholder Imagery with Real Uploads (BACKLOG)

**Goal:** [Captured for future planning] Swap every `placehold.co` URL in the tech catalog + widgets for real Uploadthing/R2 images once product photography exists.

**Scope (small):**
- Grep `placehold.co` across `src/`, replace with real asset URLs or Uploadthing references
- Remove `placehold.co` from `next.config.ts` `images.remotePatterns`
- Clear the `_next/image` 400 Bad Request console errors flagged in Phase 16.1 Plan 04 audit finding F-5

**Surfaced from:** Phase 16.1 Plan 04 audit sweep (2026-04-23).

**Requirements:** TBD (cosmetic, no new REQ-IDs expected)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready — pair with 999.7)

## Traceability

| REQ-ID | Description | Phase | Status |
|--------|-------------|-------|--------|
| METH-01 | Rubric v1.1 seeded into tech_benchmark_templates | Phase 15 | Pending |
| METH-02 | Schema additions (mode, run_uuid, rubric_version, bpr_score, bpr_tier, exclusions table) | Phase 15 | Pending |
| METH-03 | BPR formula locked — geometric mean of 7 eligible disciplines | Phase 15 | Pending |
| METH-04 | Medal thresholds locked — Platinum 90% / Gold 80% / Silver 70% / Bronze 60% | Phase 15 | Pending |
| METH-05 | /tech/methodology page live | Phase 17 | Pending |
| METH-06 | Rubric version badge on every review + leaderboard version filter | Phase 17 | Pending |
| METH-07 | Pre-ingest query refactors — DISTINCT ON + id lookup | Phase 15 | Pending |
| ING-01 | Admin JSONL upload 3-step wizard | Phase 16 | Pending |
| ING-02 | Zod validation per JSONL line | Phase 16 | Pending |
| ING-03 | Source attribution — ambient_temp_c, macos_build, run_uuid | Phase 16 | Pending |
| ING-04 | Duplicate / re-run handling with superseded flag | Phase 16 | Pending |
| ING-05 | rubric-map.ts — allowed (discipline, tool, field) → test id translation | Phase 16 | Pending |
| ING-06 | BPR recompute on commit + revalidatePath | Phase 16 | Pending |
| MEDAL-01 | BPRMedal component — monochrome intensity variants | Phase 17 | Pending |
| MEDAL-02 | Medal surfaces on review detail, review cards, leaderboard, tech homepage | Phase 17 | Pending |
| MEDAL-03 | "Not enough data" state for <5 of 7 disciplines | Phase 17 | Pending |
| RANK-01 | /tech/categories/[slug]/rankings server-rendered route | Phase 18 | Pending |
| RANK-02 | Sort on every column via nuqs URL state | Phase 18 | Pending |
| RANK-03 | Filter sidebar — price, year, CPU kind, RAM, storage, medal tier | Phase 18 | Pending |
| RANK-04 | "Not tested" cells render — with tooltip | Phase 18 | Pending |
| RANK-05 | Mobile card layout at <768px | Phase 18 | Pending |
| RANK-06 | Empty state with methodology CTA | Phase 18 | Pending |
| RANK-07 | Column header links to /tech/methodology#test-{slug} | Phase 18 | Pending |
| FLAG-01 | Product mbp-16-m5max-64gb in tech_products | Phase 19 | Pending |
| FLAG-02 | Benchmark runs ingested for all 13 disciplines (or excluded) | Phase 19 | Pending |
| FLAG-03 | Review article published with verdict, body, gallery, BPR medal | Phase 19 | Pending |
| FLAG-04 | Review appears on detail, list, leaderboard, homepage carousel, compare picker | Phase 19 | Pending |
| BLOG-01 | brand column on blog_posts and blog_categories | Phase 20 | Pending |
| BLOG-02 | Studios blog stays functional with brand = 'studios' filter | Phase 20 | Pending |
| BLOG-03 | /tech/blog routes — list, detail, category filter | Phase 20 | Pending |
| BLOG-04 | Admin blog editor brand selection from context switcher | Phase 20 | Pending |
| BLOG-05 | Tech blog reuses PostCard / BlogHeroBanner / CategoryFilter | Phase 20 | Pending |
| DEPLOY-01 | glitchtech.io domain on Vercel, DNS on Cloudflare, 301 www → apex | Phase 21 | Pending |
| DEPLOY-02 | Per-brand sitemap.xml + robots.txt | Phase 21 | Pending |
| DEPLOY-03 | OG tags per brand — og:site_name GlitchTek vs Glitch Studios | Phase 21 | Pending |
| DEPLOY-04 | /tech serves at glitchtech.io root — middleware rewrite verified in prod | Phase 21 | Pending |
