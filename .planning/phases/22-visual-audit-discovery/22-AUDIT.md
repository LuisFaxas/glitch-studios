# v4.0 Production Launch — Pre-Milestone Audit

**Purpose:** Extract everything from your head, mark every broken/weak/missing thing across the site, decide GlitchMark, and triage every v3.0 carry-over. Output of this doc becomes the v4.0 milestone scope.

**Status tracker:**

| Section | Status | Your last entry |
|---|---|---|
| A. Public Studios pages | ✅ done 2026-04-24 | All 15 Studios surfaces audited |
| B. Public GlitchTech pages | 🟡 in-progress (B.1-B.8 done 2026-04-24) | B.8 methodology — nav gap + medal visual redesign |
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

**Audited:** 2026-04-24 on production `https://glitchstudios.io/services`

### Overall verdict

**"Weakest page in the whole site."** Full redesign needed. Not a polish pass — a ground-up rework. `[IN v4.0 — own phase, full redesign]`

### Mobile

- One long scrolling list of cards — boring, monotonous
- No clear "book a session" call-out
- Doesn't sell the product

### Desktop

- Big cards with very little content on them
- Same fundamental weakness as mobile
- Lacks the visual density and polish other pages have

### Strategic direction for the redesign

1. **Pivot to modular services structure.** Custom Beats becomes the primary offering today (ties to Section J pivot #1). Studio Sessions stays — the physical studio IS being built, don't regress, but it's secondary until the studio exists.

2. **Two-tab structure proposal** (user's idea): services page has its own hero section + two tabs — **Custom Beats (or Custom Music)** and **Studio Sessions**. User can toggle between the two offerings; each gets its own rich content treatment.

3. **Custom Beats tab must be rich.** Well-designed, sells the offering, explains the process, pricing, turnaround, samples. This is the primary revenue surface right now.

4. **Studio Sessions tab** — present but clearly "coming when studio opens" (or fully live if/when the studio is online).

5. **Borrow UI/UX patterns from other pages** — Services is too flat; bring density, motion, visual hierarchy from stronger pages (homepage, beats catalog).

6. **Identity** — services page needs its own visual identity. Not just a stripped-down version of other pages.

### Scope note

This phase should also fold in A.5 (booking wizard) because the flow changes — custom beats requires a different request/intake flow than studio sessions (beat brief, reference tracks, delivery expectations vs. calendar/deposit). One phase covers:
- `/services` redesign with tabbed Custom Beats / Studio Sessions structure
- Custom beats intake/request flow (new surface, likely replaces or supplements `/book`)
- Admin surface for managing custom-beat requests (may need new admin screens)
- Existing studio session booking preserved behind the Studio Sessions tab

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

**Audited:** 2026-04-24 on production `https://glitchstudios.io/book`

### Verdict

**Merged into A.4 Services full-redesign phase.** Cannot meaningfully deep-audit the flow because the page is too weak to evaluate yet — needs the redesign first. `[IN v4.0 — merged into Services redesign phase]`

### Feedback

1. **Services → Book Session pipeline structure is liked** in principle. The concept of a services landing → pick one → intake wizard makes sense.

2. **Visual redesign needed** — same verdict as Services. Weak visually, doesn't carry the brand weight.

3. **IA confusion — Services vs. Book as two separate pages.** User (the site owner) can't distinguish what each page is for. If the owner is confused, visitors definitely are. This is the single biggest issue here.

4. **Edge-case prompts cannot be answered yet** — user fair-pointed that the flow isn't developed enough to evaluate conflict handling, refund policies, timezone behavior, etc. These become real questions once the redesign exists.

### Design direction (for the Services phase that absorbs this)

The IA question to resolve in that phase's discussion:

- **Option A: ONE page, two tabs.** `/services` is the one entry point. Tabs toggle Custom Beats vs. Studio Sessions. Intake form expands inline in the selected tab. `/book` is deleted or becomes a deep-link alias that pops the right tab.
- **Option B: TWO pages but cleaner separation.** `/services` = landing/marketing/pricing. `/book` = the actual intake wizard once user clicks a CTA. Each offering has a distinct intake (custom beat brief vs. studio calendar).
- **Option C: separate custom-beat surface entirely.** e.g., `/custom-beat` for the beat intake, `/book` for studio session booking, `/services` as overview. Three pages, clearer separation but more surfaces to build.

This decision lives in the Services phase's discuss-phase step, not now.

### What the Services phase must preserve when it redesigns

- **Studio Sessions booking is not dead** — the physical studio is being built. The calendar-based wizard (deposit, TZ, cancellation-window logic) should not be deleted; it should live behind the Studio Sessions tab/path.
- **Custom Beat intake is new** — different fields (brief, reference tracks, delivery expectations, turnaround) need a fresh flow designed.



---

## A.6 Portfolio — `/portfolio`

**What's there today:** Full page "Coming soon" placeholder. Detail routes `/portfolio/[slug]` wired but empty.
**Memory note:** 7/10 — "strong animations/filters, detail view confusing" (this was pre-placeholder-pivot).

**Question for you:** Is this surface ever going live in v4.0, or is "coming soon" the intended state forever?

**Audited:** 2026-04-24 on production `https://glitchstudios.io/portfolio`

### Verdict

Goes live in v4.0. Current state "looks good" visually but feels like a placeholder page, not production. Cannot meaningfully audit UX until media showcase strategy is decided. `[IN v4.0 — own phase, discuss-first]`

### Observations

- **Hero section is a video player** — but no videos exist, so it's hard to evaluate
- **No videos uploaded yet** — page is structurally wired but content-empty
- **Mobile:** one long list below the hero — user doesn't love this treatment

### Questions the phase must answer (discuss-phase input)

1. **Hero video selection** — how is the currently-featured video chosen? Admin flag on a specific video? Latest-published auto-pick? Manual "featured" order? Must be a clear admin workflow.

2. **Single-video hero vs. multi-video hero** — should the hero play one video at a time or allow scrubbing through multiple with arrows/swipe/drag?

3. **Layout pattern — three options user surfaced:**
   - **(a) YouTube-clone** — sticky video at the top (with description/metadata), list of videos below; clicking a list item swaps the hero. Sophisticated, familiar, handles scale well.
   - **(b) Long single list** — current mobile treatment; user doesn't love it.
   - **(c) Carousels per category** — one carousel per category/type. Better for discovery per category but risks confusion when looking for a specific video.

4. **YouTube-first alignment (pivot #2)** — every video embedded from YouTube, NOT self-hosted. One canonical video per piece of content, views unified. This is already locked via pivot #2 — portfolio phase inherits this.

5. **Overlap with other video surfaces** — the portfolio media shares sources with the homepage "Our Work" carousel, artist profiles, GlitchTech reviews. Is portfolio the CANONICAL list of all video work, and other surfaces pull from it? Or does each surface curate its own?

### Cross-cutting realization

Portfolio, homepage Our Work, artists, trailer video surface (17.5 carry-over), GlitchTech review videos — all of these are "where does video live?" questions. May need a **cross-cutting media/video strategy phase** BEFORE individual surface redesigns, so every surface pulls from a single media model instead of each being designed in isolation.



---

## A.7 Artists / Team — `/artists`

**What's there today:** Full page "Coming soon" placeholder. Phase 12 shipped an internal team + collaborators structure but the public `/artists` is gated.
**Memory note:** "basic — unclear purpose (team vs collaborators vs both?)"

**Question for you:** What IS this surface — team members, collaborators, featured artists you've worked with, or all three?

**Audited:** 2026-04-24 on production `https://glitchstudios.io/artists`

### Visual

- **No hero section** (mobile or desktop) — needs one. Simple static image is fine, carousel unnecessary. Just something with presence. `[POLISH]`
- **Mobile list** is acceptable — keep as list, not carousel (carousel might hide artists). `[OK]`
- **Desktop** — same carousel-vs-list reasoning; list is fine. `[OK]`

### Content gaps (Trap Snyder profile)

- Currently one artist: Trap Snyder (videographer, editor, music producer, beat maker).
- Tapping his profile shows NOTHING — no music, no beats, no videos, no portfolio connection.
- **Artist detail page must show all media related to the artist:** beats they produced, videos they made/appeared in, portfolio items, the stuff they're selling.
- This is a data-relationship gap, not just design. Beats/videos/portfolio items need to be queryable by artist.

### STRATEGIC EXPANSION — The Artist Platform Vision

**User's vision, captured verbatim:** "not just be the studio platform but also give artists their own page. Remember like Facebook or like MySpace back in the day. Something that they can sign up as an artist, share their beats, share their page, upload videos for their beats, and that artist page, that artist detail page, becomes what they share of Glitch Studios — becomes their portfolio, becomes their main page — like that artist feels that we get, we give them even more value for being in our page."

**What this means in scope:**

1. **Artists as platform citizens, not just showcased names.** Glitch pivots from "studio that works with artists" → "studio + artist platform where creators have their own home."
2. **Self-serve artist signup** — distinct role (or distinct onboarding) from client signup. Artist dashboard separate from client dashboard.
3. **Artist profile editor** — bio, photo, links, genre, role tags (producer/videographer/singer/writer).
4. **Artist media upload** — artists upload their own beats/videos/portfolio items via their dashboard. Admin-moderation workflow probably needed.
5. **Artist-beats relationship** — every beat tied to its producer/artist (DB + UI).
6. **Artist-video relationship** — every video attributed similarly.
7. **Shareable artist page** — an artist sees their profile as THEIR portfolio; they share the Glitch URL the way they'd share a MySpace/Bandcamp/SoundCloud profile.
8. **Discovery surfaces** — browse artists by role, genre, featured status.
9. **Future possibilities:** artist revenue share / royalty tracking, DMs between artist+client, collab invites, "produced by" attribution on every beat purchase.

### My honest recommendation (you asked — "tell me what you think")

**This is a STRONG, differentiated vision.** It fits Glitch's "community first, red raw handmade" voice. It would distinguish Glitch from BeatStars (marketplace-only) and from generic studio sites (portfolio-only).

**But it's a milestone-level pivot, not a v4.0 phase.** A full creator platform with self-serve signup + upload + moderation + revenue is weeks-to-months of work, delays production launch substantially, and the platform value is only proven once real artists use it.

**Suggested split — ship in two waves:**

**Wave 1 (v4.0, ships with the launch):**
- Hero section on `/artists`
- Rich "read-only" artist detail pages — Trap Snyder's profile shows his beats (via artist-beat relationship), his videos (via artist-media relationship via pivot #9 media model), his portfolio items. Proves the concept with real data.
- Schema work: add `primary_artist_id` / `produced_by_artist_id` to beats, attribution on videos/portfolio items.
- Admin flow: assign artist to existing content.
- Result: launch with a curated, rich artist experience for Trap. Validates whether the "artist as platform citizen" framing lands.

**Wave 2 (v5.0 — post-launch):**
- Artist self-serve signup + role + dashboard
- Artist media upload with moderation
- Artist profile editor
- Discovery pages (browse by role/genre)
- Revenue share / royalty tracking
- Multi-artist collab features

**Why split:** launching with 1 artist (Trap) proves the design; you learn what real creators actually want before you build the self-serve version. Prevents building a platform that nobody uses how you imagined.

**Tag:** `[IN v4.0 — Wave 1 only, own phase]` + `[v5.0 — Wave 2, deferred]`



---

## A.8 Blog list — `/blog`

**What's there today:** Published posts with category filter, featured post at top, load-more pagination.
**Memory note:** 5/10 — "inconsistent card sizes, no scrolling, barren."

**Look for:** card layout consistency, category filter design, pagination behavior, empty state, featured post treatment.

**Audited:** 2026-04-24 on production `https://glitchstudios.io/blog`

### Mobile + Desktop verdict

**Same story:** visually basic, a flat list, no hero, no featured carousel, no differentiation between newest / featured / by category. Memory rating of 5/10 still holds. `[IN v4.0 — own phase, research-driven]`

### Specific issues

- **No hero section** on the blog list — needs one (featured post or carousel of featured posts).
- **No visual differentiation** between featured, new, and regular posts. Everything gets the same card treatment.
- **No category carousels** — current model is one flat list with a filter. User wants category carousels or similar segmentation.
- **Card tap doesn't open the post** — user must tap the "Read post" button specifically. Whole-card tap should open. `[POLISH — small fix]`
- **Overall visual overhaul needed** — both mobile and desktop need a complete redesign.

### Blog post detail (tested welcome-to-glitch-studios)

- Looks good, nice `[OK]`
- Needs support for richer content: images and videos inline.
- Video embeds should use YouTube (ties to pivot #2).

### Phase structure request from user

User wants this to be a **research-driven phase**:
- Research best blog pages in the world (editorial, magazine, creator-focused, tech-focused)
- Identify patterns that work: hero treatment, category navigation, post card hierarchy, post detail reading experience
- Implement the best the industry has to offer
- This is a `gsd-phase-researcher` + `gsd-planner` territory, not a gut-redesign.

### Cross-brand implication

The Studios blog and the GlitchTech blog (BLOG-* carry-over requirements) share components per the existing architecture (Phase 10 + BLOG-05). **This redesign benefits BOTH blogs** — `/blog` and `/tech/blog` should get the same treatment in one phase to avoid redesigning twice. The phase should also fold BLOG-01 through BLOG-05 carry-over work (brand column, schema, routes) if not already done.



---

## A.9 Blog detail — `/blog/[slug]`

**What's there today:** Full article, author, reading time, related posts.

**Look for:** typography, reading rhythm, code/quote blocks, image handling, share buttons (exist?), comments (exist?), author bio, related-posts recommendation logic.

**Audited:** 2026-04-24 on production (read the `welcome-to-glitch-studios` test post)

### Feedback

- **Looks good, nice** overall `[OK]`
- **Needs rich content support** — images + videos inline in the post body. Video embeds via YouTube per pivot #2. `[POLISH]`
- **Otherwise merged with A.8 Blog redesign phase** — the detail page deserves the same redesign-with-research treatment as the list.



---

## A.10 Contact — `/contact`

**What's there today:** Contact form — subject dropdown pre-filled with services, message, file upload.
**Memory note:** 4/10 — "too simple, email only, no WhatsApp/phone."

**Look for:** field set, validation, success state, spam defense (captcha? rate limit?), attached-file size limits, where submissions go (admin inbox? email? both?).

**Edge-case prompts:**
- Form submitted but Resend not wired: does the submission save to DB? User sees success?
- Spam volume: is there protection?
- Attachments: file type restrictions?

**Audited:** 2026-04-24 on production `https://glitchstudios.io/contact`

### Verdict

**Defer — keep as-is.** `[BACKLOG]`

### Rationale

- Email-only is fine for now
- User wants to AVOID additional channels (WhatsApp/phone/etc.) — no spam, no random crap
- Nobody needs to contact Glitch for anything critical right now
- Contact page was already deferred in v2.0 (Phase 13 Contact — "business info not finalized")
- Memory rating of 4/10 from 2026-03-28 acknowledged but not acted on — intentional deferral, not neglect

### When to revisit

Re-audit after launch traction when: (a) real contact volume justifies channel expansion, (b) spam becomes a real issue, (c) business info is ready for public display (map, phone, studio address).



---

## A.11 Cart drawer + floating cart button

**What's there today:** Persistent cart (cross-session), slide-out drawer, floating button bottom-corner with item badge.
**Memory note:** "working, looks nice."

**Look for:** empty state, quantity controls, bundle display inside cart, remove-item affordance, subtotal clarity, continue-shopping vs checkout CTAs.

**Audited:** 2026-04-24 on production

### Desktop

- **Looks great** `[OK]`

### Mobile

- **Looks good** overall `[OK]`
- **Sticky cart button in top corner** — present at all times, not intrusive `[OK]`
- **Missing gesture — swipe-to-dismiss.** Currently the only way to close the drawer is tapping the X button. Should be closable by swiping right. Include a visible swipe indicator so the affordance is discoverable. `[POLISH]`

### Broader pattern surfacing (elevated to pivot #12)

User's ask: **"the whole site should be more friendly and feel like an app when using it from your phone."** Two instances of the same pattern now: A.2 (swipe-to-minimize player bar) and A.11 (swipe-to-dismiss cart). Worth treating as a **mobile-native-feel phase** that sweeps every touch surface.



---

## A.12 Checkout — `/checkout`

**What's there today:** Stripe Embedded Checkout (client-side), totals, guest or logged-in path.

**Look for:** guest checkout clarity, apply-coupon affordance, PayPal path (Stripe supports it — is it visible?), payment-method selection, billing address fields, error states, post-success redirect.

**Edge-case prompts:**
- Guest buys → creates account post-purchase? Or stays guest?
- Failed payment: can user retry without re-entering?
- Stripe webhook never fires: does DB stay in "pending"?
- 0% tax states, international states: handled?

**Audited:** 2026-04-24 on production (mobile)

### 🔴 TWO PRODUCTION BUGS FOUND

**BUG #1 — Navigation hang when tapping Beats icon on mobile**
- Tapped Beats icon; page didn't respond for too long; had to refresh the browser to continue.
- Unclear if perf (slow route transition blocking on data) or a broken click handler on mobile.
- `[BLOCK]` — blocks audit flow. Feeds into PERF-* launch blocker.

**BUG #2 — Checkout is BROKEN on mobile**
- Flow: Added beat → cart shows correctly → navigated to `/checkout` → spinner loads indefinitely → error: *"Something went wrong, please try again or contact the merchant."*
- Checkout is not functional on mobile right now.
- `[BLOCK] [LAUNCH-BLOCKER]` — cannot ship a site where checkout doesn't work.

### Required next step (NOT during this audit)

Both bugs need an investigation phase — separate from this audit. Likely candidates:
- **Bug #1:** Slow RSC / route segment boundary, or client nav handler bug on mobile Safari. Check `next-server` logs, use real mobile Network profile.
- **Bug #2:** Stripe Embedded Checkout client session fetch failing (check Vercel runtime logs for the `/api/checkout/session` or equivalent endpoint). Possible causes: missing/invalid `STRIPE_SECRET_KEY` in prod env, empty cart payload being sent, missing `NEXT_PUBLIC_SITE_URL` for redirect config, Stripe account in test mode while the client SDK expects live.

### Audit verdict

**Cannot continue deeper A.12 audit** — the checkout flow itself doesn't render far enough to evaluate. Bug must be fixed, then re-audit.



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

**Audited:** 2026-04-24 on production (no-token case)

### Feedback

- Without a valid token, page shows "invalid link" message + link back to homepage. Graceful, not a crash. `[OK]`
- Full end-to-end UX cannot be tested until Resend is wired (EMAIL-* blocker) and a real unsubscribe token exists.
- Re-audit success-path + re-subscribe affordance after the Email phase ships.



---

## A.15 Apparel coming-soon — `/apparel-coming-soon`

**What's there today:** Landing with email waitlist, product categories (tees, hoodies, accessories). Not accessible from main nav.

**Question for you:** Keep in v4.0? Rip out? Link from somewhere?

**Audited:** 2026-04-24 on production

### Verdict

**Backlog — keep as-is, don't surface in nav.** `[BACKLOG]`

### Feedback

- User verdict: "average — not great, not bad." No strong feeling either way.
- No strategic commitment to apparel as a v4.0 product line.
- Default: page stays live (doesn't cost anything), stays unlinked from main nav, revisit when apparel is an actual initiative worth investing in.
- If apparel launches for real, it gets its own redesign phase — a landing with a real email waitlist, maybe a product preview, brand integration.



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

**Audited:** 2026-04-24 on production `https://glitchtech.io`

### 🔴 BUG — Cross-brand nav click required TWO taps on mobile

- From Studios sidebar, tapped the GlitchTech cross-link tile on mobile. First tap: nothing. Second tap: navigated.
- Same smell as the A.12 "tap Beats icon does nothing, refresh needed" bug. Possibly a mobile click-handler race condition OR a slow nav hanging on initial tap.
- `[BLOCK]` — pairs with A.12 nav bug. Same debug phase.

### Structure — only 3 sections visible

- Feature Reviews (carousel) — empty
- Categories (tile grid) — empty
- Advanced Comparison Tool — CTA

**Missing:**
- **Master leaderboard teaser / preview section** — the "persistent list" user referred to. Maps to RANK-* v3.0 carry-over (Phase 18 was never shipped). Tech home should have at least a preview of the master chart once it exists. `[IN v4.0 — part of RANK-* phase]`

### Empty-data state

- No real content: no featured reviews, no products in categories, no spotlight. Expected today because no published review has populated BPR.
- Structure-wise: user says "overall it looks good" — structure is OK, just content-blocked. `[CONTENT-BLOCKED — unblocks with flagship review (FLAG-*)]`
- Post-audit recommendation: once flagship review ships, re-audit tech home with real content to see if the structural choices still land.

### Hero / splash observations

- User note: *"brought me into Glitch Tech. effect not the other two"* — ambiguous phrasing; possibly noting the splash/hero effect felt different from Studios, or a stuttered render on the second-tap navigation. Flag for clarification when re-auditing post bug-fix.
- Mobile hero has **the same logo-vs-button proportion issue as A.1 Studios homepage** — logo and title feel too small compared to the CTAs. `[POLISH — pairs with A.1 item]`

### Pattern repeat

- **Scroll-down arrow not clickable** — same POLISH item as A.1 Studios. Site-wide pattern. Gets fixed once, applies everywhere. `[POLISH — cross-surface]`



---

## B.2 Reviews list — `/tech/reviews`

**What's there today:** Sort (latest/rating/name), category filter, cursor pagination (12/page). Currently near-empty DB.

**Look for:** list density, card treatment (desktop vs mobile), filter design, empty state honesty.

**Audited:** 2026-04-24 on production `https://glitchtech.io/tech/reviews`

### 🔴 Mobile nav bug — 3rd instance now (pattern confirmed)

- Tapping "Reviews" on the sidebar/nav required 2 taps again. First tap: nothing. Second tap: navigated.
- This is the **third confirmed instance** (A.12 Beats icon, B.1 cross-brand tile, B.2 Reviews link). No longer a one-off — it's a systemic mobile nav bug affecting the whole site.
- Escalated to: `[LAUNCH-BLOCKER]` — users won't double-tap; they'll assume the site is broken and leave.
- Debug phase owns all instances.

### Design

- **Looks good overall** but very simple, almost sparse
- **No hero section** — no imagery, no headline calling attention to the content. `[POLISH]`
- **No CTA to methodology** — `/tech/methodology` was shipped in Phase 17 but reviews list doesn't surface it. Readers land here without context for how reviews are evaluated. `[POLISH]`
- **Not calling for "a nice review"** — nothing entices the reader into a review. Missing visual weight, editorial treatment, featured-review highlight.

### Content

- MBP M5 Max flagship not populated yet (FLAG-* v3.0 carry-over). Empty-looking state is content-blocked, not a design defect.
- Re-audit after FLAG-* ships to see if the simple structure holds up with real content, or if the design actually needs the hero + editorial polish regardless.



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

**Audited:** 2026-04-24 — **SKIPPED, content-blocked**

### State at audit time

- Only 1 review exists in DB: `mbp-16-m5-max-uat` (status: draft, bpr_score: null)
- Detail route filters `status='published'` only (confirmed via `getPublishedReviewBySlug` in `src/lib/tech/queries.ts:141`)
- Direct URL to draft 404s
- No placeholder review exists that could be visually audited

### Action

- **Deferred to post-FLAG-* re-audit.** When the flagship MBP review publishes (Phase 19 carry-over), re-audit this surface with real content. Auto-Playwright snapshot covered the basic structure during Phase 17 — the layout renders correctly, but the user hasn't visually walked it yet.
- Audit questions above remain valid and should be re-applied at that point.



---

## B.4 Categories list — `/tech/categories`

**What's there today:** Level-1 tile grid with product/review counts. Empty state if no categories.

**Look for:** tile visual weight, category hierarchy communication, counts meaningfulness.

**Audited:** 2026-04-24 on production `https://glitchtech.io/tech/categories`

### Feedback

- **No hero section** — page just says "Categories" with no visual weight `[POLISH]`
- **Only one category** (Laptops) renders — that's content, not a defect
- **Card design is flat** — doesn't invite, doesn't differentiate categories
- **Needs design love** — overall treatment doesn't match the "industry-leading" positioning

---

## B.5 Category detail — `/tech/categories/[slug]`

**What's there today:** Breadcrumb + children + reviewed/unreviewed product sections.

**Look for:** sub-category display, reviewed vs unreviewed distinction, CTA to request a review.

**Audited:** 2026-04-24 on production `https://glitchtech.io/tech/categories/laptops`

### Feedback

- **No hero section** — same pattern repeating across GlitchTech `[POLISH]`
- **"Products" heading** with "No reviews yet" empty state — readable but plain
- **No list/card view toggle** — Studios has view-toggle on /beats, GlitchTech could use the same treatment for products
- **Basic cards only** — needs industry-leading treatment
- **Missing:** CTA to request a review of a product, something interesting in the empty state



---

## B.6 Category rankings (master leaderboard) — `/tech/categories/[slug]/rankings`

**Phase 18 territory — NOT BUILT YET.** This is the headline v3.0 feature that never shipped. Roadmap says: sortable columns, URL-stateful filters, BPR medal per row, mobile card fallback.

**Question for you:** This is where GlitchMark likely lives. Does the leaderboard show BPR medal AND GlitchMark number? Or does GlitchMark replace BPR here? Dedicated GlitchMark column separate from the medal column?

**Audited:** 2026-04-24 — vision captured (page not yet built)

### WHY this exists (user's personal pain-point)

User was trying to buy a laptop and couldn't find **a single place** that compared all laptops across CPU, GPU, and other benchmarks. The rankings page IS the solution to that pain. **This is the single strongest product framing in the whole site** — clear job-to-be-done.

### Product vision

- **Master list per category.** Start with Laptops + mobile devices, expand to more categories later.
- **Every reviewed device auto-appears on the master list** (driven by the review publishing + rubric — no manual curation).
- **Multi-column sortable:** rank by GlitchMark OR by any individual benchmark (Cinebench, 3DMark, Geekbench, etc.). Every benchmark column is a valid sort dimension.
- **Compare across brands freely:** MBP vs. ROG vs. anything else in the same category.
- **Rubric-driven consistency:** every device gets the SAME 15-18 tests, producing apples-to-apples numbers. That consistency is what makes the aggregate (GlitchMark) meaningful.

### GlitchMark's role (clarified — answers Section I question)

**GlitchMark is the scan-by number.** When a buyer doesn't want to pick a single benchmark to sort by, GlitchMark is the single aggregate sort-key that says "these are the best overall per our rubric." It sits alongside individual benchmark columns, not instead of them. BPR medal + GlitchMark score both visible — BPR = editorial tier grade, GlitchMark = raw aggregate sortable number.

### Goal

Client leaves the page confident about which device is right for them. Conversion happens on the leaderboard row → affiliate link / review CTA (see pivot #14 below).

### Exact columns / sort / filter spec

Deferred to the leaderboard phase's own `/gsd:discuss-phase` step. Too much detail to nail down now. What the phase needs to research-and-decide:

- Column set per category (laptops surface battery + portability; desktops surface thermal + PSU; phones surface display + battery + cameras)
- Default sort (GlitchMark desc? BPR tier? User's category-specific preference?)
- Filter sidebar (price, year, CPU kind, RAM, storage, medal tier, sub-category)
- Mobile fallback (table → cards)
- Empty state / single-row state (when only the MBP exists)
- Column-header → methodology deep link behavior
- Affiliate-link column (new — see pivot #14)

### Phase structure note

- Research-driven phase (like Blog pivot #11): look at leading benchmark-comparison tools (Tom's Hardware charts, AnandTech Bench, Notebookcheck, PassMark, PCMark, UserBenchmark) and extract the patterns that work.
- Depends on GlitchMark formula being locked first (Section I → pivot capture).
- Pairs tightly with FLAG-* (flagship review) — one needs the other to feel alive.



---

## B.7 Compare — `/tech/compare`

**What's there today:** Command-based product picker, winner-detecting specs table, Recharts benchmark bars (lazy), tabs for Specs/Benchmarks/Price.

**Look for:** product-picker UX, spec-row density, winner-highlighting subtlety/loudness, chart quality, mobile reflow.

**Edge-case prompts:**
- 1 product vs 2 vs 4: different layouts?
- Products in different categories: comparable or blocked?
- Missing spec for one product: dash, blank, "N/A"?

**Audited:** 2026-04-24 on production `https://glitchtech.io/tech/compare`

### Feedback

- **Same pattern as rest of GlitchTech** — no hero, no explanation, very basic `[POLISH — falls under pivot #13]`
- **Cannot test functionality** — only 1 product (MBP M5 Max) exists in DB. Picker has nothing to compare against.
- **Needs design overhaul** to match editorial quality expected of "industry-leading" positioning.

### Open question — Compare vs. Leaderboard redundancy

v3.0 anti-scope explicitly kept Compare as-is with the framing: "`/tech/compare` is 2-way pick-two, leaderboard is the ALL-vs-ALL surface." After B.6 leaderboard vision got clarified today, worth revisiting:

- **Option A (status quo):** Compare stays for intentional head-to-head picks (e.g., "I've narrowed it to these 2-4 — which wins?"). Leaderboard handles "which is best overall in the category."
- **Option B (merge):** Compare gets absorbed into the leaderboard as a multi-select-and-compare feature. One surface, two modes.
- **Option C (redesign):** Compare becomes a deeper surface — e.g., the master leaderboard lets you "pin" rows into a compare panel; compare page itself gets editorial framing, charts, price history, affiliate prompts.

Deferred to the leaderboard phase's discuss-step. Compare's redesign may or may not be its own phase depending on that answer.

### Tension flagged — placeholder products

User suggestion during audit: "we might need to inject some placeholder products so we can test all these things."

**This contradicts a captured memory:** [project_placeholder_first_build.md](../../../../.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_placeholder_first_build.md) explicitly says: "**One laptop only:** MacBook Pro 16" M5 Max 64GB. Do NOT seed additional laptops as placeholders — user said 'I don't want a bunch bunch of stuff and then like I just get confused.'"

Decision to resolve (in a v4.0 early phase):

- Stay with one-laptop placeholder → Compare + Leaderboard stay untestable end-to-end until FLAG-* + second review ship
- Seed 2-5 placeholder laptops with plausible fake data → Compare + Leaderboard testable; accept the "bunch of stuff" cost
- Middle path: seed 2-3 placeholder laptops behind a `NEXT_PUBLIC_DEMO_MODE` flag that's off in production — only visible in preview/staging environments. Testable in preview, clean in prod.

Middle path is my recommendation if the user wants testability without polluting prod. Flag in Section K decisions.



---

## B.8 Methodology — `/tech/methodology`

**What's there today:** Force-static ISR — BPR formula + 7 disciplines + thresholds + exclusion policy + rubric v1.1 changelog (Phase 17 shipped).

**Look for:** readability, formula clarity, changelog positioning, trust signals.

**Question for you:** Does GlitchMark methodology live here too, or gets its own page?

**Audited:** 2026-04-24 on production `https://glitchtech.io/tech/methodology`

### Nav discoverability

- **No way to reach this page from the sidebar.** User couldn't find it.
- There's an "About" link in the sidebar that is **completely empty** — dead link / missing page. `[BUG]`
- **Two possible fixes:**
  - (a) Add a "Methodology" link to the GlitchTech sidebar nav
  - (b) Merge: "About" becomes "Methodology" (likely better — "about" for a review site IS the methodology; it's what makes the reviews credible)
- Decision to resolve in GlitchTech brand-polish phase (pivot #13).

### Content

- **Information quality is good.** Well-positioned, readable, "looks cool" `[OK]`
- **No hero section, no images** — same pattern as every GlitchTech surface. `[POLISH — pivot #13]`
- Current design is "very, very safe and boring" — inherits the GlitchTech visual weakness theme.

### 🚨 BPR Medal visuals — user wants a rethink

Memory says user approved the monochrome intensity palette (Platinum white/black, Gold #888/black, Silver outlined, Bronze dashed) during Phase 17 planning. Now inspecting the rendered output in context, user is rejecting the visual:

- **"The actual metals themselves are crap"** — the monochrome geometric treatment isn't carrying weight.
- **Different sizes between tiers** — inconsistent rendering. Could be a CSS bug (fix + audit) OR an inherent issue with the current design approach. Either way, all tier medals must be the same size.
- **Don't represent anything at first view** — user's point is that a flat colored circle doesn't evoke "medal" intuitively. Needs to look like a real medal (circular medal shape, ribbon, numeral, laurel, actual imagery — not just a tinted rectangle).
- **User's ask:** "a metal system with real, like, good actual metals." Interpretation: replace the geometric monochrome treatment with realistic medal visuals (SVG illustrations, or photographic-style renders) that read as Platinum/Gold/Silver/Bronze at a glance.

This **overrides MEDAL-01's original "monochrome intensity" design decision.** Captured as pivot #15 below. The medal component family stays (the data layer is fine — Phase 17 MEDAL-01 work isn't wasted), but the VISUAL treatment gets redesigned in a dedicated phase.

### GlitchMark

- **Missing from methodology** — user called this out explicitly.
- Already covered by GLITCHMARK-06 requirement. The methodology page picks up a GlitchMark section (or its own page `/tech/glitchmark`) when the GlitchMark phase ships.



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
>
> **Surfaced during A.4 Services audit (2026-04-24):**
>
> **8. SERVICES PAGE — full redesign ("weakest page in the whole site")**
> Services is flat, boring, doesn't sell. Needs a ground-up rebuild with its own identity. Proposed structure: own hero + two tabs (Custom Beats / Studio Sessions). Custom Beats tab = primary revenue surface, needs to be rich. Studio Sessions tab = present but clearly "coming when studio opens". This phase should also absorb the booking wizard changes (A.5) because custom beats needs a different intake flow than studio sessions (beat brief + references vs. calendar + deposit). Likely folds pivot #1 (Custom Beats CTA pivot) into its execution. Affects: `/services`, `/book`, admin custom-beat request management.
>
> **Surfaced during A.6 Portfolio audit (2026-04-24):**
>
> **9. CROSS-CUTTING MEDIA/VIDEO STRATEGY PHASE (probably precedes individual surface redesigns)**
> Portfolio, homepage Our Work, artists, trailer video surface (17.5 carry-over), GlitchTech review videos, beat making-of videos (pivot #4) — ALL of these are "where does video live?" surfaces. Rather than designing each in isolation, this phase defines the ONE canonical video model: YouTube-embed-only (pivot #2), admin flow for adding a video with metadata, how each surface queries/displays them, featured/hero selection logic, overlap rules (is portfolio canonical? does each surface pull from it?). Blocks or informs: Portfolio (A.6), homepage Our Work (A.1), artists (A.7), trailer 17.5 carry-over, GlitchTech review videos, beat making-of (pivot #4).
>
> **Surfaced during A.7 Artists audit (2026-04-24):**
>
> **10. ARTIST PLATFORM VISION — potential MySpace/Bandcamp-style creator platform (split v4.0 / v5.0)**
> User wants Glitch to be more than a studio — also an artist platform where creators have their own Glitch page they'd share like a Bandcamp URL. Self-serve signup, media upload, portfolio editor, discovery. STRONG differentiated vision but milestone-level scope. Recommended split: **v4.0 Wave 1** ships rich "read-only" artist detail pages (Trap Snyder's profile shows his beats/videos/portfolio via artist attribution on existing content) + artist hero on /artists. Proves the concept with real data, validates the framing. **v5.0 Wave 2** adds self-serve signup, artist dashboard, media upload moderation, discovery, revenue share. Schema changes needed in v4.0 Wave 1: `primary_artist_id` / `produced_by_artist_id` on beats, artist attribution on videos + portfolio items. Admin flow to assign artists to existing content.
>
> **Surfaced during A.8+A.9 Blog audit (2026-04-24):**
>
> **11. BLOG REDESIGN — research-driven, cross-brand (Studios + GlitchTech together)**
> Blog list is visually flat — no hero, no featured treatment, no category carousels, whole-card tap doesn't open posts. Blog detail needs rich content support (inline images + YouTube video embeds per pivot #2). User wants a **research-driven phase**: study best blog pages in the world (editorial, magazine, creator, tech), extract patterns, implement industry-leading. Because Studios and GlitchTech blogs share components (Phase 10 architecture + existing BLOG-* carry-over requirements), this phase covers BOTH brands in one go — redesigning twice would be waste. Absorbs BLOG-01 through BLOG-05 carry-over work (brand column, routes, admin brand-selector).
>
> **Surfaced during A.11 Cart audit (2026-04-24):**
>
> **12. MOBILE-NATIVE-FEEL SWEEP**
> User's framing: "the whole site should be more friendly and feel like an app when using it from your phone." Consistent pattern across audit surfaces — same kind of gesture missing:
> - A.2 Beats: persistent play bar should swipe-down to minimize / swipe-up to restore
> - A.11 Cart drawer: should swipe-right to dismiss (with visible indicator)
> - Likely more instances will surface as we continue (mobile menu overlay, modals, sheets)
> This phase sweeps every mobile touch surface and adds the expected native gestures: swipe-to-dismiss on drawers/sheets/modals, swipe-to-minimize on persistent surfaces, pull-to-refresh on list views where relevant, swipe indicators so affordances are discoverable. Small effort per surface, huge cumulative UX quality gain — makes the site feel like an app, not a website-with-mobile-CSS.
>
> **Surfaced during B.1, B.2, B.4, B.5 (2026-04-24):**
>
> **13. GLITCHTECH BRAND-WIDE EDITORIAL / VISUAL POLISH PHASE**
> Every GlitchTech public surface audited so far (tech home, reviews list, categories list, category detail) shares the same weakness: no hero sections, no editorial weight, generic tiles, flat cards, missing view toggles, missing CTAs. GlitchTech as a brand positions itself as "industry-leading hardware reviews with a rigorous 13-discipline rubric" but the current visuals don't carry that authority. This isn't per-page fixes — it's a brand-wide visual polish phase that establishes: editorial hero treatments per surface, review-card hierarchy, category tile visual weight, methodology CTAs where relevant, view-toggle parity with Studios. Shared with Blog phase (pivot #11) — both are editorial surfaces.
>
> **Surfaced during B.6 Rankings vision (2026-04-24):**
>
> **14. AFFILIATE MARKETING AS CORE REVENUE INFRASTRUCTURE (cross-cutting)**
> User's explicit ask: "Affiliate marketing should be a core part of all our website. We are trying to make money too, so reviews and everything should have affiliate marketing." Not a per-feature add-on — a cross-cutting infrastructure phase with its own scope:
>
> - **Business setup:** sign up for affiliate programs (Amazon Associates, manufacturer-direct programs like Apple, Asus, Dell, Lenovo, Razer, B&H, Best Buy, Newegg, Microsoft, etc.), get unique tracking links per program.
> - **Schema:** `product_affiliate_links` table keyed on (product_id, program) with URL + program name + custom tracking ID. Multiple programs per product so we pick the best one at render time (by commission % or availability).
> - **Render logic:** every surface that shows a product gets affiliate-aware CTAs:
>   - Review detail: "Check price on [Amazon/Best Buy/Manufacturer]" buttons (replaces or augments the existing compare CTA)
>   - Master leaderboard: dedicated affiliate-link cell per row
>   - Compare tool: affiliate link per product in the comparison
>   - Blog posts: inline affiliate recommendations in editorial content (research via Tiptap embedded)
>   - Categories / product pages: affiliate CTAs visible
> - **Tracking:** click events captured (destination, source surface, product, program) so we can measure which surfaces convert and which programs pay best.
> - **Analytics:** dashboard in admin showing clicks, estimated revenue, top-performing products + programs.
> - **Legal (non-negotiable):** FTC affiliate disclosure on every page that has affiliate links (US-required); update privacy policy; per-program T&C compliance; `rel="sponsored"` on affiliate `<a>` tags.
> - **Link rotation / cloaking:** proxy links through `/go/[product]/[program]` so the real destination is managed server-side — survives affiliate program URL changes without breaking historical content.
>
> Phase lives AFTER the leaderboard + flagship review ship, because it needs real surfaces to attach to. High revenue leverage — even modest traffic with good affiliate placement can be meaningful recurring income. Tag: `[IN v4.0 — own phase, ideally late in sequence]`.
>
> **Surfaced during B.8 Methodology audit (2026-04-24):**
>
> **15. BPR MEDAL VISUAL REDESIGN (overrides MEDAL-01 monochrome decision)**
> User previously approved monochrome intensity palette (Platinum white, Gold #888, Silver outlined, Bronze dashed) during Phase 17 planning. After seeing it rendered in context on prod, user rejected it: "the actual metals themselves are crap." Issues: sizes inconsistent between tiers (possible CSS bug), flat geometric treatment doesn't evoke "medal" at a glance, doesn't carry visual weight expected of an awards/ranking badge. User's ask: "a metal system with real, like, good actual metals" — realistic medal illustrations (SVG or photographic-style render) that read as Platinum/Gold/Silver/Bronze intuitively, all tiers same size. Data layer is fine (Phase 17 MEDAL-01 work kept); only the visual component gets redesigned. Own small phase, likely bundled with GlitchTech brand-polish (pivot #13). Updates `src/components/tech/bpr-medal.tsx` and any associated CSS.


---

# SECTION K — Proposed v4.0 Phase Structure

*[I'll populate this after sections A-J have meaningful content. Placeholder.]*

---

*Audit started: 2026-04-24*
*Milestone target: v4.0 — Production Launch*
*Process: audit drives direction — no phase-writing until sections are triaged*
