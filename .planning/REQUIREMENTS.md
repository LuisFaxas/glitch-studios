# Requirements — v3.0 GlitchTek Launch

**Milestone goal:** Take GlitchTek from "foundation live" to "launched with credibility." Lock the methodology, hydrate rubric v1.1 benchmarks, ship the flagship MBP 16" M5 Max review, and add category master leaderboards. Every future review slots into the locked template without reinvention.

---

## v1 Requirements

### Methodology & Schema (METH-*)

- [ ] **METH-01** Rubric v1.1 seeded into `tech_benchmark_templates` — 13 disciplines with their exact tool set (Geekbench 6, Cinebench 2024, ripgrep cargo, 3DMark Wild Life / Steel Nomad / Solar Bay, Blender, STREAM, AmorphousDiskMark, llama-bench, MLX-LM, HandBrakeCLI, FFmpeg, pyperformance, PyTorch MPS, BG3, Cyberpunk/GPTK, Cinebench loop, video loop, Safari YouTube, web rotation, Cinebench drain, standby drain, iperf3, TB5, DisplayCAL, Lagom).
- [ ] **METH-02** Schema additions — all migrations land together in Phase 1 before any ingest code:
  - `tech_benchmark_tests` adds: `mode` enum (`ac` | `battery` | `both`), `discipline` text, `direction` enum (`higher_is_better` | `lower_is_better`), `unit` text.
  - `tech_benchmark_runs` adds: `mode` enum (`ac` | `battery`), `rubric_version` text, `run_uuid` text (session ID, one per reviewer session), `source_file` text, `ingest_batch_id` uuid, `superseded` boolean default false, `ambient_temp_c` numeric nullable, `macos_build` text nullable, `run_flagged` text nullable (reason), `permalink_url` text nullable (Geekbench etc.).
  - `tech_benchmark_runs` gets `UNIQUE(product_id, test_id, mode, run_uuid) WHERE superseded = false` constraint.
  - `tech_reviews` adds: `bpr_score` numeric nullable, `bpr_tier` enum (`platinum` | `gold` | `silver` | `bronze` | null), `rubric_version` text.
  - New enum `artist_kind`-style `bpr_tier_enum`.
  - New enum `discipline_exclusion_reason` (`no_hardware` | `requires_license` | `device_class_exempt` | `test_failed`).
  - New table `tech_review_discipline_exclusions` — `(review_id, discipline, reason, notes)`.
- [ ] **METH-03** BPR formula locked — geometric mean of `battery_score_d / ac_score_d` across the **7 eligible disciplines**: CPU, GPU, LLM, Video, Dev, Python, Games. Wireless / Display / Memory / Storage / Thermal are AC-only and excluded from BPR by design. `tech_review_discipline_exclusions` with reason `device_class_exempt` is the only valid way to drop a discipline from BPR (e.g. no GPU on Mac mini).
- [ ] **METH-04** Medal thresholds locked — Platinum ≥ 90%, Gold ≥ 80%, Silver ≥ 70%, Bronze ≥ 60%. Below 60% = no medal displayed. Tier computed once on ingest commit and stored on `tech_reviews.bpr_tier`.
- [ ] **METH-05** `/tech/methodology` page live — explains the rubric, BPR formula, the 7 eligible disciplines, medal thresholds, exclusion policy, and rubric versioning. Public-facing credibility layer. Linked from every review's scorecard and every leaderboard column header.
- [ ] **METH-06** Rubric version visibility — every review detail page shows `Rubric v1.1` badge in the scorecard. Leaderboards filter to a single rubric version by default (latest) with a toggle to show older.
- [ ] **METH-07** Pre-ingest query refactors — `getBenchmarkRunsForProducts` uses `DISTINCT ON (product_id, test_id, mode) … ORDER BY created_at DESC` so the compare tool and leaderboard always show the latest non-superseded run. `getBenchmarkSpotlight` uses test id lookup via rubric map, not a fragile `ilike` name match.

### Ingest Pipeline (ING-*)

- [ ] **ING-01** Admin JSONL upload at `/admin/tech/reviews/[id]/ingest` — 3-step wizard: **(1)** Upload + pick AC/Battery + pick rubric version (defaults to latest), **(2)** Dry-run preview showing which rows will insert / skip / fail with explanations, **(3)** Commit within a single DB transaction.
- [ ] **ING-02** Zod validation for every JSONL line — discipline, tool, score, unit, timestamp required. Malformed line blocks the whole upload with a clear error pointing to the line number (no partial writes).
- [ ] **ING-03** Source attribution captured — admin wizard has required fields for `ambient_temp_c`, `macos_build` (read from JSONL if present, else manual entry), and an auto-generated `run_uuid` per session. Ambient temp > 26 °C blocks ingest with override checkbox + reason text.
- [ ] **ING-04** Duplicate / re-run handling — ingesting a second run for the same `(product, test, mode)` marks the older row `superseded = true` and inserts the new one. Surfaces the history on the admin detail page.
- [ ] **ING-05** Rubric map — `src/lib/tech/rubric-map.ts` defines the allowed `(discipline, tool, field)` → `tech_benchmark_tests.id` translation. Lines with unknown discipline / tool get skipped and listed in the preview, not silently dropped.
- [ ] **ING-06** BPR recompute on commit — after a transaction commits, BPR score + tier are computed for the review and saved to `tech_reviews.bpr_score` / `bpr_tier`. `revalidatePath` fires for the review detail page + every affected leaderboard + the tech homepage.

### BPR Medal UI (MEDAL-*)

- [ ] **MEDAL-01** `<BPRMedal tier={…} score={…} />` component — monochrome intensity (Platinum `bg-[#f5f5f0] text-[#000]`, Gold `bg-[#888] text-[#000]`, Silver `border-[#555] text-[#f5f5f0]` outlined, Bronze `border-dashed border-[#444] text-[#888]` outlined-dashed). Tier label spelled out (`PLATINUM` / `GOLD` / `SILVER` / `BRONZE`) under the medal. Colorblind-safe.
- [ ] **MEDAL-02** Medal surfaces on: review detail page scorecard, review card (inline in list + carousel + related), category leaderboard (dedicated column), tech homepage spotlight.
- [ ] **MEDAL-03** "Not enough data" state — reviews with < 5 of the 7 eligible disciplines scored show no medal (instead of a misleading low-data one). `/tech/methodology` explains why.

### Category Leaderboards (RANK-*)

- [ ] **RANK-01** `/tech/categories/[slug]/rankings` route — server-rendered table, one row per published review in the category, columns: `#` rank, product name (link), BPR medal, BPR % score, Geekbench 6 Multi (AC), Cinebench 2024 Multi (AC), SSD Sequential Read, Battery Video Loop, Year, Price. Default sort: BPR score descending. Default column set is per-category (configurable in admin settings — laptops surface battery, desktops surface thermal).
- [ ] **RANK-02** Sort on every column — URL state via `nuqs` (e.g. `?sort=cpu_mt&dir=desc`). Null cells sort to the bottom regardless of direction. Column headers show arrow indicator.
- [ ] **RANK-03** Filter sidebar — price range, year, CPU kind (Apple Silicon / x86), RAM tier, storage tier, medal tier. URL-encoded via `nuqs`. Mobile opens as a shadcn `Sheet` from the right, matching the v2.0 reviews filter pattern.
- [ ] **RANK-04** "Not tested" cells render `—` with a `title` tooltip explaining ("Not included in this review" or "Excluded — {reason}" pulling from `tech_review_discipline_exclusions`).
- [ ] **RANK-05** Mobile layout — `< 768px` switches from table to per-product cards showing rank + medal + name + top 3 metrics + link to detail. No horizontal scroll on tables ever.
- [ ] **RANK-06** Empty state — when category has no published reviews, show "No reviews published yet" with a CTA to the methodology page.
- [ ] **RANK-07** Column header → test methodology anchor — clicking a column header name (not the sort arrow) jumps to `/tech/methodology#test-{slug}` in a new tab.

### Flagship Review (FLAG-*)

- [ ] **FLAG-01** Product `mbp-16-m5max-64gb` exists in `tech_products` under the Laptops category with complete spec sheet (CPU, GPU cores, RAM, storage, display, weight, price, year).
- [ ] **FLAG-02** Benchmark runs ingested for all 13 disciplines (or legitimately excluded via `tech_review_discipline_exclusions` with reason). Minimum 7 of 7 BPR-eligible disciplines captured AC + Battery.
- [ ] **FLAG-03** Review article published — verdict, body (Tiptap), pros/cons, rating, gallery, video embed if applicable, audience tags. Rubric v1.1 badge displayed. BPR medal visible.
- [ ] **FLAG-04** Review appears on: `/tech/reviews/[slug]`, `/tech/reviews` list, `/tech/categories/laptops/rankings` with BPR medal, tech homepage featured carousel, `/tech/compare` picker.

### GlitchTek Blog (BLOG-*)

- [ ] **BLOG-01** `brand` column added to `blog_posts` (`studios` | `tech`, default `studios`) — all existing rows backfill to `studios`. `blog_categories` `UNIQUE(slug)` relaxed to `UNIQUE(slug, brand)`.
- [ ] **BLOG-02** Studios blog code stays functional — listings, detail, category filter, admin CRUD — every query adds `WHERE brand = 'studios'`.
- [ ] **BLOG-03** `/tech/blog` routes mirror `/blog` — list page with category filter + search + pagination, detail page at `/tech/blog/[slug]`, category filter page at `/tech/blog?category=...`.
- [ ] **BLOG-04** Admin blog editor supports brand selection — the context switcher's brand (Studios vs Tech) auto-selects the blog brand on new posts.
- [ ] **BLOG-05** Tech blog uses the same `PostCard` / `BlogHeroBanner` / `CategoryFilter` components (no fork) — brand-neutral styling already applies.

### Deploy Hardening (DEPLOY-*)

- [ ] **DEPLOY-01** `glitchtech.io` custom domain attached to Vercel project, DNS on Cloudflare, 301 from `www` to apex.
- [ ] **DEPLOY-02** Per-brand sitemap.xml — `glitchstudios.io/sitemap.xml` lists only studios routes, `glitchtech.io/sitemap.xml` lists only tech routes. robots.txt disallows admin + dashboard + auth on both.
- [ ] **DEPLOY-03** OG tags per brand — tech pages use `og:site_name = "GlitchTek"`, studios pages use `"Glitch Studios"`.
- [ ] **DEPLOY-04** `/tech` serves at glitchtech.io root in production (middleware rewrite already handles this in dev — verify in prod).

---

## Traceability

| REQ-ID | Category | Depends on | Planned phase |
|--------|----------|------------|---------------|
| METH-01 | Schema seed | — | Phase 1 |
| METH-02 | Schema migration | — | Phase 1 |
| METH-03 | BPR formula | METH-02 | Phase 1 |
| METH-04 | Medal thresholds | METH-03 | Phase 1 |
| METH-05 | `/tech/methodology` page | METH-01, METH-03, METH-04 | Phase 3 |
| METH-06 | Rubric version badge | METH-02 | Phase 3 |
| METH-07 | Query refactors | METH-02 | Phase 1 |
| ING-01 | Ingest wizard | METH-02, METH-07 | Phase 2 |
| ING-02 | Zod validation | ING-01 | Phase 2 |
| ING-03 | Source attribution | ING-01, METH-02 | Phase 2 |
| ING-04 | Duplicate handling | METH-02 | Phase 2 |
| ING-05 | Rubric map | METH-01 | Phase 2 |
| ING-06 | BPR recompute | ING-01, METH-03, METH-04 | Phase 2 |
| MEDAL-01 | Medal component | METH-04 | Phase 3 |
| MEDAL-02 | Medal surfaces | MEDAL-01 | Phase 3 |
| MEDAL-03 | Low-data state | MEDAL-01 | Phase 3 |
| RANK-01 | Leaderboard route | METH-02, ING-06 | Phase 4 |
| RANK-02 | Sort + URL state | RANK-01 | Phase 4 |
| RANK-03 | Filter sidebar | RANK-01 | Phase 4 |
| RANK-04 | Null cell tooltip | RANK-01, METH-02 | Phase 4 |
| RANK-05 | Mobile card layout | RANK-01 | Phase 4 |
| RANK-06 | Empty state | RANK-01 | Phase 4 |
| RANK-07 | Methodology anchor | RANK-01, METH-05 | Phase 4 |
| FLAG-01 | Product record | METH-01 | Phase 5 |
| FLAG-02 | Benchmarks ingested | ING-01…ING-06 | Phase 5 |
| FLAG-03 | Review article | FLAG-01, FLAG-02 | Phase 5 |
| FLAG-04 | Review surfaces | FLAG-03, RANK-01 | Phase 5 |
| BLOG-01 | `brand` schema | — | Phase 6 |
| BLOG-02 | Studios preservation | BLOG-01 | Phase 6 |
| BLOG-03 | `/tech/blog` routes | BLOG-01 | Phase 6 |
| BLOG-04 | Admin brand selector | BLOG-01 | Phase 6 |
| BLOG-05 | Component reuse | BLOG-01 | Phase 6 |
| DEPLOY-01 | DNS + Vercel domain | — | Phase 7 |
| DEPLOY-02 | Per-brand sitemap | DEPLOY-01 | Phase 7 |
| DEPLOY-03 | OG tags | DEPLOY-01 | Phase 7 |
| DEPLOY-04 | Production verify | DEPLOY-01 | Phase 7 |

---

## Anti-scope

- **Second review** beyond MBP M5 Max — one flagship is the template; additional products follow v3.0.
- **`/tech/compare`** (2-way pick-two) — stays exactly as shipped in v2.0. Leaderboard is the ALL-vs-ALL surface.
- **Harness v1.2** — Mac pack stays at v1.1. Website compensates with metadata entry at ingest time.
- **Virtualized leaderboard tables** (`@tanstack/react-virtual`) — corpus < 20 reviews; not needed until > 200.
- **MDX methodology** — methodology page uses the existing Tiptap editor in admin, DB-driven.
- **Affiliate links in tables** — credibility over monetization.
- **Paywalled scores** — full transparency, everything public.
- **Contact page for Studios** — still deferred; requires business info not yet finalized.
- **Same-origin cross-brand audio fix** — deferred to a future infra milestone. v3.0 keeps the "open in new tab" workaround from v2.0 Phase 14.

---

## Launch Readiness Checklist

- [ ] All METH-* land in Phase 1 (schema debt can't survive past Phase 2).
- [ ] Query refactors (METH-07) verified — `/tech/compare` still works after changes.
- [ ] ING-01 wizard can ingest the MBP M5 Max CPU §3.1 data end-to-end in dry-run.
- [ ] BPR score visible on MBP review detail + laptop leaderboard.
- [ ] `/tech/methodology` linked from every review scorecard.
- [ ] Flagship review (FLAG-03) reads like a template — any reviewer could slot in #2 without new scaffolding.
- [ ] glitchtech.io resolves in production with valid cert.
- [ ] Playwright spec covering all major v3.0 routes.

---

*Last updated: 2026-04-21 — v3.0 GlitchTek Launch requirements defined. Research synthesized in `.planning/research/SUMMARY.md`.*
