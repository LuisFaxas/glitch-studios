# Roadmap: Glitch Studios

## Milestones

- ✅ **v1.0 Full Scaffold** — Phases 1-4.1 (shipped 2026-03-28)
- ✅ **v2.0 Quality Overhaul** — Phases 5-14 (shipped 2026-04-21)
- 🚧 **v3.0 GlitchTek Launch** — Phases 15-21 (in progress)

## Phases

<details>
<summary>✅ v1.0 Full Scaffold (Phases 1-4.1) — SHIPPED 2026-03-28</summary>
See `.planning/milestones/v1.0-ROADMAP.md`
</details>

<details>
<summary>✅ v2.0 Quality Overhaul (Phases 5-14) — SHIPPED 2026-04-21</summary>
See `.planning/milestones/v2.0-ROADMAP.md`
</details>

### 🚧 v3.0 GlitchTek Launch (In Progress)

**Milestone Goal:** Take GlitchTek from "foundation live" to "launched with credibility." Lock the methodology, hydrate rubric v1.1 benchmarks from the Mac bench harness, ship the flagship MBP 16" M5 Max review, add category master leaderboards so readers can rank every reviewed product side-by-side. Templates flow together — every future review slots into the locked structure without ad-hoc reinvention.

- [x] **Phase 15: Methodology Lock + Schema** — migrations, rubric v1.1 seed, query refactors (completed 2026-04-21)
- [x] **Phase 16: JSONL Ingest Pipeline** — 3-step wizard (upload → dry-run → commit) (completed 2026-04-22)
- [ ] **Phase 17: BPR Medal UI + Methodology Page** — monochrome medal, /tech/methodology
- [ ] **Phase 18: Category Master Leaderboard** — sortable/filterable master rankings per category
- [ ] **Phase 19: Flagship MBP Review Published** — MBP 16 M5 Max 64GB end-to-end
- [ ] **Phase 20: GlitchTek Blog** — /tech/blog via brand discriminator
- [ ] **Phase 21: Deploy Hardening** — glitchtech.io domain, per-brand sitemap, OG tags

## Phase Details

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

**Plans**: ~3 plans
- 01 — `src/components/tech/bpr-medal.tsx`: monochrome variant CSS, tier/score props, methodology anchor link, discipline-count tooltip, null/not-enough-data states; get Josh color approval before merge
- 02 — `getMethodologyData()` query in `src/lib/tech/queries.ts`; `src/app/(tech)/tech/methodology/page.tsx` (force-static ISR): BPR formula section, discipline table, medal tier table, exclusion policy, rubric changelog
- 03 — Wire `<BPRMedal>` into review detail scorecard (`src/app/(tech)/tech/reviews/[slug]/page.tsx`) + add Rubric v1.1 badge; wire medal onto review cards (list + carousel + related); Playwright verification: medal renders on review detail + methodology page loads with correct sections

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
v3.0: 15 → 16 → 17 (parallel with 16) → 18 → 19 → 20 (parallel after 15) → 21

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
| 17. BPR Medal + Methodology Page | v3.0 | 0/3 | Not started | - |
| 18. Category Master Leaderboard | v3.0 | 0/4 | Not started | - |
| 19. Flagship MBP Review | v3.0 | 0/3 | Not started | - |
| 20. GlitchTek Blog | v3.0 | 0/3 | Not started | - |
| 21. Deploy Hardening | v3.0 | 0/3 | Not started | - |

## Backlog

### Phase 999.2: Admin Auth UX — Separate Admin Sign-in from Client Sidebar (BACKLOG)

**Goal:** [Captured for future planning] Admin sign-in should not appear inside the client-facing sidebar. Admin and client auth should be visually and architecturally separated so clients never see an admin sign-in surface. Secondary nit: the sign-in link should open in a new tab.

**Surfaced from:** Phase 16 UAT (2026-04-22) — when trying to log in to test the ingest wizard, the admin sign-in entry point was found inside the client sidebar, confusing for both roles.

**Requirements:** TBD (likely new AUTH-UX-* ids)

**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

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
