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
- [x] **Phase 26: Brand-Aware Auth UI Redesign** — brand-themed login/register/forgot/reset/verify surfaces; split register (customer wizard vs artist request flow); social login (Google + Meta + GitHub) (completed 2026-04-25)

**🎬 Foundation:**
- [x] **Phase 27: Media/Video Strategy Foundation** — canonical YouTube embed pattern (`<MediaEmbed>`); polymorphic `media_item` schema with entity attachments; admin add-video flow + home features picker; 7 plans across 4 waves (completed 2026-04-25)

**🏆 Tech product core (the headline):**
- [x] **Phase 28: GlitchMark System** — research + lock formula, schema, compute on ingest, methodology page section — GLITCHMARK-01..08 (completed 2026-04-25)
- [x] **Phase 29: Master Leaderboard** — `/tech/categories/[slug]/rankings` sortable/filterable with GlitchMark + BPR + any benchmark column — RANK-01..07 (completed 2026-04-25)
- [x] **Phase 29.1: Master Leaderboard Polish (INSERTED)** — top-level `/tech/rankings` route + sidebar nav button next to Blog, hero sections on rankings + category pages, horizontal-scroll fix, filter UI rework (top bar vs collapsible sidebar), mobile view toggle (cards ↔ table), GlitchMark scale display revisit. Sequential execution, Playwright-driven visual verification each step. (completed 2026-04-26)
- [x] **Phase 29.2: Site-Wide Hero Rollout + Methodology Editorial Upgrade (INSERTED)** — TechHero on every remaining /tech/* surface (about, reviews, categories hub, compare, benchmarks, blog); methodology page editorial upgrade (stat cards, discipline-card grid, medal-tier ladder, glitchy table treatment); category tile imagery (real thumbnails or hero-sized icons replacing the empty-box look); /tech/blog page build-out beyond stub. Methodology data already audited and accurate (no rubric fix needed). Sequential execution, Playwright-driven verification per plan. See `.planning/phases/29.2-site-wide-hero-rollout/29.2-CONTEXT.md`. (completed 2026-04-27)
- [ ] **Phase 29.3: Reduce Filter-Path GPU Baseline + Re-Enable Filter (INSERTED — URGENT)** — chip clicks on `/tech/rankings/laptops` crashed macOS Safari + Firefox tabs. 4-agent code audit on 2026-04-26 revealed the original "rebuild the dropdown" plan was targeting the wrong layer: cost is dominantly in the persistent baseline (Footer mounts LogoTile glitchLayer1/2 unguarded — same `mix-blend-mode + filter` pattern that was fixed in `logo-tile.tsx` was missed in `footer.tsx`; AudioPlayerProvider ships fresh `value` object every render → re-renders WidgetNowPlaying which always renders a `<canvas>` waveform; columns useMemo has stale `filters.sort/dir` deps that rebuild all column defs on sort; table has `min-width: 1600px` overflow surface). All independent of dropdown architecture. This phase fixes the baseline first, deploys to preview with filter still hidden so user can verify on macOS Safari + Firefox via sort-header click (same `setFilters` write path), THEN re-mounts the existing filter UI as-is. NO dropdown rebuild unless baseline fixes fail. Investigation artifact: `.planning/debug/filter-chip-crash-mac-browsers.md`. Audit findings: this phase's CONTEXT.md.
- [x] **Phase 30: Per-Benchmark Pages** — `/tech/benchmarks` landing + `/tech/benchmarks/[slug]` cross-category leaderboard per benchmark (completed 2026-04-28)
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
- [ ] **Phase 38: GlitchTech Brand-Wide Editorial Polish (slimmed by 29.2)** — review card hierarchy, cross-link sweep, BPR medal visual redesign (realistic illustrations replacing monochrome), GlitchTech mobile menu content bleed fix. NOTE: hero sections + category tile polish + methodology nav link were absorbed into Phase 29.2.
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

**🧯 Audit gap closure:**
- [ ] **Phase 47: Verification Backfill + Planning State Repair** — create missing phase-level VERIFICATION.md artifacts for 22/23/24/25/29.1/29.3, reconcile ROADMAP.md + STATE.md drift, close 29.3 roadmap state, and normalize requirement evidence against `.planning/v4.0-MILESTONE-AUDIT.md`.
- [ ] **Phase 48: Launch Blocker Proof Pass** — close the launch-blocker proof gaps called out by the milestone audit: Resend/domain deliverability, auth/OAuth/admin-invite smoke, mobile checkout purchase proof, and performance evidence for PERF-03/04/06.

#### Phase 47: Verification Backfill + Planning State Repair

**Goal:** Repair audit-blocking planning/evidence drift so the milestone has trustworthy phase-level verification artifacts and current state before the next completion audit.

**Requirements:** AUDIT-01..04 evidence normalization; RANK-01..07 evidence normalization; 29.3 filter recovery phase close-state.

**Gap Closure:** Closes missing phase-level verification artifacts for phases 22, 23, 24, 25, 29.1, and 29.3; reconciles `STATE.md` saying "Milestone complete" while the roadmap still has unchecked scope; updates ROADMAP/REQUIREMENTS traceability as needed.

**Tasks:**
1. Write phase-level verification reports for 22, 23, 24, 25, 29.1, and 29.3 from existing summaries and evidence, marking remaining blockers explicitly where they are not functionally closed.
2. Mark Phase 29.3 complete in ROADMAP only if 29.3 phase-level verification confirms the 29.3-06 user macOS pass is sufficient.
3. Reconcile `STATE.md` with actual current focus and roadmap status.
4. Re-run audit evidence extraction to confirm missing-verification gaps are either closed or intentionally carried to Phase 48.

#### Phase 48: Launch Blocker Proof Pass

**Goal:** Turn the launch-blocker cluster from "implemented or partially implemented" into verified end-to-end production-ready flows.

**Requirements:** EMAIL-01..08, PERF-01..07, AUTH-14..22, AUTH-26, AUTH-28, AUTH-29, AUTH-32.

**Gap Closure:** Closes the audit's critical launch-flow gaps: Resend DNS/domain verification; password reset and email verification smoke; Google OAuth on both brands; artist request approval/invite smoke; mobile checkout test-card purchase on the original failing device path; public route cold-nav, mobile LCP, and bundle evidence.

**Tasks:**
1. Complete Resend domain setup and DNS verification for both brands, then smoke password reset, verification email, booking/order/contact/newsletter sends.
2. Complete auth launch smoke: Google OAuth on both brands, unverified-user soft gate, grandfather migration, admin application approve/reject/request-info flows, and invite email delivery.
3. Verify mobile checkout end-to-end on real iOS Safari and desktop with a Stripe test-card purchase; fix any diagnosed runtime/env issue.
4. Capture performance evidence for PERF-03, PERF-04, and PERF-06, and fold any small fixes needed for the launch threshold into this phase.

#### Phase 26: Brand-Aware Auth UI Redesign

**Goal:** Replace the generic email+password auth surfaces (login, register, forgot-password, reset-password, verify-email) with brand-aware, production-grade flows that theme by host (`glitchstudios.io` vs `glitchtech.io`), split registration by role (customer wizard vs artist request), and add social login (Google + Meta + GitHub). Auth must feel like a real product on both brands, not a scaffold.

**Depends on:**
- Phase 24 (Email Delivery) shipped — Resend + React Email wired so verify/reset emails actually send
- Better Auth stack already in place (`src/lib/auth.ts`); `trustedOrigins` + prod domain fixes landed in Phase 22 audit
- Forgot/reset route scaffolds from Phase 23-06 (Better Auth stubs, handoff to this phase)
- Brand host middleware already routes Studios vs GlitchTech

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, AUTH-11, AUTH-12, AUTH-13, AUTH-14, AUTH-15, AUTH-16, AUTH-17, AUTH-18, AUTH-19, AUTH-20, AUTH-21, AUTH-22, AUTH-23, AUTH-24, AUTH-25, AUTH-26, AUTH-27, AUTH-28, AUTH-29, AUTH-30, AUTH-31, AUTH-32

**Success Criteria** (what must be TRUE):
1. All five auth surfaces (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`) render distinct Studios vs GlitchTech theming based on host — logo, palette, typography, hero imagery/copy all swap. Both brands feel production-grade, not scaffolded.
2. Desktop split-layout (form + brand-side treatment) and mobile stacked layout both ship. Visual hierarchy matches the rest of the site's editorial weight (not a bare form on a blank page).
3. `/register` presents two CTAs: **Register as customer** (multi-step wizard: identity → preferences → confirm) and **Request to join as artist** (application form → admin review queue → invite email on approval). Public artist self-serve is explicitly OUT of scope (v5.0).
4. Social login buttons (Google + Meta + GitHub) are functional end-to-end on at least one brand host: OAuth app created per provider, redirect URIs configured, client IDs/secrets in Vercel env, Better Auth provider plugins wired, successful sign-in creates/links a Better Auth user. Extensible pattern documented for adding more providers.
5. Error messaging is enumeration-safe (same generic "invalid credentials" on wrong-password vs unknown-email), but copy is brand-voice polished, not raw framework strings.
6. Email verification (Better Auth + Resend) is enforced on new email/password registrations; social logins skip (provider-verified). `/verify-email` landing page handles valid/expired/already-verified tokens gracefully with branded copy.
7. Forgot/reset flow works end-to-end on prod: form submit → Resend-delivered email → tokenized link → `/reset-password` accepts new password → user redirected to login with success toast. No dead ends.
8. `pnpm tsc --noEmit` and `pnpm lint` pass. Manual Playwright pass through both brand hosts on login/register/forgot/reset/verify with at least one social provider.

**UI hint:** yes — this phase is primarily UI design (brand-aware layouts, theming system, wizard patterns, social-login button treatment). UI-SPEC.md required before planning.

**Out of scope (explicitly):**
- Twilio SMS (user-flagged, parked — no v4.0 commitment)
- Public artist self-serve signup (v5.0; v4.0 is admin-invite only via the request flow)
- Admin self-registration (admins are always provisioned by other admins)
- 2FA / MFA (separate phase if/when needed)

**Plans:** 12/12 plans complete

**Wave layout:**
- Wave 1 (parallel): 01, 03 — independent foundations (brand utility, schema)
- Wave 2: 02 — shared auth components (depends on 01)
- Wave 3 (parallel): 04, 07, 08, 09 — backend/page rebuilds that don't share files
- Wave 4 (parallel): 05, 06, 10 — login + register customer + admin backend (all depend on 04 and/or 07)
- Wave 5: 11 — admin queue UI (depends on 10)
- Wave 6: 12 — verification + ship checklist (depends on all)

- [x] 26-01-PLAN.md (Wave 1) — Brand utility extraction + (auth)/layout server component + REQUIREMENTS.md AUTH-* IDs append
- [x] 26-02-PLAN.md (Wave 2) — AuthShell + BrandSidePanel + EnumSafeFormError + SocialAuthRow + WizardProgress + PasswordField + AuthFormCard + useBrand hook + (auth)/layout AuthShell wiring
- [x] 26-03-PLAN.md (Wave 1) — Drizzle artistApplication schema + newsletterOptIn user column + grandfather migration + runner script
- [x] 26-04-PLAN.md (Wave 3) — Better Auth socialProviders config (Google + Meta + GitHub) + accountLinking.enabled false + OAuth brand SVGs + SocialAuthRow icons wiring + .env.example
- [x] 26-05-PLAN.md (Wave 4) — /login rebuilt against AuthShell + SocialAuthRow + EnumSafeFormError + account_not_linked URL handler
- [x] 26-06-PLAN.md (Wave 4) — /register role-select tiles + customer wizard at /register/customer?step=1|2|3 (atomic step-3 submit, server-action email pre-check)
- [x] 26-07-PLAN.md (Wave 3) — /register/artist single-page form + submitArtistApplication server action + admin notification email + ArtistApplicationInput type
- [x] 26-08-PLAN.md (Wave 3) — /forgot-password + /reset-password polish (AuthShell + branded copy + enumeration-safe success + expired-token Alert)
- [x] 26-09-PLAN.md (Wave 3) — /verify-email 3-state route + soft-gate guards in (public)/dashboard/admin layouts via requireVerifiedEmailOrRedirect helper
- [x] 26-10-PLAN.md (Wave 4) — Admin queue BACKEND: artist-approval-invite email template + auth.ts sendResetPassword dual-handler + approve/reject/request-info server actions
- [x] 26-11-PLAN.md (Wave 5) — Admin queue FRONTEND: /admin/applications page (with HoverGlitchHeading H1 per AUTH-31) + ApplicationListTable + ApplicationDetailSheet + ApplicationApproveDialog
- [x] 26-12-PLAN.md (Wave 6) — Verification + ship checklist (tsc/lint, GlitchTech spelling sweep, Playwright pass on both brands × 5 surfaces × Google OAuth, Vercel env-var checklist)

---

#### Phase 27: Media/Video Strategy Foundation

**Goal:** Establish the canonical pattern for embedding YouTube videos across the site. Ship a polymorphic `media_item` table that lets any entity (beat, portfolio_item, service, tech_review, home_feature) have one or many attached videos. Build a single `<MediaEmbed>` component (click-to-play thumbnail + desktop hover-preview muted-autoplay + youtube-nocookie host always) used by every public surface that renders video. Build the per-entity admin add-video UX (paste YouTube URL → server-side oEmbed fetch → cached row) and a home-features picker. Replace the empty hero `<VideoPortfolioCarousel>` with a 3-up `<HomeFeaturedWorkGrid>` that returns null on empty (D-12).

**Depends on:**
- Phase 22 audit (canonical YouTube + per-entity attach decisions)
- Existing `extractYouTubeId()` at `src/lib/tech/youtube.ts`
- Existing dnd-kit precedent at `src/components/admin/homepage-editor.tsx:65-110`
- Phase 26 migration pattern (`0006_phase26_auth.sql` — DO $$ EXCEPTION enum guard, IF NOT EXISTS, `phase26_migration_meta` row guard)

**Requirements:** D-01..D-18 (CONTEXT.md is the requirement set; no formal REQ-IDs allocated — see RESEARCH.md "Phase Requirements" section)

**Success Criteria** (what must be TRUE):
1. `media_item` table is live in Postgres with `media_kind` pgEnum, polymorphic `(attached_to_type, attached_to_id)` index, and idempotent backfill from `portfolio_items.video_url` and `tech_reviews.video_url` (rows marked `is_primary=true`).
2. Every public surface that renders a YouTube video uses `<MediaEmbed>` — `grep -r "youtube.com/embed" src/components/ src/app/ | grep -v "youtube-nocookie" | grep -v node_modules` returns 0 lines. All embeds use `youtube-nocookie.com`.
3. Desktop with `pointer: fine` and `prefers-reduced-motion: no-preference`: hovering a tile swaps to muted iframe preview. Mobile (`pointer: coarse`) and reduced-motion users get tap-only / click-only behavior — no iframe swap.
4. Admin can paste a YouTube URL on any entity edit form, server-side `extractYouTubeId` validates, oEmbed fetches title + thumbnail, row inserts. Invalid URL surfaces verbatim "That URL doesn't look like a YouTube link..." copy. oEmbed timeout degrades gracefully ("Couldn't load video info from YouTube. The link is saved...").
5. `/admin/homepage` mounts a Home Features section: pin existing media_items, drag-to-reorder with KeyboardSensor (a11y), top 3 sort_order rows tagged "Live on home" chip, cap warning when 4+ tagged.
6. `<HomeFeaturedWorkGrid>` replaces both `<VideoPortfolioCarousel>` mount points on `src/app/(public)/page.tsx` (lines 97 + 143). Renders null when no `home_feature` rows exist (D-12). H2 + H3 wrapped in `<GlitchHeading>` per site-wide hover-only-RGB-split rule.
7. `<ReviewVideoEmbed>` prefers `media_item`, falls back to `tech_reviews.video_url` for one release (D-07 read-time fallback). `<VideoCard>` uses `<MediaEmbed mode="thumbnailOnly">` to avoid nested interactive elements inside its `<Link>` wrapper. Beat detail conditionally renders "Made by hand" section when media_items exist.
8. `pnpm tsc --noEmit` and `pnpm lint` pass.

**UI hint:** yes — UI-SPEC.md approved 2026-04-25 (interactions, copy, a11y, verification hooks all locked).

**Out of scope (explicitly):**
- Instagram short-form embeds (deferred — schema's `kind` enum is forward-extensible)
- Self-hosted video player (YouTube-first locked in Phase 22 audit)
- Central `/admin/media-library` UI (per-entity attach only this phase)
- Captions / transcripts / chapters (defer to SEO phase)
- Dropping deprecated `video_url` columns (separate cleanup phase after one-release deprecation window)
- AI-generated thumbnails / preview clips

**Plans:** 7/7 plans complete

**Wave layout:**
- Wave 1 (parallel, no deps): 27-01 (schema + migration), 27-02 (next.config i.ytimg.com)
- Wave 2 (parallel, depend on Wave 1): 27-03 (`<MediaEmbed>` + hooks), 27-04 (oEmbed action + queries + admin server actions)
- Wave 3 (parallel, depend on Wave 2): 27-05 (admin attach UI + 4 entity edit pages), 27-06 (home features admin)
- Wave 4 (sequential, depends on 03 + 04 + 06): 27-07 (public surfaces — home grid + ReviewVideoEmbed + VideoCard refactors + beat detail)

Plans:
- [x] 27-01-PLAN.md (Wave 1) — Drizzle `mediaItems` + `mediaKindEnum` schema + idempotent SQL migration `0007_phase27_media.sql` mirroring Phase 26 pattern + standalone postgres-js runner
- [x] 27-02-PLAN.md (Wave 1) — Whitelist `i.ytimg.com` in `next.config.ts` `images.remotePatterns` (blocks `<MediaEmbed>` thumbnails otherwise)
- [x] 27-03-PLAN.md (Wave 2) — `<MediaEmbed>` + `<MediaEmbedThumbnail>` + `useFinePointer` + `useReducedMotion` hooks (`youtube-nocookie.com`, hqdefault fallback, three render states, accessibility-first)
- [x] 27-04-PLAN.md (Wave 2) — `fetchYouTubeOEmbed` server-only fetcher + `getMediaForEntity`/`getHomeFeatureMedia` queries + 7 server actions (attach/update/remove/reorder/setPrimary/pinToHomeFeatures/setHomeFeatures) all guarded by `requirePermission("manage_content")`
- [x] 27-05-PLAN.md (Wave 3) — `<AddVideoDialog>` + `<MediaItemAttachmentList>` (dnd-kit reorder, AlertDialog destructive remove, verbatim UI-SPEC copy) + mount on 4 entity edit pages (beat / portfolio_item / service / tech_review) + add shadcn `alert-dialog` primitive
- [x] 27-06-PLAN.md (Wave 3) — `<HomeFeaturesAdmin>` (pin existing media_item to home_feature, dnd-kit reorder with hard-cap-3 visual, AlertDialog remove) + mount inside existing `/admin/homepage` page
- [x] 27-07-PLAN.md (Wave 4) — `<HomeFeaturedWorkGrid>` server component (replaces `<VideoPortfolioCarousel>` at both mount points) + refactor `<ReviewVideoEmbed>` to use `<MediaEmbed>` with `media_item` + `video_url` fallback + refactor `<VideoCard>` to use `<MediaEmbed mode="thumbnailOnly">` + add conditional "Made by hand" section to beat detail

---

#### Phase 29.1: Master Leaderboard Polish (INSERTED)

**Goal:** Polish the leaderboard SURFACE based on Phase 29 UAT — promote rankings to a top-level discovery surface (`/tech/rankings` hub + `/tech/rankings/[slug]` canonical leaderboard), add hero sections to rankings + category pages, fix the desktop horizontal-scroll bug, replace the left filter sidebar with a top filter bar, ship a mobile Cards↔Table view toggle, change GlitchMark display to ×10 (display-only, schema unchanged), and fix the production mobile-nav active-state bug caused by the brand-host rewrite. Sequential execution (no parallel waves) — each visual change verified inline with Playwright before the next plan starts.

**Depends on:**
- Phase 29 (Master Leaderboard) shipped — data layer (`leaderboard.ts`), seed (6 placeholder reviews), TanStack + nuqs table shell, URL state schema, cache invalidation wiring, 7-filter set all stay
- Phase 28 (GlitchMark System) shipped — formula and base-100 anchor unchanged; this phase only changes the display scale
- Phase 27 (Media/Video) and Phase 22 §B.6 framing — rankings as the headline product surface

**Requirements:** TBD (no formal REQ-IDs allocated — driven by Phase 29 UAT findings + user direction; CONTEXT.md decisions D-01..D-25 are the requirement set)

**Success Criteria** (what must be TRUE):
1. New canonical route `/tech/rankings/[slug]` ships and renders the same leaderboard data as the old `/tech/categories/[slug]/rankings`. New hub `/tech/rankings` lists category tiles. Old URL 301-redirects to the new one. The category page's "View Rankings" CTA points at the new canonical URL.
2. Sidebar nav order on GlitchTech is `Reviews → Rankings → Categories → Compare → Benchmarks → Blog → About`. About sits last. Rankings sits second. Mobile overlay menu reflects the same order; mobile bottom-tab capacity is preserved (Rankings goes in the overlay menu, not the always-visible bottom tab).
3. Hero sections render on three surfaces (`/tech/rankings`, `/tech/rankings/[slug]`, `/tech/categories/[slug]`) using the beats-store full-bleed dark hero pattern, with `<GlitchHeading>` h1s that follow the hover-only RGB-split rule (no auto-running animations).
4. Top filter bar replaces the left sidebar with all 7 facets always visible (Price as popover, the rest as inline chips, Reset filters at right). The mobile filter `Sheet` reuses the same component in vertical layout.
5. Desktop table no longer cuts off the rightmost columns: `<table>` has a sensible `min-width` based on column count, the outer `max-w-[1400px]` wrapper cap is removed, and `overflow-x-auto` engages when viewport < min-width. Sticky `#` and Product columns hold without bleed-through.
6. Mobile view toggle (`[ Cards | Table ]`) ships as a segmented control in the mobile filter bar, default = Cards, URL state `?view=cards|table` via nuqs with `clearOnDefault: true`. View toggle persists across navigation within the leaderboard surface.
7. GlitchMark displays as stored-value × 10, rounded to integer, everywhere it surfaces (desktop table cell + mobile card). A single helper `formatGlitchmarkDisplay(score)` in `src/lib/tech/glitchmark.ts` is the single source of truth. Sort comparator unchanged (sorts on numeric, NULLS LAST holds). Schema unchanged. Methodology page documents the ×10 convention.
8. About page (`/tech/about`) becomes the methodology hub with working anchors `#methodology`, `#bpr`, `#glitchmark` (and `#disciplines` if reusable). `/tech/methodology` either 301-redirects forward (preserving the `#anchor` fragment when possible) or stays as a thin landing — researcher decides. Existing leaderboard column-header methodology icons resolve correctly.
9. Mobile nav active-state highlights correctly on `glitchtech.io` in production. Root cause (middleware rewrites `/foo` → `/tech/foo` but `usePathname()` returns the browser URL `/foo` while nav items are configured with `/tech/*` hrefs) is fixed via a normalization helper (e.g. `isTechPathActive(itemHref, pathname)` in `src/lib/tech/nav.ts`) applied to every mobile nav surface that uses `usePathname()` for active highlighting.
10. Each plan ships a Playwright spec covering its visual change. Sequential execution: Plan N's Playwright passes before Plan N+1 begins. `pnpm tsc --noEmit` and `pnpm lint` pass after each plan.

**UI hint:** yes — every plan in this phase touches surface visuals (hero, filter bar, table layout, view toggle, nav order). Use existing Phase 26/29 design patterns — no new UI-SPEC.md required since the design contract is fully captured in CONTEXT.md decisions D-01..D-25 and `references/ui-brand.md`.

**Out of scope (explicitly):**
- Affiliate cloaking (Phase 41)
- Compare integration: row-pinning, slug acceptance, redesign (future phase)
- Per-benchmark cross-category pages (Phase 30)
- Editorial reframe of `/tech/categories/[slug]` — this phase only adds the hero (Phase 31)
- Replacing placeholder reviews with real ones (Phase 36+)
- Recompute internal GlitchMark to base 1000 — display ×10 is presentation-only
- New filter facets, table column reorder, BPR medal/score column changes
- About page full editorial rewrite — minimum needed: the methodology anchors work and both formulas are explained
- Auth, payment, blog, beats work

**Plans:** 9/9 plans complete

**Plans:**
- [ ] 29.1-01-tech-nav-active-state-PLAN.md — Mobile/desktop nav active-state fix (`isTechPathActive` helper + `BottomTabBar` + tile-nav both branches) — D-23, D-24, D-25
- [ ] 29.1-02-about-methodology-anchors-PLAN.md — About page methodology hub + anchors `#methodology #bpr #glitchmark` + `/tech/methodology` 308 redirect + 6 in-app caller updates — D-02, D-03, D-21
- [ ] 29.1-03-rankings-routes-redirect-PLAN.md — New `/tech/rankings` (hub) + `/tech/rankings/[slug]` (canonical) + per-route `permanentRedirect` from old URL + category page CTA href update — D-04, D-05, D-06, D-07
- [ ] 29.1-04-sidebar-nav-reorder-PLAN.md — `tech-nav-config.ts` desktop sidebar reorder + Rankings/About in mobile overlay menu (bottom-tab unchanged for muscle memory) — D-01
- [ ] 29.1-05-tech-hero-component-PLAN.md — Reusable `TechHero` component (cyan/amber tone) + mounted on rankings hub, leaderboard, category page; hover-only RGB-split via `<GlitchHeading>` — D-08, D-09, D-10, D-11
- [ ] 29.1-06-top-filter-bar-PLAN.md — Rewrite `LeaderboardFilters` in place as horizontal top bar (all 7 facets always visible, Price popover, chip rows wrap, Reset right); mobile Sheet reuses vertically — D-12, D-13, D-14
- [ ] 29.1-07-table-horizontal-scroll-fix-PLAN.md — `<table>` `min-width: 1600px` + remove outer `max-w-[1400px]` cap; sticky cells hold — D-15, D-16
- [ ] 29.1-08-mobile-view-toggle-PLAN.md — `LeaderboardViewToggle` segmented control + nuqs `view` URL key (`parseAsStringLiteral` Cards/Table, default Cards, clearOnDefault) + render gate — D-17, D-18
- [ ] 29.1-09-glitchmark-display-PLAN.md — `formatGlitchmarkDisplay(score)` helper in `src/lib/tech/glitchmark.ts` + 2 callsite updates (table + card); accessorFn + sort comparator UNCHANGED — D-19, D-20, D-21, D-22

**Wave layout:** Sequential only — no parallel waves. Each plan completes (including its Playwright pass) before the next plan starts. Waves run 1..9 with `depends_on: ["29.1-NN"]` chain.

---

#### Phase 29.2: Site-Wide Hero Rollout + Methodology Editorial Upgrade (INSERTED)

**Goal:** Bring the TechHero pattern from Phase 29.1-05 to every remaining `/tech/*` surface that still renders a bare `<h1>` (about, reviews, categories hub, compare, benchmarks, blog), promote `TechHero` to accept a `size?: "compact" | "default" | "tall"` variant for editorial-keystone surfaces, lift the methodology page (`/tech/about`) from "a lot of text" to a richer editorial layout (stat cards, discipline card grid, medal threshold ladder, terminal-styled formula block, RGB-split row hover on the rubric table), upgrade category tile imagery from a 40px lucide-icon-in-empty-box to a real visual (Direction A: thumbnails + small badge icon — preferred; Direction B: 80–96px scaled icon + caption — acceptable fallback), and build out `/tech/blog` beyond the current stub. Sequential execution, Playwright verification per plan.

**Depends on:**
- Phase 29.1 shipped — `TechHero` component, `<GlitchHeading>` integration, sidebar nav, `/tech/rankings` routes, methodology hub anchors
- Phase 17 (BPR Medal UI + Methodology Page) — methodology data layer (`getMethodologyData()`, 13 disciplines, 7 BPR-eligible, 43 tests, rubric v1.1, BPR formula) audited 2026-04-26 and confirmed accurate
- Existing `<MethodologyFormula>`, `<MethodologyDisciplineTable>`, `<MethodologyMedalTable>`, `<CategoryTile>` components

**Requirements:** TBD (no formal REQ-IDs allocated — driven by Phase 29.1 UAT findings; CONTEXT.md scope is the requirement set)

**Canonical refs:**
- `.planning/phases/29.2-site-wide-hero-rollout/29.2-CONTEXT.md` — phase scope and decisions
- `.planning/phases/29.2-site-wide-hero-rollout/29.2-UI-SPEC.md` — UI design contract (6/6 dimensions APPROVED)
- `.planning/phases/29.1-master-leaderboard-polish/29.1-05-tech-hero-component-PLAN.md` — original TechHero pattern
- `references/ui-brand.md` — brand standards (hover-only RGB-split, GlitchTech spelling, sidebar-no-scroll)

**Success Criteria** (what must be TRUE):
1. Every `/tech/*` route renders a `<TechHero>` (or richer hero variant) at the top — no bare `<h1>` remains on `/tech/about`, `/tech/reviews`, `/tech/categories`, `/tech/compare`, `/tech/benchmarks`, `/tech/blog`.
2. `TechHero` accepts a `size?: "compact" | "default" | "tall"` prop with corresponding heights (200px / 280px / 400px). Default behavior unchanged for callers that omit the prop. `/tech/about` renders the `tall` variant.
3. `/tech/about` no longer reads as "a lot of text" — has stat cards row (43 tests / 13 disciplines / 7 BPR-eligible) above formula block, discipline grid replacing the discipline table (13 cards, 7 carry the BPR-eligible badge), medal threshold ladder replacing the medal table (Platinum ≥90 / Gold 80–89 / Silver 70–79 / Bronze 60–69 in correct order), terminal-styled formula block, RGB-split row hover on rubric-changelog table.
4. Category tiles don't read as empty boxes — either a real thumbnail with corner badge icon (Direction A) or a hero-sized 80–96px lucide icon with a category-descriptor caption (Direction B). Decision locked in plan-phase.
5. `/tech/blog` page builds out beyond the stub — base TechHero (amber, "Read latest" CTA) plus either an actual list of posts or a "Coming soon" treatment if content isn't ready.
6. Every hero h1 wraps in `<GlitchHeading>` with hover-only RGB-split (no auto-running animations on h1).
7. Brand spelling is GlitchTech everywhere new copy is added (no GlitchTek typos introduced).
8. Sidebar continues to fit one screen without scroll — no new fixed-height widgets that push the sidebar past one screen.
9. Each plan ships a Playwright spec covering its visual change. Sequential execution: Plan N's Playwright passes before Plan N+1 begins. `pnpm tsc --noEmit` and `pnpm lint` pass after each plan.
10. `pnpm build` clean (no new TypeScript errors, no new lint warnings).

**UI hint:** yes — every plan in this phase touches surface visuals (heroes, methodology editorial elements, tile imagery, blog page). UI-SPEC.md (`29.2-UI-SPEC.md`) is the design contract — 6/6 dimensions approved 2026-04-26.

**Out of scope (explicitly):**
- Rankings filter crash (escalated to Codex separately, blocking — handled outside this phase)
- Per-benchmark cross-category pages (`/tech/benchmarks/[slug]` — Phase 30)
- Editorial reframe of `/tech/categories/[slug]` — that page already has TechHero from 29.1-05; full editorial reframe is later (Phase 31)
- Studios-side pages (`/`, `/beats`, `/services`, etc.) — separate cycle
- Methodology data fixes — data layer audited 2026-04-26 and confirmed accurate; this phase is presentation only
- Real category thumbnail asset pipeline (uploads, CDN config) — placeholder thumbnails or Direction B fallback are acceptable for this phase
- Replacing placeholder reviews with real ones (Phase 36+)
- Auth, payment, beats, studios work


**Plans:** 10/10 plans complete

Plans:
- [x] 29.2-01-PLAN.md — TechHero size variants (compact/default/tall prop + HEIGHT_MAP)
- [x] 29.2-02-PLAN.md — /tech/about hero (tall amber) + stat cards row + terminal formula
- [x] 29.2-03-PLAN.md — /tech/about discipline cards (13-card grid replacing table)
- [x] 29.2-04-PLAN.md — /tech/about medal threshold ladder (replacing table)
- [x] 29.2-05-PLAN.md — /tech/reviews TechHero (cyan, "Browse latest")
- [x] 29.2-06-PLAN.md — /tech/categories hub TechHero (amber, "View rankings")
- [x] 29.2-07-PLAN.md — Category tile imagery Direction B (80px icon + caption)
- [x] 29.2-08-PLAN.md — /tech/compare TechHero (cyan, "Pick devices")
- [x] 29.2-09-PLAN.md — /tech/benchmarks TechHero (cyan, "Read methodology")
- [x] 29.2-10-PLAN.md — /tech/blog build-out (amber, "Read latest" + empty-state)

**Wave layout:** Sequential only — waves 1-10, each plan depends on the prior. Each plan completes (including its Playwright pass) before the next plan starts.

---

#### Phase 29.3: Reduce Filter-Path GPU Baseline + Re-Enable Filter (INSERTED — URGENT)

**Goal:** Fix the persistent GPU/render-cycle baseline costs that the 2026-04-26 4-agent code audit identified as the dominant suspects for the macOS Safari + Firefox chip-click crash, validate stability on real macOS browsers via sort-header click (same `setFilters` write path as filter chips would use) WITHOUT touching the filter, then re-mount the existing `LeaderboardFilters` chip-bar as-is (no dropdown rebuild). The original Phase 29.3 plan to rebuild the dropdown architecture is replaced because audit findings show the chip-bar's third-party state machinery is NOT the dominant cost — the cost is in (a) Footer's unguarded LogoTile glitchLayer1/2 mount carrying `mix-blend-mode: screen` + `filter: hue-rotate/saturate/brightness` permanently on every page (the same pattern that was hover-gated in `logo-tile.tsx` but missed in `footer.tsx`), (b) `AudioPlayerProvider`'s un-memoized `value` object causing always-mounted `WidgetNowPlaying` to re-render its `<canvas>` waveform on every parent render, (c) `LeaderboardTable`'s `columns` useMemo having stale `filters.sort/dir` deps that rebuild all column defs on every sort click (and headers don't even use these values anymore — `SortHeader` is a no-op visual after the atomic fix), (d) `LeaderboardTable`'s `<table style={{ minWidth: "1600px" }}>` inside `overflow-x-auto` forcing Metal to rasterize a viewport-wide tile end-to-end on every state change. Sequential execution, two human-gate checkpoints (one after baseline fixes, one after re-mount).

**Depends on:**
- Phase 29.1 shipped — `LeaderboardFilters` (top-bar + Sheet rewrite), `LeaderboardTable` integration, `view` URL key, sticky cells removed
- 4-agent code audit on 2026-04-26 — findings captured in `.planning/phases/29.3-rebuild-filter/29.3-CONTEXT.md` (Audit Findings block)
- Debug artifact `.planning/debug/filter-chip-crash-mac-browsers.md` — eliminated hypotheses (sticky cells, framer-motion template, Base UI Popover, tooltips, startTransition, BottomTabBar prefetch, nuqs, mix-blend-mode in shell, drop-shadow on LogoTile, 1200×800 placeholder PNG)
- Existing `src/components/tech/leaderboard-filter-sidebar.tsx` and `leaderboard-filter-sheet.tsx` are intact and unchanged — re-mount as-is

**Requirements:** TBD (no formal REQ-IDs — CONTEXT.md is the requirement set; baseline-first methodology drives the plan order)

**Canonical refs:**
- `.planning/phases/29.3-rebuild-filter/29.3-CONTEXT.md` — full audit findings, ranked suspect list with file:line, baseline-first plan rationale
- `.planning/debug/filter-chip-crash-mac-browsers.md` — original root-cause investigation
- `src/components/layout/footer.tsx` — Footer (Suspect #1 — unguarded glitchLayer1/2 mount)
- `src/components/tiles/logo-tile.tsx` — reference pattern for hover-gated mounting (Footer fix should mirror lines 24-55)
- `src/components/player/audio-player-provider.tsx` — Suspect #4 (un-memoized context `value`)
- `src/components/tiles/widget-now-playing.tsx` — Suspect #8 (unconditional `<Waveform>` canvas mount when idle)
- `src/components/tech/leaderboard-table.tsx` — Suspects #2 (columns useMemo stale deps at line 542) + #3 (`min-width: 1600px` at line 624) + atomic-fix boundary (filter render commented around lines 596-607 and mobile sheet around line 717); `applyFilters` + `deriveBounds` + `AllFilters` state machinery is correct and untouched
- `references/ui-brand.md` — brand standards (hover-only RGB-split, GlitchTech spelling, sidebar-no-scroll)

**Success Criteria** (what must be TRUE):
1. **Footer fix** — `src/components/layout/footer.tsx` mounts `.glitchLayer1` and `.glitchLayer2` only on hover, mirroring the pattern in `src/components/tiles/logo-tile.tsx` (the `LogoTile` component uses `useState` + `onMouseEnter/onMouseLeave` and conditionally renders the layers).
2. **AudioPlayer fix** — `src/components/player/audio-player-provider.tsx` wraps the context `value` object in `useMemo` with the appropriate dependency list (`currentBeat`, `isPlaying`, `currentTime`, `duration`, `isMinimized`, plus the stable callbacks). No fresh object literal on every render.
3. **WidgetNowPlaying fix** — `src/components/tiles/widget-now-playing.tsx` does NOT render `<Waveform>` when `currentBeat === null`. The "no track playing" state shows the text/icon row only, no canvas surface.
4. **Columns memo fix** — `src/components/tech/leaderboard-table.tsx` removes `filters.sort` and `filters.dir` from the `columns` useMemo deps (line 542). Headers do not consume these values (`SortHeader` is a static no-op visual after the atomic fix). Sort changes flow through `state.sorting` to TanStack without rebuilding column defs.
5. **Table min-width fix** — `src/components/tech/leaderboard-table.tsx` reduces `min-width: 1600px` (line 624) to `min-width: 100%` (or 1280px if 100% breaks layout). Page is wrapped in `max-w-[1600px]` already so the table is viewport-wide on a maxed display either way.
6. **Baseline preview verification (HUMAN GATE)** — after fixes 1-5 ship to Vercel preview with filter STILL HIDDEN, user verifies on macOS Safari + Firefox: page renders, sort header click does not crash the tab. (Sort uses the same `setFilters` write path that filter chips would use — if sort survives chip-click churn, baseline was the issue.)
7. **Filter re-mount** — atomic-fix comment block at `leaderboard-table.tsx` lines ~596-607 is removed; `<LeaderboardFilters>` is mounted at the documented site above the table; `<LeaderboardFilterSheet>` is mounted at the comment site near line ~717. No changes to `applyFilters`, `deriveBounds`, `AllFilters`, or the `useState<AllFilters>` machinery. The `filteredRows.length === 0` early-return branch (lines ~565-589) is left completely untouched (it already mounts both components correctly).
8. **Playwright crash-repro gate** passes on Webkit + Firefox projects (added to `playwright.config.ts`): test opens a filter dropdown, clicks a chip 20× rapidly, asserts no console errors, no page exceptions, document still interactive, `aria-pressed` cycles correctly, row count matches expected filter outcome, DOM node count for the filter subtree within ±2 of baseline.
9. **Final preview verification (HUMAN GATE)** — after re-mount + Playwright pass, second Vercel preview; user verifies on real macOS Safari + Firefox that filter chip click stays responsive, first click registers, sustained clicking does not crash the tab.
10. No regressions: sticky cells stay removed, drop-shadow on LogoTile stays removed, placeholder PNG stays as CSS-color tile. `pnpm tsc --noEmit` and `pnpm lint` pass after every plan.
11. **NO dropdown rebuild this phase.** The original `<FilterDropdown>` rebuild plan is deferred — only resurrected if Plan 5 finds the chip click still crashes after the baseline fixes are confirmed working in Plan 2.

**UI hint:** no — this phase changes runtime characteristics (memoization, conditional rendering, CSS removal) without changing visual design. Existing `LeaderboardFilters` chip-bar is restored as-is. Footer hover-gate is invisible to the eye (the `opacity:0` glitchLayers were never visible at idle anyway). Table `min-width` change may visually reduce horizontal scroll on narrow viewports — verify by inspection.

**Out of scope (explicitly):**
- Rebuilding the dropdown layer / `<FilterDropdown>` primitive / rewriting `LeaderboardFilters` chip-bar (deferred — see plan 11)
- Rewriting `applyFilters` / `deriveBounds` / `AllFilters` state machine
- Reintroducing URL state for filters (still forbidden — debug artifact constraint)
- Replacing the placeholder product cell
- Reintroducing sticky cells in the table or `filter: drop-shadow` on always-mounted shell elements
- Removing the `<Toaster>` (sonner), `<CartDrawer>`, `<FloatingCartButton>`, `<TooltipProvider>` — these are persistent shell elements that may add baseline cost but are out of scope; only address if Plan 5 still crashes after the targeted fixes
- Replacing Base UI `Slider` in `PriceFilterPopover` — defer; minor compared to the HIGH suspects
- Touching `/tech/about`, `/tech/reviews`, hero rollout, methodology editorial (Phase 29.2 territory)
- Studios-side pages, auth, payment, beats

**Plans:** 4/5 plans executed

Plans:
- [x] 29.3-01-PLAN.md — GPU baseline + render-cycle fixes (5 tasks: Footer hover-gate, AudioPlayerProvider value memo, WidgetNowPlaying canvas conditional, columns useMemo deps cleanup, table min-width reduction)
- [x] 29.3-02-PLAN.md — Vercel preview deploy + macOS BASELINE verification (HUMAN GATE — filter still hidden; user verifies sort header click does not crash tab on real Safari + Firefox; if it crashes, STOP for more investigation; if it works, proceed to Plan 03)
- [x] 29.3-03-PLAN.md — Re-mount `<LeaderboardFilters>` and `<LeaderboardFilterSheet>` in `leaderboard-table.tsx`; remove atomic-fix comment block; leave `filteredRows.length === 0` branch untouched; no changes to filter logic
- [x] 29.3-04-PLAN.md — Playwright crash-repro test on Webkit + Firefox (adds projects to `playwright.config.ts` if missing); 20× rapid chip clicks; locator-based panel-close gate; DOM node delta within ±2
- [ ] 29.3-05-PLAN.md — Vercel preview deploy + macOS FINAL verification (HUMAN GATE — chip click on real Safari + Firefox); phase does not close until user posts pass

**Wave layout:** Sequential only — waves 1-5. Plan 02 is a checkpoint plan (human gate) gating the remaining work; if user reports chip-equivalent (sort) still crashes, the phase pauses for investigation and Plans 03-05 do not start. Plan 05 is the final human gate; phase does not mark complete until user confirms macOS chip click works.

---

#### Phase 30: Per-Benchmark Pages

**Goal:** Surface every benchmark we run as its own browsable page. Ship a `/tech/benchmarks` landing that lists all 43 tests in `RUBRIC_V1_1` (grouped by discipline) and a per-benchmark detail route `/tech/benchmarks/[slug]` that shows what the benchmark measures, why it matters in the BPR/GlitchMark methodology, and a cross-category leaderboard of every reviewed product's score for that specific test (highest-first by direction). Replaces the current honest-empty-state stub on `/tech/benchmarks`. Sequential execution, Playwright verification per plan.

**Depends on:**
- Phase 17 (BPR Medal UI + Methodology Page) — `RUBRIC_V1_1` constant in `src/lib/tech/rubric-map.ts` (43 tests with discipline / tool / field / name / unit / mode / direction / baseline metadata) is the authoritative test catalog
- Phase 28 (GlitchMark system) — `tech_benchmark_tests` schema with `reference_score`, `tech_benchmark_runs` table holding per-product scores
- Phase 29 (Master Leaderboard) — `src/lib/tech/leaderboard.ts` query patterns (Drizzle joins, sort/filter shape, BPR + GlitchMark surfacing) reusable for cross-category leaderboards
- Phase 29.1 (Master Leaderboard Polish) — `<TechHero>` component, sidebar nav, methodology hub anchors at `/tech/about#methodology`
- Phase 29.2 (Site-Wide Hero Rollout) — `<TechHero>` already mounted on `/tech/benchmarks` (cyan, "Read methodology" → `/tech/about#methodology`); the empty-state body section below it is what this phase replaces

**Requirements:** TBD (no formal REQ-IDs allocated — CONTEXT.md gathered in `/gsd:discuss-phase 30` will be the requirement set; success criteria below define the must-haves)

**Canonical refs:**
- `src/lib/tech/rubric-map.ts` — `RUBRIC_V1_1` (43 RubricTestSpec entries keyed `<discipline>:<tool>:<field>`); `BenchmarkDiscipline`, `BenchmarkMode`, `BenchmarkDirection` types
- `src/lib/tech/leaderboard.ts` — query patterns, `direction` handling, sort helpers
- `src/lib/tech/queries.ts` — `getBenchmarkRunsForProducts` (Phase 27/28 cross-product fetch shape) — `references/ui-brand.md` (hover-only RGB-split, GlitchTech spelling, sidebar-no-scroll, no auto animations on h1)
- `.planning/phases/29.2-site-wide-hero-rollout/29.2-CONTEXT.md` — TechHero usage pattern + copywriting cadence on /tech/* surfaces
- `src/app/(tech)/tech/benchmarks/page.tsx` — current landing page (TechHero + empty-state); this phase replaces the empty-state body

**Success Criteria** (what must be TRUE):
1. `/tech/benchmarks` lists all 43 tests from `RUBRIC_V1_1`, grouped by discipline (13 sections), with each test linking to its detail page. Empty-state stub is removed.
2. Each test has a stable URL slug derived from its rubric key (e.g., `cpu:geekbench6:multi` → `/tech/benchmarks/cpu-geekbench6-multi`). Slug strategy is decided in `discuss-phase` and locked in `CONTEXT.md`.
3. `/tech/benchmarks/[slug]` renders a detail page with: TechHero (size + tone TBD in discuss), test metadata (discipline, tool, field, unit, direction, mode, baseline), a "what this measures" block sourced from rubric metadata or a content layer (TBD), a "why it matters" block tying the test to BPR / GlitchMark methodology with a methodology link, and a cross-category leaderboard of every reviewed product's score for this test (highest-first or lowest-first per `direction`), tied or "not measured" rows handled deterministically.
4. Leaderboard rows display product name + category + score + unit + the relative score vs. the baseline (so a "Geekbench 6 Multi-Core" row reading 21,234 also shows "+47% vs baseline" or similar) — exact formula locked in CONTEXT.md.
5. Empty-state behavior: when no products have a score for the test, the leaderboard renders an honest "No measurements yet" panel (no fake rows). When `RUBRIC_V1_1` is queried but no matching `tech_benchmark_tests` row exists, the page returns 404, not a blank panel.
6. SSG strategy: detail pages prerender at build via `generateStaticParams` driven by `RUBRIC_V1_1` keys (43 known slugs); landing page is `force-static` with `revalidate = 60` matching other `/tech/*` surfaces. New benchmarks added to `RUBRIC_V1_1` get pages on next build.
7. Cross-link: methodology page (`/tech/about#disciplines`) links each discipline name to its filtered subset of `/tech/benchmarks` (or directly to the disciplines section). Leaderboard rows on per-benchmark page link to the product's review page (`/tech/reviews/[slug]`).
8. Sequential plan execution; each plan ships a Playwright spec; `pnpm tsc --noEmit` and `pnpm lint` pass clean after each plan; final `pnpm build` exits 0.
9. Brand spelling is GlitchTech everywhere new copy is added (no GlitchTek typos).
10. Sidebar continues to fit one screen without scroll.

**UI hint:** yes — every plan in this phase touches public visual surfaces (landing list page, detail page hero + leaderboard table). UI-SPEC.md (`30-UI-SPEC.md`) should be generated via `/gsd:ui-phase 30` before planning if the discuss-phase decisions warrant it.

**Out of scope (explicitly):**
- Adding new benchmarks to `RUBRIC_V1_1` (data-layer change — separate phase)
- Editing `tech_benchmark_tests` schema (Phase 28 territory; this phase is read-only on data)
- BPR or GlitchMark formula changes
- Per-product benchmark detail pages (a product's full benchmark suite already surfaces on its review page)
- Cross-benchmark normalization or aggregate scoring beyond what BPR/GlitchMark already do (separate research phase if pursued)
- Admin tooling for benchmark editing
- Search/filter on the landing page beyond discipline grouping (defer to a later polish phase if needed)
- Real content writing for "what this measures" / "why it matters" beyond minimal placeholder copy (full editorial pass is a separate content phase)

**Plans:** 5/5 plans complete

- [x] 30-01-slug-data-layer-PLAN.md — Slug helpers (slugFromRubricKey/rubricKeyFromSlug/getAllBenchmarkSlugs) + getLeaderboardForBenchmark server query + vitest + Playwright spec
- [x] 30-02-landing-page-rebuild-PLAN.md — Replace /tech/benchmarks empty-state with 13 discipline sections + 43 tile index + jump-nav + Playwright spec
- [x] 30-03-detail-page-route-PLAN.md — Create /tech/benchmarks/[slug]/page.tsx (TechHero + metadata chips + what-this-measures + sortable leaderboard table OR empty-state) + generateStaticParams for 43 slugs + Playwright spec
- [x] 30-04-cross-links-PLAN.md — Wire MethodologyDisciplineCards discipline tiles to /tech/benchmarks#discipline-{slug}; verify all Phase 30 cross-links resolve via Playwright
- [x] 30-05-final-pass-PLAN.md — pnpm build clean (43 prerendered detail pages); GlitchTek typo sweep returns zero; sidebar one-screen verification on landing + detail; full Phase 30 spec batch passes against built artifact

---

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
| 26. Brand-Aware Auth UI Redesign | v4.0 | 12/12 | Complete    | 2026-04-25 |
| 27. Media/Video Strategy Foundation | v4.0 | 7/7 | Complete    | 2026-04-25 |
| 28. GlitchMark System | v4.0 | 4/4 | Complete    | 2026-04-25 |
| 29. Master Leaderboard | v4.0 | 0/tbd | Complete    | 2026-04-25 |
| 30. Per-Benchmark Pages | v4.0 | 5/5 | Complete    | 2026-04-28 |
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
