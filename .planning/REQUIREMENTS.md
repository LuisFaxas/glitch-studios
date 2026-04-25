# Requirements — v4.0 Production Launch

**Milestone goal:** Get the site to production — polished, performant, content-complete, credible. Visual audit drives direction; GlitchMark ships as a new scoring system distinct from BPR; remaining v3.0 launch work completes. Every surface held to a launchable standard.

**Process note:** This requirements list is **seed-only**. Concrete per-page requirements (POLISH-*) are populated from Phase 22's visual audit. REQ-IDs get allocated as the audit captures issues.

---

## v4.0 Requirements (Active)

### Audit & Discovery (AUDIT-*)

- [ ] **AUDIT-01** Phase 22 produces a populated `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` with user feedback on every public route, admin surface, global component, and cross-page flow; each item tagged `[BLOCK]`, `[POLISH]`, `[BACKLOG]`, or `[OK]`.
- [ ] **AUDIT-02** Phase 22 output triages every v3.0 carry-over item — each pending phase/backlog entry assigned to `[IN v4.0]`, `[BACKLOG]`, or `[DROP]` with rationale.
- [ ] **AUDIT-03** GlitchMark design decisions captured in audit Section I — formula, scope (per-device/category), relationship to BPR, UI surfaces, methodology transparency, versioning strategy.
- [ ] **AUDIT-04** Post-audit, ROADMAP.md phases 23+ are derived from audit findings and re-presented to user for approval before execution starts.

### Email Delivery (EMAIL-*) — Launch Blocker

- [ ] **EMAIL-01** Resend SDK integrated and sending mail end-to-end from Server Actions.
- [ ] **EMAIL-02** React Email templates for: account verification, password reset, booking confirmation, booking modification/cancellation, order receipt (beat/bundle purchase), contact form auto-reply, newsletter broadcast.
- [ ] **EMAIL-03** Password reset flow functional end-to-end (user enters email → receives link → resets password → can log in).
- [ ] **EMAIL-04** Booking confirmation fires on successful deposit; includes booking ID, service, date/time, deposit amount, cancellation policy.
- [ ] **EMAIL-05** Order receipt fires on Stripe success webhook; includes items, license tier per beat, total, download links.
- [ ] **EMAIL-06** Newsletter compose + send from `/admin/newsletter/compose` delivers to active subscribers; unsubscribe link honors token.
- [ ] **EMAIL-07** Admin inbox triggers notification email to a configured admin address when a new contact submission arrives.
- [ ] **EMAIL-08** Email deliverability baseline — SPF/DKIM/DMARC records documented in deploy hardening; Resend domain verified.

### Performance (PERF-*) — Launch Blocker

- [ ] **PERF-01** Admin Studios ⇄ Tech context switcher completes in < 500 ms (currently 3–4 s).
- [ ] **PERF-02** Admin edit-page → ingest-wizard navigation completes in < 500 ms (currently ~4 s).
- [ ] **PERF-03** Public route cold-nav p95 < 1.5 s TTFB on Vercel.
- [ ] **PERF-04** Mobile LCP on `/` and `/tech` < 2.5 s on mid-tier device.
- [ ] **PERF-05** Image pipeline audit — every `<img>` uses `<Image>` with correct `sizes`; no 2 MB hero art served unoptimized.
- [ ] **PERF-06** Bundle audit — identify + remove any client-only bundles > 200 KB gzipped that aren't route-critical.
- [ ] **PERF-07** Database query audit for the 5 slowest pages; add indexes or rework queries.

### Auth UI Redesign (AUTH-*) — Phase 26

- [x] **AUTH-01** All five auth surfaces (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`) render distinct Studios vs GlitchTech theming based on host (logo, palette accent hook, typography, hero treatment, copy variants from UI-SPEC).
- [x] **AUTH-02** Desktop split-layout (form column right, brand-side panel left, ≥1024px) + mobile stacked layout (compact brand header + form, <1024px) ship per UI-SPEC §Spacing/§Breakpoints.
- [x] **AUTH-03** `/login` surface rebuilt: social row above email, enumeration-safe error copy (wrong-password and unknown-email both "That email and password don't match"), branded.
- [x] **AUTH-04** Customer register wizard at `/register?role=customer` — 3 steps (identity → preferences → confirm). Step indicator sticky. Back button on steps 2-3. `?step=1|2|3` query param for deep-link + browser-back.
- [x] **AUTH-05** Account creation is atomic at step 3 submit. Steps 1-2 hold data in client state only. Verification email fires at step 3. T&Cs checkbox on step 3.
- [x] **AUTH-06** Step 1 → Step 2 transition pre-validates email uniqueness via server action. Enumeration-safe inline error copy on collision.
- [x] **AUTH-07** Step 2 (Preferences) holds only the newsletter opt-in checkbox.
- [x] **AUTH-08** Step 3 (Confirm) shows captured email + name read-only, T&Cs checkbox required, "Create account" CTA.
- [x] **AUTH-09** Drop the existing confirm-password field from `/register`. Use `<PasswordField>` show/hide toggle.
- [x] **AUTH-10** `/register` (no role param) shows two CTA tiles side-by-side on desktop, stacked on mobile: customer / artist (Studios) or customer / contributor (Tech).
- [x] **AUTH-11** `/register?role=artist` renders `<ArtistRequestForm>` — single page, on-page success state.
- [x] **AUTH-12** New Drizzle table `artistApplication` (uuid pk, brand, name, email, bio, portfolioUrl, focusTags jsonb, status enum, submittedAt, reviewedAt, reviewedBy fk, reviewerNote).
- [x] **AUTH-13** Artist request form: same shape both brands; brand auto-set from host. Studios = genre tags; Tech = focus areas. Stored in `focusTags` jsonb.
- [x] **AUTH-14** New admin page `/admin/applications` with list + detail drawer + Approve / Reject / Request more info actions.
- [x] **AUTH-15** Approve flow: creates `user` row (`emailVerified=true`, role 'artist' or 'contributor'), sets application status='approved', triggers Better Auth password-reset-style invite email.
- [x] **AUTH-16** Reject flow: silent (no applicant email). Reviewer note is internal-only.
- [x] **AUTH-17** Request-more-info flow: status='info_requested', sends admin-composed email via Resend; status returns to 'pending' on applicant reply (manual triage).
- [x] **AUTH-18** New admin notification email on every artist-application submission (`ADMIN_NOTIFICATION_EMAIL` env, fallback to studio inbox).
- [x] **AUTH-19** New email template `artist-approval-invite.tsx` under `src/lib/email/` reusing Phase 24 layout.
- [x] **AUTH-20** Social login row: 3 OAuth buttons (Google / Meta / GitHub) above email/password on `/login` and `/register?role=customer`.
- [x] **AUTH-21** Google live end-to-end on both brand hosts at v4.0 launch. Meta + GitHub plugins wired in code; buttons hide entirely if env vars missing.
- [x] **AUTH-22** Better Auth `socialProviders` block in `src/lib/auth.ts`. Callback `/api/auth/callback/{provider}`. Env: `GOOGLE_CLIENT_ID/SECRET`, `META_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`.
- [x] **AUTH-23** `accountLinking.enabled: false` for v4.0. Conflict copy directs user to existing-method sign-in.
- [x] **AUTH-24** Social-signup T&Cs: inline microcopy "By continuing, you agree to the Terms and Privacy Policy." Newsletter defaults FALSE for OAuth signups.
- [x] **AUTH-25** New SVGs `GoogleIcon`, `MetaIcon`, `GitHubIcon` in `src/components/icons/social-icons.tsx`.
- [x] **AUTH-26** Email-verification soft gate at the layout level. Authenticated unverified users redirected from any page EXCEPT `/verify-email`, `/api/auth/*`, sign-out.
- [x] **AUTH-27** `/verify-email` route: pending / success / expired states resolved server-side by token validity. All states share AuthShell.
- [x] **AUTH-28** Grandfather migration: one-shot SQL update sets `user.emailVerified = true` for users created BEFORE Phase 26 deploy. Drizzle migration with re-run guard.
- [x] **AUTH-29** Branded `forgot-password` + `reset-password` end-to-end pass. Phase 24 template reused.
- [x] **AUTH-30** `src/app/(auth)/layout.tsx` becomes server component reading `host` from `next/headers` and rendering `<div data-brand={brand}>`. Default 'studios' for unknown hosts. Mirrors middleware fall-through.
- [x] **AUTH-31** All page H1s wrap `<HoverGlitchHeading>`. Hover-only; never auto-runs. Reduced-motion honored.
- [x] **AUTH-32** `pnpm tsc --noEmit` and `pnpm lint` pass. Manual Playwright pass: both brand hosts × 5 auth surfaces × Google end-to-end.

### GlitchMark (GLITCHMARK-*) — New Feature

- [ ] **GLITCHMARK-01** Formula locked — exact math for combining all benchmark scores into a single GlitchMark number. Decision captured in a phase CONTEXT doc. Likely: normalized per benchmark (z-score or range-scale) → geometric mean across all measured tests. TBD in phase discussion.
- [ ] **GLITCHMARK-02** Schema additions — likely one numeric column on `tech_reviews` (`glitchmark_score`) or a dedicated `tech_glitchmark_scores` table if per-category scoring matters. Decision inside phase.
- [ ] **GLITCHMARK-03** GlitchMark computed on ingest commit — same transaction as BPR recompute; result stored on the review row.
- [ ] **GLITCHMARK-04** GlitchMark surfaces on master leaderboard as its own sortable column.
- [ ] **GLITCHMARK-05** GlitchMark surfaces on review detail card alongside BPR medal (both, not replace).
- [ ] **GLITCHMARK-06** Methodology transparency — GlitchMark section on `/tech/methodology` page or dedicated `/tech/glitchmark` page explaining the formula.
- [ ] **GLITCHMARK-07** Versioning — GlitchMark v1 locked; future versions preserve historical scores per review.
- [ ] **GLITCHMARK-08** Relationship to BPR is DOCUMENTED — BPR = editorial rubric quality grade; GlitchMark = raw aggregate score. Different purposes, both visible.

### Carry-over from v3.0 — Category Leaderboards (RANK-*)

*Status: carried over from v3.0 unchanged; execution re-planned inside v4.0.*

- [ ] **RANK-01** `/tech/categories/[slug]/rankings` route — server-rendered table, one row per published review; columns: rank, product name, BPR medal, BPR score, GlitchMark, key benchmarks, year, price. Default sort: GlitchMark descending (CHANGED — was BPR descending; audit may revise).
- [ ] **RANK-02** Sort on every column — `nuqs` URL state.
- [ ] **RANK-03** Filter sidebar — price, year, CPU kind, RAM, storage, medal tier; mobile `Sheet`.
- [ ] **RANK-04** "Not tested" cells render `—` with tooltip (from `tech_review_discipline_exclusions`).
- [ ] **RANK-05** Mobile `< 768px` card layout.
- [ ] **RANK-06** Empty state with methodology CTA.
- [ ] **RANK-07** Column header → methodology anchor in new tab.

### Carry-over from v3.0 — Flagship Review (FLAG-*)

- [ ] **FLAG-01** `mbp-16-m5max-64gb` product record with complete spec sheet.
- [ ] **FLAG-02** All 13 disciplines ingested or legitimately excluded; 7 BPR-eligible captured AC + Battery.
- [ ] **FLAG-03** Review article published — verdict, body, pros/cons, rating, gallery, video, rubric badge, BPR medal, GlitchMark score.
- [ ] **FLAG-04** Appears on detail, list, rankings, homepage carousel, compare picker.

### Carry-over from v3.0 — GlitchTek Blog (BLOG-*)

- [ ] **BLOG-01** `brand` column on `blog_posts`; `UNIQUE(slug, brand)` on `blog_categories`.
- [ ] **BLOG-02** Studios blog unaffected (every query adds `WHERE brand = 'studios'`).
- [ ] **BLOG-03** `/tech/blog` mirrors Studios blog routes.
- [ ] **BLOG-04** Admin brand selector auto-picks current brand context.
- [ ] **BLOG-05** Components shared, no fork.

### Trailer Video Surface (VIDEO-*) — Carry-over from v3.0 17.5

- [ ] **VIDEO-01** Two existing trailer videos surfaced on a public-facing page. Location + treatment determined in audit (homepage hero rotator? dedicated `/trailers`? integrated into reviews?).
- [ ] **VIDEO-02** Video player component handles both trailers with consistent UX.

### Production Hardening (DEPLOY-*) — Carry-over + Enhanced

- [ ] **DEPLOY-01** `glitchtech.io` custom domain on Vercel, Cloudflare DNS, 301 from www to apex.
- [ ] **DEPLOY-02** Per-brand sitemap.xml — Studios sitemap / Tech sitemap; `robots.txt` disallows admin/dashboard/auth on both.
- [ ] **DEPLOY-03** OG tags per brand — `og:site_name`, `og:image`, `twitter:card` all brand-specific.
- [ ] **DEPLOY-04** `/tech` serves at `glitchtech.io` root in production (middleware rewrite verified in prod).
- [ ] **DEPLOY-05** UAT admin cleanup — `uat-admin@glitchstudios.local` deleted or rotated to real owner before prod deploy.
- [ ] **DEPLOY-06** Production env audit — Resend keys, Neon prod DB URL, Stripe live keys, Better Auth secret, Uploadthing token all present in Vercel project env.
- [ ] **DEPLOY-07** Error tracking wired (Sentry or equivalent) to capture production exceptions.
- [ ] **DEPLOY-08** Basic analytics (Vercel Analytics or alternative) — page views per brand.
- [ ] **DEPLOY-09** Backup verification — Neon auto-backup retention confirmed; admin content export path exists.

### Per-page polish (POLISH-*)

*Populated from Phase 22 visual audit output. REQ-IDs allocated as issues are captured.*

- [ ] **POLISH-00** Placeholder — specific items TBD from audit. Examples expected from memory: homepage 4/10 (density/CTAs/tags), beats 4/10 (search UX), services 6/10 (admin verification), booking 5/10 (flow clarity), contact 4/10 (channels beyond email), social icons (platform icons instead of current), credential flow (admin vs client sign-in clarity).

---

## v4.0 Out of Scope (Unless Audit Promotes)

- Real-time chat/messaging
- Mobile app
- Streaming/subscription model
- Multi-language support
- Programmatic CLI for AI content workflow (999.6) — post-launch investment
- Audio continuity across brand domains — requires collapsing origins; future infra milestone
- Harness v1.2 (Mac pack stays at v1.1)
- Affiliate links in tables
- Paywalled scores

---

## Launch Readiness Checklist

- [ ] Phase 22 audit complete; user signed off on phase structure
- [ ] All EMAIL-* green — password reset verified in staging
- [ ] All PERF-* green — admin switcher < 500 ms confirmed
- [ ] GlitchMark formula locked in a phase CONTEXT doc; methodology page updated
- [ ] GlitchMark + BPR medal both surface on flagship review detail
- [ ] Master leaderboard live with at least one real published review (MBP)
- [ ] UAT admin account deleted
- [ ] glitchtech.io resolves with valid cert
- [ ] Per-brand sitemaps + OG tags verified
- [ ] Playwright smoke covering major v4.0 routes

---

## Traceability

*Phases 23-46 derived from Phase 22 audit output (committed 2026-04-24).*

| REQ-ID | Category | Phase |
|--------|----------|-------|
| AUDIT-01 through AUDIT-04 | Audit | **22** (complete) |
| EMAIL-01 through EMAIL-08 | Email | **24** |
| PERF-01 through PERF-07 | Performance | **25** |
| AUTH-01 through AUTH-32 | Auth UI | **26** |
| (media foundation, no REQ-IDs yet — derived from pivots #2, #9) | Media/Video | **27** |
| GLITCHMARK-01 through GLITCHMARK-08 | GlitchMark | **28** |
| RANK-01 through RANK-07 | Leaderboard | **29** |
| (per-benchmark pages, no REQ-IDs yet — derived from B.9 IA) | Per-benchmark lens | **30** |
| (category editorial reframe, no REQ-IDs yet — derived from B.5) | Category editorial | **31** |
| (artist platform, no REQ-IDs yet — derived from pivot #10 Wave 1) | Artist BETA | **32** |
| (licensing model, no REQ-IDs yet — derived from pivot #7) | Licensing | **33** |
| (custom beats + services, no REQ-IDs yet — derived from pivots #1, #8) | Custom Beats + Services | **34** |
| BLOG-01 through BLOG-05 | Blog | **35** |
| FLAG-01 through FLAG-04 | Flagship review | **36** |
| VIDEO-01 through VIDEO-02 | Trailer videos | **36** (bundled with flagship) |
| (mobile-native sweep, no REQ-IDs yet — derived from pivots #12, #22) | Mobile native feel | **37** |
| (GlitchTech polish, no REQ-IDs yet — derived from pivots #13, #15, #16) | GlitchTech polish | **38** |
| (admin list pattern, no REQ-IDs yet — derived from pivot #21) | Admin list pattern | **39** |
| POLISH-* | Public per-page polish | **40** |
| (affiliate marketing, no REQ-IDs yet — derived from pivot #14) | Affiliate marketing | **41** |
| (AI agents discovery, no REQ-IDs yet — derived from pivot #19) | AI agents discovery | **42** |
| (AI agents impl + newsletter automation, no REQ-IDs yet — pivots #19, #24) | AI agents impl | **43** |
| (Glitchy mascot, no REQ-IDs yet — derived from pivot #25) | Glitchy 3D mascot | **44** |
| (SEO infrastructure, no REQ-IDs yet — derived from pivot #17) | SEO | **45** |
| DEPLOY-01 through DEPLOY-09 | Deploy hardening | **46** |

**Note:** Phase-specific REQ-IDs (auth, media, artist, licensing, custom-beats, mobile, polish, admin, affiliate, AI, Glitchy, SEO) get generated during each phase's `/gsd:discuss-phase` step before planning. The seeded requirements above (EMAIL, PERF, GLITCHMARK, RANK, FLAG, BLOG, VIDEO, POLISH, DEPLOY) were already defined when v4.0 milestone was initialized.

---

## v3.0 Validated (Reference — Shipped 2026-04-24)

### Methodology & Schema (METH-*) ✓

- [x] **METH-01** Rubric v1.1 seeded (43 entries, 13 disciplines). Shipped Phase 15.
- [x] **METH-02** Schema additions — new enums, columns on benchmark_tests / benchmark_runs / reviews, exclusions table, UNIQUE constraint. Shipped Phase 15.
- [x] **METH-03** BPR formula locked — geometric mean battery/AC across 7 eligible disciplines. Shipped Phase 15.
- [x] **METH-04** Medal thresholds — Platinum ≥ 90, Gold ≥ 80, Silver ≥ 70, Bronze ≥ 60. Shipped Phase 15.
- [x] **METH-05** `/tech/methodology` page live. Shipped Phase 17.
- [x] **METH-06** Rubric version badge on reviews. Shipped Phase 17.
- [x] **METH-07** Pre-ingest query refactors (DISTINCT ON, id-lookup). Shipped Phase 15.

### Ingest Pipeline (ING-*) ✓

- [x] **ING-01** Admin JSONL upload wizard with dry-run + commit. Shipped Phase 16.
- [x] **ING-02** Zod validation per line; malformed blocks upload. Shipped Phase 16.
- [x] **ING-03** Source attribution — ambient temp, macOS build, run_uuid. Shipped Phase 16.
- [x] **ING-04** Duplicate handling — supersede + history. Shipped Phase 16.
- [x] **ING-05** Rubric map translation. Shipped Phase 15.
- [x] **ING-06** BPR recompute on commit + revalidate. Shipped Phase 16.

### BPR Medal UI (MEDAL-*) ✓

- [x] **MEDAL-01** `<BPRMedal>` component — monochrome tier palette. Shipped Phase 17.
- [x] **MEDAL-02** Medal surfaces — review detail, review cards, homepage spotlight (all 4 surfaces via Plans 17-01/02/03/04). Shipped Phase 17.
- [x] **MEDAL-03** "Not enough data" placeholder. Shipped Phase 17.

---

*Last updated: 2026-04-24 — v4.0 Production Launch milestone seeded. Concrete requirements land after Phase 22 visual audit runs.*
