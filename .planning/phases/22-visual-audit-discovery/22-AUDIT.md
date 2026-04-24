# v4.0 Production Launch — Pre-Milestone Audit

**Purpose:** Extract everything from your head, mark every broken/weak/missing thing across the site, decide GlitchMark, and triage every v3.0 carry-over. Output of this doc becomes the v4.0 milestone scope.

**Status tracker:**

| Section | Status | Your last entry |
|---|---|---|
| A. Public Studios pages | 🟡 in-progress (A.1-A.3 done 2026-04-24) | A.3 license modal audited on prod |
| B. Public GlitchTech pages | ⬜ pending | — |
| C. Auth + client dashboard | ⬜ pending | — |
| D. Admin dashboard | ⬜ pending | — |
| E. Global components | ⬜ pending | — |
| F. Cross-page flows | ⬜ pending | — |
| G. Edge cases | ⬜ pending | — |
| H. v3.0 carry-over triage | ⬜ pending | — |
| I. GlitchMark design | ⬜ pending | — |
| J. Brain dump (catch-all) | ⬜ pending | — |

**How to use this doc:**

1. Open the site in your browser: **http://localhost:3004**
2. Work through any section in any order — skip what's fine, go deep on what's bad
3. Write feedback **inline under the `> FEEDBACK:` markers** — bullets, rants, URLs, screenshots paths, whatever
4. Tag severity with **`[BLOCK]`** (blocks launch), **`[POLISH]`** (launch-nice-to-have), **`[BACKLOG]`** (post-launch), **`[OK]`** (fine as-is)
5. When a section is done, change `⬜` → `✅` in the tracker above
6. When you want me to process a section (turn it into requirements), ping me. I'll read, group, and draft. You approve before anything lands in REQUIREMENTS.md.
7. **You don't have to finish in one sitting.** This doc is async-safe.

**Rules:**
- No judgment. If something's a 2/10, say so.
- "I don't know" is a valid answer — we'll probe it.
- Contradictions are fine — we'll resolve at requirements stage.
- If you hate a whole section and want to scrap it, tag `[SCRAP]`.

---

# SECTION A — Public Studios Pages

One-by-one walk the public Studios site. URL base: `http://localhost:3004`.

## A.1 Homepage — `/`

**What's there today:** Featured beats, services hero, latest blog post, newsletter signup, cross-link to GlitchTech, splash overlay on first visit.
**Memory note:** You rated this 4/10 on 2026-03-28 — "mess, unusable, tags everywhere."
**Known issues:** Glitch logo clipping at 13" (Phase 16.1 flagged).

**Look for:** hero impact, info density, CTA clarity, tag/chip visual noise, scroll flow, splash experience, mobile header, brand voice, how it feels compared to "red raw handmade" target.

**Edge-case prompts I'll ask:**
- Splash: should it fire every visit or once/session? (Phase 16.1 set to once/session/brand — still right?)
- First-time visitor vs returning: do they see different content?
- Logged-in clients: do they see their dashboard CTAs, or is this page the same for everyone?
- What happens if featured beats = 0? What about latest blog post = 0?
- Mobile: does the home feel like a different product, or the same?

**Audited:** 2026-04-24 on production `https://glitchstudios.io`

### Desktop

- **Hero section** — looks really good overall `[OK]`
- **Splash intro animation** — fires correctly, looks good on both desktop and mobile `[OK]`
- **Scroll-down arrow indicator** — not interactive. Should be clickable to scroll to the next section. `[POLISH]`
- **"What We Do" section** — too basic, doesn't scream Glitch Studios. Tiles are bare. With 5 items they stack weirdly and leave empty space. Needs richer treatment (images, polish, real information). Deserves its own discuss phase rather than a cosmetic tweak. `[POLISH — own phase]`
- **"Our Work" carousel** — simple video carousel; no videos uploaded yet. Unclear what the functionality ultimately is. `[CONTENT + design TBD]`
- **CTA to GlitchTech cross-link section** — missing an image `[POLISH]`
- **"What They Say" (testimonials)** — only placeholder reviews exist, no real ones. Not sure if good enough for now. `[CONTENT + design TBD]`

### Mobile

- **Logo + title area vs hero buttons** — logo + title feel too small compared to the Book Session / Beats / Portfolio buttons, creating a proportion/hierarchy inconsistency. Fix by either enlarging titles or shrinking the buttons. `[POLISH]`
- **Scroll-down arrow** — same issue as desktop, needs to be tappable `[POLISH]` (pairs with desktop item)
- **"Introduction to GlitchTech" section** — looks vertically stretched on mobile, doesn't fit the viewport well. Small reposition/redesign for mobile. `[POLISH]`
- **Everything else** — looks great overall `[OK]`

### Strategic pivots surfaced here (affect scope beyond A.1)

> These are MILESTONE-level strategic shifts, not A.1 cosmetic fixes. Captured here because they surfaced during homepage audit; will re-surface in Section J and drive their own phase(s).

1. **PIVOT: Custom Beats replaces Studio Sessions (for now)**
   No physical studio yet → "Book a Session" CTA is effectively dead today. User wants the primary hero CTA to be "Custom Beat" instead, with a custom-beat request/booking flow as a real feature. Studio session stays in the codebase for later (will come back when physical studio exists). Affects: hero CTAs, `/services`, `/book`, entirely new custom-beat request surface. `[IN v4.0 — deserves its own phase / set of phases]`

2. **PIVOT: YouTube as primary video host**
   Discovery + virality beats self-hosting. Every video ("Our Work", trailers, artist content) should live on YouTube as a single canonical video with all the views, and surfaces on the site just embed it. Affects: Our Work carousel, trailer video surface (17.5 carry-over), any future video surface. `[IN v4.0 — content architecture decision]`

3. **CONTENT: Trap Snyder video**
   User has an artist video (Trap Snyder making a beat) that should replace placeholders in Our Work + Portfolio. Content swap, not a code change. `[CONTENT — drops in once YouTube-host pattern is decided]`

---

## A.2 Beats catalog — `/beats`

**What's there today:** Filterable grid — genre/BPM/key/mood/search, hero carousel with bundles, list/card view toggle, license modal on click, add to cart, waveform preview (stub peaks — real R2 audio not wired).
**Memory note:** 4/10 — "search all over the place, not industry-leading."
**Known stubs:** Waveform peaks are dummy data (`src/db/seed-beat.ts:19` — R2 not configured).

**Look for:** search placement/behavior, filter bar density, card hierarchy, license modal clarity, price display, hover states, play/pause behavior, what happens with 0 beats, what happens with 500 beats.

**Edge-case prompts:**
- Bundle vs single beat purchase: is the distinction clear?
- License tiers: understandable to a first-time buyer?
- Mobile filter UX: Sheet or inline? Feels right?
- Audio play state persistence across pages: working? broken?
- Out-of-stock / unpublished beats: visible in admin, hidden on public?

**Audited:** 2026-04-24 on production `https://glitchstudios.io/beats`

### Performance observation
- **Mobile load time: ~3–4 s.** Too slow; target is sub-2s. Feeds directly into PERF-* launch blocker. `[BLOCK]`
- **Desktop load time: sub-2s.** `[OK]`

### Mobile

- **Hero** — moves smoothly, looks good `[OK]`
- **Search bar** — works `[OK]`
- **View toggle (card/list)** — works `[OK]`
- **Filter scrolling** — works `[OK]`
- **Tap image → beat starts playing** — works, feels cool `[OK]`
- **UX confusion — play vs buy affordance:**
  - Tapping the image plays the beat (good).
  - But there's nothing that tells users how to reach the purchase/license modal. Users have to guess that tapping the **title** opens the license modal — they won't discover this.
  - User's preference: tapping the card/title should open the purchase modal; a separate dedicated control (button/icon) on the card handles play/pause.
  - Don't want to clutter with an obvious indicator; want to preserve the clean look. This is a UX puzzle, not a clear fix. `[POLISH — needs design decision]`
- **Audio scrubbing in-card while playing** — works, user likes it `[OK]`
- **Persistent play bar at bottom — missing "minimize" gesture.**
  - User wants: swipe down to minimize/dismiss, swipe up to restore. Mobile-native affordance.
  - Today: bar is always visible once audio starts. `[POLISH — new gesture]`

### Desktop

- **Load speed** — sub-2s, feels faster than mobile `[OK]`
- **Hover state on card** — shows play button, which is the correct affordance `[OK]` (this is the desktop equivalent of the mobile tap-to-play confusion — desktop does it better)
- **Same play-vs-buy confusion** — no indicator that clicking the title opens the license modal (beyond just playing). Same UX puzzle as mobile. `[POLISH — same decision as mobile]`
- **Beat page (card + play experience) overall** — "gorgeous, I love it" `[OK]`

### New feature idea surfaced here (elevated to Section J)

**FEATURE: "Made by hand" videos on beat detail**
User has been recording artist Trap Snyder making beats in red-raw high quality. Goal: reinforce that beats are made by hand, NOT AI. When a beat has an associated making-of YouTube video, embed it on the beat detail / license modal. Makes the product more real, community-based, desirable. Ties into the YouTube-first pivot from A.1 — one canonical video, embedded on beat page + portfolio. Not all beats will have a video; surface conditionally. `[IN v4.0 — new phase]`

---

## A.3 Beat detail / license modal (surface within /beats)

**What's there today:** Modal triggered from beat card — license tiers with prices + inclusions, audio preview, add to cart.

**Look for:** license-tier explanations, pricing clarity, preview quality, modal dismiss behavior, add-to-cart feedback.

**Audited:** 2026-04-24 on production `https://glitchstudios.io/beats` (license modal)

### Visual / Format

- **Modal formatting** — looks good, understandable structure `[OK]`
- **Tier display** — "MP3 Lite Lease" and "WAV Lease" shown with inclusions `[OK]`

### STRATEGIC: the licensing model itself is unclear — needs its own phase

This is NOT a visual fix. The audit surfaced a fundamental product question that the user doesn't have a locked answer to.

**What's confusing (from user perspective):**

- Two lease tiers (MP3 Lite, WAV) with stream-count limits ("up to 5,000 streams", "up to 10,000 streams")
- **Enforcement question:** "anybody control that?" — the honest answer is no, stream limits are industry-standard honor-system, not technically enforced
- **Comprehension question:** user (the site owner) doesn't fully understand the lease model himself — if HE is confused, consumers will be too
- **Alternative:** "just sell the beat, unlimited" — simpler, less friction, less tier cognitive load

**What this actually needs:**

1. **Research** — current beat-licensing landscape. Industry standard is 4-6 tiers (BeatStars, Airbit, Traktrain patterns): Basic Lease (MP3, limited streams) → Premium Lease (WAV, more streams) → Unlimited Lease → Trackout Lease (stems) → Exclusive Rights. Newer platforms / independent producers are moving toward flat-rate or unlimited-only to reduce purchase friction.
2. **Decision** on GlitchStudios' positioning: tiered (status quo, industry-standard, max revenue per power-user) vs. flat-rate (simpler, higher conversion, smaller ceiling) vs. hybrid (e.g., one "standard" tier + an "exclusive" upgrade). Consider the artist side too — what do YOUR artists want to sell.
3. **Legal/contractual** — actual license terms need a lawyer review or template (BeatStars provides theirs; can be referenced).
4. **Redesign** the modal and the purchase flow around the chosen model. Current tier list + stream-limit language may go away entirely.

**Scope:** The goal per user: "best all-around solution for the artist and the consumer". Needs research, needs discussion, needs redesign. `[IN v4.0 — own phase]` covering: licensing model research → decision → schema adjustments → UI redesign → legal terms update.

### Note for downstream phase

Any current code that enforces stream limits / license-tier gating is now scope-pending. The licensing phase's output determines whether:
- Existing tier-based code stays and gets refined
- Tiers collapse to a single "own the beat" model
- A hybrid model requires schema changes to `licenses` / `beats` / `orders`



---

## A.4 Services list — `/services`

**What's there today:** Services grid — studio sessions, mixing, mastering, video, SFX, graphic design. Per-service preview. Booking-live toggle controls whether "Book now" or "Coming soon" shows.
**Memory note:** 6/10 — "interesting design, need admin control verification."

**Look for:** service copy, pricing display, booking CTA clarity, deliverables list, featured-work previews, per-service hero art.

**Edge-case prompts:**
- Booking-live=false: does every Book CTA reroute? (Phase 9 said yes — verify)
- Logged-in vs guest: same view?
- Price variable-by-engagement services: clear, or confusing?

> FEEDBACK:
> 

---

## A.5 Service detail / booking wizard — `/book`

**What's there today:** Multi-step wizard — service select, date/time, deposit info, contact, terms. Shows "Coming soon" manifesto if `bookingLive=false`.
**Memory note:** 5/10 — "barren, confusing flow, not all services shown."

**Look for:** step count, navigation affordances (back/next), deposit clarity, deposit type display (percent vs fixed), calendar UX, time slot granularity, form validation messages, confirmation state.

**Edge-case prompts:**
- Calendar conflict: two clients try to book the same slot — what happens?
- Deposit fails: Stripe decline, what's the user-facing message?
- Client cancels within cancellation window: full refund? Partial?
- Admin hasn't set availability for a service: does the service show at all?
- Timezone handling: user in LA books Miami studio — whose TZ displays?

> FEEDBACK:
> 

---

## A.6 Portfolio — `/portfolio`

**What's there today:** Full page "Coming soon" placeholder. Detail routes `/portfolio/[slug]` wired but empty.
**Memory note:** 7/10 — "strong animations/filters, detail view confusing" (this was pre-placeholder-pivot).

**Question for you:** Is this surface ever going live in v4.0, or is "coming soon" the intended state forever?

> FEEDBACK:
> 

---

## A.7 Artists / Team — `/artists`

**What's there today:** Full page "Coming soon" placeholder. Phase 12 shipped an internal team + collaborators structure but the public `/artists` is gated.
**Memory note:** "basic — unclear purpose (team vs collaborators vs both?)"

**Question for you:** What IS this surface — team members, collaborators, featured artists you've worked with, or all three?

> FEEDBACK:
> 

---

## A.8 Blog list — `/blog`

**What's there today:** Published posts with category filter, featured post at top, load-more pagination.
**Memory note:** 5/10 — "inconsistent card sizes, no scrolling, barren."

**Look for:** card layout consistency, category filter design, pagination behavior, empty state, featured post treatment.

> FEEDBACK:
> 

---

## A.9 Blog detail — `/blog/[slug]`

**What's there today:** Full article, author, reading time, related posts.

**Look for:** typography, reading rhythm, code/quote blocks, image handling, share buttons (exist?), comments (exist?), author bio, related-posts recommendation logic.

> FEEDBACK:
> 

---

## A.10 Contact — `/contact`

**What's there today:** Contact form — subject dropdown pre-filled with services, message, file upload.
**Memory note:** 4/10 — "too simple, email only, no WhatsApp/phone."

**Look for:** field set, validation, success state, spam defense (captcha? rate limit?), attached-file size limits, where submissions go (admin inbox? email? both?).

**Edge-case prompts:**
- Form submitted but Resend not wired: does the submission save to DB? User sees success?
- Spam volume: is there protection?
- Attachments: file type restrictions?

> FEEDBACK:
> 

---

## A.11 Cart drawer + floating cart button

**What's there today:** Persistent cart (cross-session), slide-out drawer, floating button bottom-corner with item badge.
**Memory note:** "working, looks nice."

**Look for:** empty state, quantity controls, bundle display inside cart, remove-item affordance, subtotal clarity, continue-shopping vs checkout CTAs.

> FEEDBACK:
> 

---

## A.12 Checkout — `/checkout`

**What's there today:** Stripe Embedded Checkout (client-side), totals, guest or logged-in path.

**Look for:** guest checkout clarity, apply-coupon affordance, PayPal path (Stripe supports it — is it visible?), payment-method selection, billing address fields, error states, post-success redirect.

**Edge-case prompts:**
- Guest buys → creates account post-purchase? Or stays guest?
- Failed payment: can user retry without re-entering?
- Stripe webhook never fires: does DB stay in "pending"?
- 0% tax states, international states: handled?

> FEEDBACK:
> 

---

## A.13 Checkout success — `/checkout/success`

**What's there today:** Stripe success redirect, shows order ID, next-steps guidance.

**Look for:** emotional tone (celebration? confirmation? too sterile?), where-to-next CTAs, email-sent indicator.

> FEEDBACK:
> 

---

## A.14 Unsubscribe — `/unsubscribe`

**What's there today:** Email-token unsubscribe, success/error states.

**Look for:** success messaging, re-subscribe affordance, brand tone.

> FEEDBACK:
> 

---

## A.15 Apparel coming-soon — `/apparel-coming-soon`

**What's there today:** Landing with email waitlist, product categories (tees, hoodies, accessories). Not accessible from main nav.

**Question for you:** Keep in v4.0? Rip out? Link from somewhere?

> FEEDBACK:
> 

---

# SECTION B — Public GlitchTech Pages

URL base same (`http://localhost:3004`), routes under `/tech`.

## B.1 Tech homepage — `/tech`

**What's there today:** Featured reviews carousel, category tiles, BPR benchmark spotlight (just shipped — but currently short-circuits because no published review has `bpr_score`), compare CTA, newsletter, splash overlay.
**Memory note:** Per Phase 16.1 — hero should match Studios visual rhythm, same copy structure adapted.

**Look for:** hero energy, spotlight legitimacy (empty now — what does it feel like?), category-tile visual quality, featured-review card quality, scroll flow.

**Edge-case prompts:**
- Zero published reviews: what does the home feel like? Is it honest?
- One published review: is the home obviously thin?
- The spotlight "editor's choice" language: right once we have 2-3 reviews? 20?

> FEEDBACK:
> 

---

## B.2 Reviews list — `/tech/reviews`

**What's there today:** Sort (latest/rating/name), category filter, cursor pagination (12/page). Currently near-empty DB.

**Look for:** list density, card treatment (desktop vs mobile), filter design, empty state honesty.

> FEEDBACK:
> 

---

## B.3 Review detail — `/tech/reviews/[slug]`

**What's there today:** 16 sections — breadcrumb → hero → verdict → body → rating → pros/cons → gallery → video → specs → benchmarks → audience → related → compare CTA → newsletter → BPR scorecard (with medal + rubric badge) → JSON-LD.
**Note:** No published review with populated BPR exists in DB — Phase 17 verified code is wired but can't see the full render.

**Look for:** section order, typography, rating-bar layout, pros/cons balance, gallery presentation, video embed, related-reviews logic.

**Edge-case prompts:**
- Review without video: section gracefully hidden?
- Review without gallery: section gracefully hidden?
- Missing benchmarks: BPR placeholder renders correctly?
- Rubric v1.1 badge: clickable → methodology page?
- Print version: needed? Or is this a save-for-later thing?

> FEEDBACK:
> 

---

## B.4 Categories list — `/tech/categories`

**What's there today:** Level-1 tile grid with product/review counts. Empty state if no categories.

**Look for:** tile visual weight, category hierarchy communication, counts meaningfulness.

> FEEDBACK:
> 

---

## B.5 Category detail — `/tech/categories/[slug]`

**What's there today:** Breadcrumb + children + reviewed/unreviewed product sections.

**Look for:** sub-category display, reviewed vs unreviewed distinction, CTA to request a review.

> FEEDBACK:
> 

---

## B.6 Category rankings (master leaderboard) — `/tech/categories/[slug]/rankings`

**Phase 18 territory — NOT BUILT YET.** This is the headline v3.0 feature that never shipped. Roadmap says: sortable columns, URL-stateful filters, BPR medal per row, mobile card fallback.

**Question for you:** This is where GlitchMark likely lives. Does the leaderboard show BPR medal AND GlitchMark number? Or does GlitchMark replace BPR here? Dedicated GlitchMark column separate from the medal column?

> FEEDBACK:
> 

---

## B.7 Compare — `/tech/compare`

**What's there today:** Command-based product picker, winner-detecting specs table, Recharts benchmark bars (lazy), tabs for Specs/Benchmarks/Price.

**Look for:** product-picker UX, spec-row density, winner-highlighting subtlety/loudness, chart quality, mobile reflow.

**Edge-case prompts:**
- 1 product vs 2 vs 4: different layouts?
- Products in different categories: comparable or blocked?
- Missing spec for one product: dash, blank, "N/A"?

> FEEDBACK:
> 

---

## B.8 Methodology — `/tech/methodology`

**What's there today:** Force-static ISR — BPR formula + 7 disciplines + thresholds + exclusion policy + rubric v1.1 changelog (Phase 17 shipped).

**Look for:** readability, formula clarity, changelog positioning, trust signals.

**Question for you:** Does GlitchMark methodology live here too, or gets its own page?

> FEEDBACK:
> 

---

## B.9 Benchmarks — `/tech/benchmarks`

**What's there today:** "No benchmarks published yet" + link to methodology. Empty state only until reviews ship.

**Question for you:** Does this surface even exist in v4.0, or does it collapse into the master leaderboard?

> FEEDBACK:
> 

---

## B.10 Tech blog — `/tech/blog`

**What's there today:** Stub — "No posts yet" placeholder; Phase 16.1 wired the sidebar Blog link to avoid 404.
**Phase 20 territory — NOT BUILT YET.**

**Question for you:** Is Tech blog a separate content stream, or just category-filtered Studios blog? If separate, does it have distinct categories/authors/tone?

> FEEDBACK:
> 

---

# SECTION C — Auth + Client Dashboard

## C.1 Login — `/login`

**What's there today:** Email + password form. Post-login role-based redirect (admin → `/admin`, client → `/dashboard`).
**Memory note:** 999.2 admin auth UX question CLOSED today as not-a-bug.

**Look for:** form visual weight, error messaging, forgot-password affordance, register CTA.

**Edge-case prompts:**
- Wrong password: specific message or generic "invalid credentials"?
- Email doesn't exist: same generic message (enumeration defense)?
- Locked account / too many attempts: handled?

> FEEDBACK:
> 

---

## C.2 Register — `/register`

**What's there today:** Name + email + password + confirm form.

**Look for:** password-strength display, terms-accept checkbox, post-register flow (verify email? auto-login?).

**Edge-case prompts:**
- Email already registered: clear message?
- Password requirements: visible upfront?
- Did email verification ever ship? (Better Auth supports it — configured?)

> FEEDBACK:
> 

---

## C.3 Forgot password / Reset — `/forgot-password`, `/reset-password`

**Status:** Routes may or may not exist; **Resend is not wired** (999.3) — so even if routes exist, the email never sends. Explicit launch blocker.

> FEEDBACK:
> 

---

## C.4 Dashboard home — `/dashboard`

**What's there today:** Welcome, recent orders (5), upcoming bookings (Phase 8 shipped this).

**Look for:** personalization depth (just name, or more?), empty states (new user), quick-action affordances.

> FEEDBACK:
> 

---

## C.5 Purchases — `/dashboard/purchases`

**What's there today:** Beat/bundle purchase history with license, price, download link.

**Look for:** download UX (expiring link? always available?), license re-display, receipt availability, filter/search (needed?).

> FEEDBACK:
> 

---

## C.6 Bookings — `/dashboard/bookings`

**What's there today:** Upcoming/past — service, date, status (pending/confirmed/completed), reschedule/cancel.

**Look for:** status badge clarity, reschedule UX, cancellation UX, refund display.

**Edge-case prompts:**
- Within-cancel-window vs outside: different actions?
- Admin cancels: how does client find out?
- Booking modified by admin: notification path?

> FEEDBACK:
> 

---

# SECTION D — Admin Dashboard

## D.1 Admin home — `/admin`

**What's there today:** Revenue (30d), bookings this week, pending messages, subscriber count, activity feed.
**Memory note:** "sidebar doesn't scroll independently" — check status post-Phase 5.

**Look for:** dashboard information value (vanity numbers vs actionable), activity feed signal/noise, empty states, first-run experience.

> FEEDBACK:
> 

---

## D.2 Admin — Tech products, reviews, ingest wizard (`/admin/tech/*`)

**What's there today:** Products list + new + edit; reviews list + new + edit; ingest wizard (Phase 16 shipped); categories tree; benchmarks list.
**Known:** Ingest wizard was Phase 16 UAT-tested; some cosmetic issues flagged in 999.5.

**Look for:** workflow from product-create → review-draft → ingest JSONL → compute BPR → publish. Where does it break? What's tedious?

**Edge-case prompts:**
- Draft vs published review: clearly distinguished?
- Superseded benchmark runs: admin can see history?
- Product without category: blocked or allowed?
- Review without product: blocked or allowed?
- Ingest wizard dry-run vs commit: always safe to retry?

> FEEDBACK:
> 

---

## D.3 Admin — Bookings (`/admin/bookings`)

**What's there today:** Table with guest, service, date, status, actions.

**Look for:** filter/search, bulk actions, status-change UX, client communication affordance.

> FEEDBACK:
> 

---

## D.4 Admin — Services + booking config (`/admin/services/*`)

**What's there today:** Service list, new, edit, booking-config per service (deposit type, duration, refund policy, auto-confirm, cancellation window).

**Look for:** booking-config complexity vs usability, deposit-type UX, cancellation-window-editor.

> FEEDBACK:
> 

---

## D.5 Admin — Beats, Bundles (`/admin/beats/*`, `/admin/bundles/*`)

**What's there today:** Beats list + new + edit (audio upload, BPM, key, mood, pricing). Bundles list + new + edit.

**Look for:** audio upload flow, BPM/key detection (auto? manual?), bundle-discount logic, publish/unpublish toggle.

> FEEDBACK:
> 

---

## D.6 Admin — Blog (`/admin/blog/*`)

**What's there today:** Post list + new + edit (Tiptap editor?), categories.

**Look for:** editor UX, featured-image upload, publish-date scheduling, category management.

> FEEDBACK:
> 

---

## D.7 Admin — Team (`/admin/team/*`)

**What's there today:** Team member list + new + edit.

> FEEDBACK:
> 

---

## D.8 Admin — Clients (`/admin/clients`)

**What's there today:** Client list — email, name, total spent, last order. Filter/search.

**Look for:** client detail drill-down (exists?), export, communication affordance.

> FEEDBACK:
> 

---

## D.9 Admin — Inbox (`/admin/inbox`)

**What's there today:** Contact form submissions — unread count, list, read/archive.

**Look for:** reply affordance (from here? or copy email to external client?), archive vs delete.

> FEEDBACK:
> 

---

## D.10 Admin — Newsletter (`/admin/newsletter/*`)

**What's there today:** Subscriber list + compose. **Resend not wired — compose will fail silently today.**

**Look for:** compose UX, preview, send-to-list, send stats (opens/clicks?).

> FEEDBACK:
> 

---

## D.11 Admin — Media library (`/admin/media`)

**What's there today:** Upload form + media list.

**Look for:** upload UX (single? bulk?), search, metadata editing, usage tracking ("where is this image used?").

> FEEDBACK:
> 

---

## D.12 Admin — Settings, Rooms, Packages, Roles, Testimonials, Availability

**What's there today:** Various admin surfaces — settings index, homepage editor (drag-drop!), rooms list, packages list, roles management, testimonials moderation, availability calendar.

**Look for:** which of these are you actively using vs which are vestigial? Any deserve to be killed?

> FEEDBACK:
> 

---

# SECTION E — Global Components

## E.1 Desktop sidebar (both brands)

**What's there today:** Logo, nav items, latest-post/review widget, cross-link tile, social icons, booking status badge, tile-nav component shared between Studios and GlitchTech.
**Memory note:** "Logo, tile sizes, no compact mode, no constant animations."

**Look for:** visual density, hover behavior, cross-link-tile friction, how it feels on 13" vs 27".

> FEEDBACK:
> 

---

## E.2 Mobile bottom tab bar

**What's there today:** 5-item bottom nav — home, beats/reviews, services/categories, dashboard/compare, menu.
**Memory note:** Phase 7.2 restructure; Phase 7.3 menu overlay rework.

**Look for:** icon legibility, touch-target size, active-state treatment.

> FEEDBACK:
> 

---

## E.3 Mobile menu overlay

**What's there today:** Full-screen mobile menu — all nav items, brand switcher, social links.
**Memory note:** Phase 7.3 — 3 nav items in menu, 4-row breathing grid, swipe-down-to-dismiss.

**Look for:** menu completeness, brand-switcher placement, gesture feel.

> FEEDBACK:
> 

---

## E.4 Footer

**What's there today:** Sitemap, social, contact, newsletter signup, copyright, address.

**Look for:** density vs utility, social icons (memory note: "don't look like social media icons — need actual platform icons"), legal links, address accuracy.

> FEEDBACK:
> 

---

## E.5 Audio player bar

**What's there today:** Placeholder — not functional.
**Question for you:** Does the player bar ship in v4.0, or stay stubbed? (Beats catalog works without it — play inside cards.)

> FEEDBACK:
> 

---

## E.6 Splash overlay

**What's there today:** First-visit animation, per-brand sessionStorage gate (Phase 16.1).

**Look for:** duration (too long? too short?), skippability, consistency between brands.

> FEEDBACK:
> 

---

# SECTION F — Cross-Page Flows

Walk each flow end-to-end. Note what breaks, what's awkward, what's missing.

## F.1 Beat purchase flow

Browse → License modal → Cart → Checkout → Stripe → Success → Email → Dashboard/Purchases

**Prompts:**
- Emotional high point?
- Friction point?
- Where do most people abandon (guess)?
- Email confirmation quality (Resend stub — what *should* it say?)

> FEEDBACK:
> 

---

## F.2 Service booking flow

Services list → Book wizard → Deposit → Confirmation → Email → Dashboard/Bookings

**Prompts:**
- Step count feel right?
- Deposit moment clear?
- Post-booking next-steps guidance?

> FEEDBACK:
> 

---

## F.3 Tech review creation flow (admin)

Create product → Draft review → Ingest JSONL → BPR computes → Publish → Public surfaces update

**Prompts:**
- Steps missable?
- Recovery if ingest partially fails?
- Preview-before-publish possible?
- Published review needs edit — workflow?

> FEEDBACK:
> 

---

## F.4 Auth flow

Register → Verify email (if enabled) → Login → Role-based redirect

**Prompts:**
- Email verification shipping in v4.0 (requires Resend)?
- Social login (Google, Apple) in scope?
- Magic link login in scope?

> FEEDBACK:
> 

---

## F.5 Cross-brand nav flow

Studios sidebar → "Visit GlitchTech" tile → GlitchTech home → sidebar → "Visit Studios" → Studios home

**Memory note:** Phase 16.1 D-01 — same-tab, audio stops on cross-origin. Accepted trade-off.

**Prompts:**
- Still OK, or worth revisiting?
- Cross-brand session (logged in on Studios, stays logged in on Tech): working?

> FEEDBACK:
> 

---

## F.6 Newsletter → Unsubscribe flow

Footer signup → Email (stub — Resend not wired) → Unsubscribe link → Confirmation

**Prompt:** Tied to 999.3 email blocker. Once email ships, what does the welcome email say?

> FEEDBACK:
> 

---

# SECTION G — Edge Cases

Triage each with `[BLOCK]` / `[POLISH]` / `[BACKLOG]` / `[OK]`.

## G.1 Auth edge cases

- User forgets password: Resend not wired → link never arrives. `[BLOCK]` (999.3)
- User verifies email: Does the flow exist end-to-end, or is it disabled?
- User on new device: Does session persist? Better Auth defaults OK?
- Admin locked out: Only real owner path is DB account creation (UAT admin exists `uat-admin@glitchstudios.local` — `[BLOCK]` delete before prod, or rotate to real admin)
- Social / magic-link: In scope for v4.0?

> FEEDBACK:
> 

---

## G.2 Payment edge cases

- Stripe decline: user-facing message?
- Webhook misses: DB stays "pending" — reconciliation path?
- Refund flow: admin-initiated? client-requested?
- PayPal path via Stripe: surfaced at checkout?
- Tax calculation: Stripe Tax on? Manual? None?
- International cards: BEURc checks, 3DS, decline rates?
- Currency: USD only, or multi-currency?

> FEEDBACK:
> 

---

## G.3 Booking edge cases

- Two clients race for the same slot: DB enforces uniqueness?
- Client cancels within window: automated refund?
- Admin cancels client booking: client notification (Resend — blocked)
- No availability set: does service show at all?
- Timezone: user vs studio TZ handling?
- Capacity / room double-book: prevented?

> FEEDBACK:
> 

---

## G.4 Tech reviews edge cases

- Draft review visible in admin but not public?
- Unpublish published review: public surfaces update (revalidation)?
- Missing benchmarks: graceful placeholders (Phase 17 shipped)
- Superseded runs: admin visibility/audit path?
- Product deleted with reviews: cascade? Block?
- Category renamed: slug migration?
- Rubric v1.2 future upgrade: old reviews preserve v1.1 display?

> FEEDBACK:
> 

---

## G.5 Ingest edge cases

- Malformed JSONL: per-line validation + batch-reject (Phase 16 shipped)
- Duplicate run_uuid: UNIQUE constraint rejects (Phase 15)
- Partial commit: no partial writes (Phase 16 tx design)
- Wrong discipline field: rubric v1.2 remediation deferred (Phase 16 note)
- Wrong product: admin can remove + re-ingest?

> FEEDBACK:
> 

---

## G.6 Content edge cases

- Beat uploaded without audio: blocked?
- Blog post saved without title: blocked?
- Service without description: blocked?
- Image > 10MB: handled?
- HTML injection in Tiptap content: sanitized?

> FEEDBACK:
> 

---

## G.7 Performance edge cases (999.4 territory)

- Admin context switcher Studios ⇄ Tech: 3-4s per toggle (confirmed bad)
- Admin edit → ingest wizard: ~4s (confirmed bad)
- Public page TTFB: acceptable?
- Mobile LCP on homepage: acceptable?
- Images: Next/Image everywhere? Bad paths?

> FEEDBACK:
> 

---

## G.8 Production readiness edge cases

- UAT admin account `uat-admin@glitchstudios.local` exists — `[BLOCK]` delete/rotate
- `.env` in production: Resend keys, Neon prod DB, Stripe live keys, Better Auth secret
- Sitemap: per-brand sitemaps (Phase 21)
- OG tags: per-route (Phase 21)
- Robots.txt: configured
- Analytics: none today — in scope?
- Error tracking (Sentry etc.): none today — in scope?
- Backup strategy: Neon auto-backup, but what about code/asset?

> FEEDBACK:
> 

---

# SECTION H — v3.0 Carry-over Triage

Every pending v3.0 item. Tag each `[IN v4.0]` / `[BACKLOG]` / `[DROP]`.

## H.1 Unfinished phases

- **17.5 Trailer Video Surface** (one-liner only — "surface for the two finished trailer videos")
- **18 Category Master Leaderboard** (headline v3.0 feature — sortable rankings, URL filters, BPR medal column)
- **19 Flagship MBP Review Published** (MBP 16 M5 Max content swap — needs real benchmarks)
- **20 GlitchTech Blog** (brand-discriminated blog stream)
- **20.5 Launch Blockers Bundle** (999.3 email + 999.4 perf + UAT admin cleanup)
- **21 Deploy Hardening** (glitchtech.io domain, per-brand sitemap, OG tags)

> FEEDBACK (triage each):
> 

---

## H.2 999.x backlog

- **999.3 Resend + Transactional Email** — password reset, booking confirms, contact replies, newsletter. Explicit launch blocker.
- **999.4 Site-Wide Performance Audit** — admin context switch 3-4s, edit→ingest 4s. Explicit launch blocker.
- **999.5 Admin cosmetic cleanup** — details panel cramped on MBP review edit.
- **999.6 Programmatic CLI** (AI workflow path) — lower priority.

> FEEDBACK:
> 

---

## H.3 HUMAN-UAT pending items

- **17-HUMAN-UAT.md** — live review detail render with populated BPR (blocked on published review), compact medal on review cards list (blocked same)
- **16-UAT** — may have outstanding items; will audit if you want

> FEEDBACK:
> 

---

## H.4 Deferred items from summaries

- Phase 16 `deferred-items.md` — rubric v1.2 remediation (field-vs-key inconsistency)
- Phase 16.1 deferred — audio continuity across brands, deep flow audit, social "coming soon" → live workflow
- Phase 7.6 deferred — ??? (will check if you want)
- Phase 15 deferred — rubric-map completeness for disciplines beyond CPU (populates as Mac benchmarks roll in)

> FEEDBACK:
> 

---

## H.5 Known todos in STATE.md

- Phase 15 plan-phase was needed — completed
- Medal color approval from Josh — relevant in v4.0?
- Rubric map completeness (12 disciplines beyond CPU)
- UAT admin account cleanup (`uat-admin@glitchstudios.local`)
- Resend integration

> FEEDBACK:
> 

---

# SECTION I — GlitchMark Design Session

**Your concept (captured 2026-04-23 05:55 UTC):**
> "add up all the benchmarks of a specific category then either divide them or something and create one number, that adds up and considers all the other numbers... from cinebench to 3mark and beyond all recorded in the masterchart, then all produce a glitchmark, this could be an industry standard."

**Now's the time to pin this down, OR declare "I'll iterate on the formula inside the phase."** Either works.

## I.1 The number itself

- **Output:** single number? Range? (0-100? 0-1000? Unbounded?)
- **Per-what:** per-device? per-device-per-category? per-configuration (RAM / CPU tier / etc.)?
- **Input:** all benchmarks we record, or a subset? Includes BPR rubric disciplines, or orthogonal?

> FEEDBACK:
> 

---

## I.2 The formula

- Simple arithmetic mean of normalized benchmark scores?
- Geometric mean (industry standard for composite benchmarks — PassMark, CPUMark use this)?
- Z-score per benchmark then averaged?
- Weighted — if so, what weights?
- How do benchmarks with different scales (e.g. Cinebench R23 multi = 20000 vs Geekbench 6 single = 3000) get normalized?

> FEEDBACK:
> 

---

## I.3 Relationship to BPR

- GlitchMark replaces BPR medal entirely?
- GlitchMark supplements BPR (both show on reviews/leaderboard)?
- GlitchMark is leaderboard-only, BPR is review-only?
- Different use case (GlitchMark for comparing devices, BPR for grading an individual review's quality)?

> FEEDBACK:
> 

---

## I.4 Where GlitchMark appears

- Master leaderboard column? Sortable?
- Review detail card (next to BPR medal)?
- Category pages?
- Homepage spotlight?
- Its own dedicated surface ("GlitchMark hall of fame")?

> FEEDBACK:
> 

---

## I.5 Methodology transparency

- Own methodology page at `/tech/glitchmark` explaining the formula?
- Or section within existing `/tech/methodology`?
- Public formula (trust) vs closed formula (mystique)?

> FEEDBACK:
> 

---

## I.6 Versioning

- GlitchMark v1 locks formula. v2 when?
- Old reviews recompute or preserve their v1 score?

> FEEDBACK:
> 

---

## I.7 Industry-standard ambition

- You said "industry standard." Is that marketing aspiration or a real plan (publish formula + reach out to manufacturers)?
- Branded trademark? (`GlitchMark™`)

> FEEDBACK:
> 

---

# SECTION J — Brain Dump (catch-all)

Everything else. Ideas, complaints, competitors you envy, videos you've watched that inspire you, things that bug you, features you wish existed. No structure needed.

> BRAIN DUMP:
> 
> **Strategic pivots surfaced during A.1 homepage audit (2026-04-24):**
>
> **1. Custom Beats replaces Studio Sessions as primary offering (for now)**
> No physical studio yet — "Book a Session" CTA is dead today. Replace hero primary CTA with "Custom Beat" and build a real custom-beat request/booking flow. Studio session code stays for the future. Needs its own phase(s) in v4.0 — hero CTAs, `/services`, `/book`, new custom-beat surface all touched.
>
> **2. YouTube as canonical video host (discovery over self-host)**
> Every video — Our Work carousel, trailer video surface (17.5 carry-over), artist content, future review videos — lives on YouTube as a single canonical video. The site embeds it. Goal: consolidate views + virality instead of splitting between "website video" and "YouTube video". Architecture decision for v4.0 content pipeline.
>
> **3. Trap Snyder beat-making video**
> Artist Trap Snyder has footage of him making a beat. This should replace placeholders in Our Work + Portfolio. Drops in once YouTube-host pattern is decided.
>
> **Surfaced during A.2 Beats audit (2026-04-24):**
>
> **4. "Made by hand" videos embedded on beat detail pages**
> Trap has been recorded in red-raw high quality while making beats. For beats that have a making-of video, embed the YouTube video on the beat's detail/license modal. Reinforces "made by hand, NOT AI" — real, community-based, more desirable. Conditional surface (not all beats will have video). Ties to pivot #2 (YouTube-first). Likely its own phase in v4.0.
>
> **5. Persistent play bar needs swipe-to-minimize on mobile**
> Users should be able to swipe the bottom player bar down to dismiss / swipe up to restore. Native-feeling gesture. Small but meaningful mobile UX improvement.
>
> **6. Beat card: play vs buy affordance — unresolved UX puzzle**
> Today, tapping image = play; tapping title = license modal. Users won't discover the title-tap. User wants the card/title tap to open the modal, with a dedicated control for play/pause. Needs a design decision that doesn't clutter the clean aesthetic.
>
> **Surfaced during A.3 License modal audit (2026-04-24):**
>
> **7. BEAT LICENSING MODEL — fundamental redesign**
> Current tier system (MP3 Lite / WAV / stream-count limits) is industry-standard but confusing — even to the site owner. Stream limits are honor-system, not technically enforced. User asked: maybe just sell the beat unlimited. This needs: research on current beat-licensing landscape (BeatStars/Airbit tiered model vs. flat-rate/unlimited trend), decision on GlitchStudios positioning, artist-side input (what do YOUR producers want to sell), legal/contractual review, then schema + UI redesign. Likely its own phase with discuss-phase gating before implementation. Affects: `/beats` cards, license modal, checkout, orders schema, admin beat-create flow, download/rights tracking.


---

# SECTION K — Proposed v4.0 Phase Structure

*[I'll populate this after sections A-J have meaningful content. Placeholder.]*

---

*Audit started: 2026-04-24*
*Milestone target: v4.0 — Production Launch*
*Process: audit drives direction — no phase-writing until sections are triaged*
