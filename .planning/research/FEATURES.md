# Feature Research

**Domain:** Music/Video Production Studio Website + Beat Store
**Researched:** 2026-03-25
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

#### Beat Store / E-Commerce

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Persistent audio player with waveform | Every beat platform (BeatStars, Airbit, Traktrain) has this. Buyers need to browse while listening. Without it, beats stop playing on navigation and buyers leave. | HIGH | Use WaveSurfer.js for waveform rendering. Must persist across Next.js page transitions (layout-level component). This is the single hardest table-stakes feature. |
| Tiered licensing (MP3 Lease, WAV Lease, Trackout/Stems, Unlimited, Exclusive) | Industry standard pricing tiers. Artists expect to choose quality/rights level. Typical: MP3 ($20-30), WAV ($30-50), Stems ($50-100), Unlimited ($100-250), Exclusive ($300-2000+). | MEDIUM | Each tier needs: price, file format delivered, usage rights (stream caps, performance limits), and a license agreement PDF auto-generated on purchase. |
| Beat watermarking on previews | Every platform watermarks preview audio. Without watermarks, beats get stolen immediately. | MEDIUM | Audio watermark overlaid on preview MP3s. Can be done at upload time (server-side with FFmpeg) or pre-baked before upload. Pre-bake is simpler for v1. |
| License agreement / contract delivery | Buyers expect a PDF license agreement with each purchase defining usage rights. BeatStars and Airbit both auto-generate these. | MEDIUM | Template-based PDF generation per license tier. Delivered via email and available in client account downloads. |
| Shopping cart and checkout | Standard e-commerce. Must support adding multiple beats. | MEDIUM | Stripe + PayPal as specified in PROJECT.md. Cart state persists across sessions (localStorage or server-side for logged-in users). |
| Beat categorization and filtering | Genre tags, BPM, key, mood. Buyers search by these attributes. | LOW | Tag system on beats. Filter UI with genre, BPM range, key, mood selectors. |
| Instant digital delivery | Buyers expect files immediately after payment, not manual fulfillment. | MEDIUM | Secure download links (signed URLs with expiry) delivered post-checkout. Files stored in cloud storage (Vercel Blob or S3). |
| Beat search | Buyers need to find specific sounds. At minimum: text search across title, tags, genre. | LOW | Full-text search across beat metadata. Can start with client-side filtering, upgrade to server-side later. |

#### Studio Services / Booking

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Service pages with clear pricing | Clients need to know what you offer and what it costs before reaching out. Every studio website lists services. | LOW | Static-ish pages editable from admin. Services: studio sessions, mixing/mastering, video production, SFX, graphic design. |
| Calendar booking system | PROJECT.md specifies this. Modern studios use online booking vs. inquiry forms. Reduces friction. Clients expect self-service scheduling. | HIGH | Need: availability management, time slot selection, service type selection, buffer times between sessions, booking confirmation. Consider integrating with Google Calendar for sync. |
| Booking deposit / prepayment | Studios lose money on no-shows. Prepayment on booking is standard practice for recording studios. | MEDIUM | Collect deposit (or full amount for smaller services) at booking time via Stripe/PayPal. Refund policy displayed clearly. |
| Contact form | Fallback for clients who prefer to discuss before booking. Expected on every service website. | LOW | Simple form with name, email, service interest, message. Routes to admin inbox. |
| Testimonials / social proof | Clients need trust signals before booking studio time or buying services. | LOW | Testimonial cards with client name, project type, quote. Admin-managed. |

#### Portfolio / Showcase

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Video portfolio with embedded playback | Core value prop of the studio. Visitors must see the work. Embedded players (YouTube/Vimeo) are standard. | LOW | Grid/gallery of video projects. Each with thumbnail, title, description, embedded player. Categorize by type (music video, promo, etc.). |
| Audio portfolio / credits | Producers showcase their catalog. Visitors want to hear finished work beyond just beats for sale. | LOW | Can overlap with beat catalog but should also include client work, placements, featured tracks. |
| Artist/producer profile pages | PROJECT.md specifies this. Shows the team, builds personal brand. | LOW | Bio, photo, role, credits, social links. Admin-editable. |

#### Content / Marketing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Blog / news section | SEO driver. Expected on creative agency sites. Behind-the-scenes, announcements, tutorials. | LOW | Markdown or rich-text blog posts. Basic pagination, categories/tags. |
| Newsletter signup | Standard for audience building. Every creative business collects emails. | LOW | Email capture form. Integrate with email system (specified in PROJECT.md). |
| SEO fundamentals | Must rank for local studio searches and beat-related keywords. | LOW | Next.js metadata, Open Graph tags, structured data, sitemap, proper heading hierarchy. Built into the framework. |

#### Accounts / Admin

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Client accounts (login, purchase history, downloads) | Buyers need to re-download purchased files. Booking clients need to see upcoming sessions. | MEDIUM | Auth system, purchase history, download links, booking history. |
| Admin dashboard | PROJECT.md specifies this. Owner needs to manage content, beats, bookings, clients, pricing without touching code. | HIGH | CRUD for beats, services, blog posts, team bios, testimonials. Booking management. Client list. Site settings. This is a large surface area. |
| Transactional emails | Booking confirmations, purchase receipts, download links. Users expect immediate email confirmation for any transaction. | MEDIUM | Email templates triggered by events. Use Resend or similar transactional email service. |
| Mobile-responsive design | Over 60% of music consumption and discovery happens on mobile. Non-negotiable. | MEDIUM | Tailwind makes this manageable but the persistent audio player on mobile needs careful UX treatment. |

### Differentiators (Competitive Advantage)

Features that set Glitch Studios apart from generic beat stores and studio websites.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unified platform (beats + services + portfolio) | BeatStars/Airbit are beat-only. Studio websites are booking-only. Combining both under one brand with one account is rare and powerful. This IS the differentiator of the whole project. | HIGH | Architecture must support both e-commerce and service booking under unified auth and admin. |
| Cyberpunk/glitch visual identity | Most beat stores look generic (BeatStars templates). Most studio sites are bland. A strong, distinctive aesthetic (flat black/white, glitch effects, dramatic typography) creates memorability and brand recognition. | MEDIUM | Tailwind + custom CSS. Subtle WebGL or CSS glitch effects. Must not sacrifice performance or usability for style. |
| Video showreel as hero content | Video production studios lead with showreels. Beat producers rarely do this. Leading with a cinematic showreel immediately communicates production quality above typical beat sellers. | LOW | Auto-playing muted hero video on homepage. Short (30-60s) highlight reel. Lazy-loaded for performance. |
| Case studies for client work | Creative agencies use case studies (problem, process, result) instead of just portfolio thumbnails. Applying this to music/video production shows professionalism beyond typical producer sites. | LOW | Template for case study pages: client, challenge, approach, result, media embeds. |
| Bulk/bundle pricing for beats | BeatStars introduced "Collections" in 2025. Offering curated beat packs at a discount drives higher average order value. | LOW | Bundle product type in beat store. Discount applied when purchasing as bundle vs. individual. |
| Co-producer split tracking | Airbit offers this. If Glitch Studios has collaborators, tracking revenue splits per beat builds trust and professionalism. | MEDIUM | Per-beat co-producer assignment with percentage splits. Reporting in admin. Actual payout can be manual for v1. |
| Newsletter with exclusive content | Beyond basic signup -- offering free beat downloads, behind-the-scenes content, or early access to new releases drives email list growth and repeat visits. | LOW | Integrate with email campaigns from admin. Segment by client type (beat buyers vs. studio clients). |
| Admin analytics dashboard | BeatStars and Airbit provide analytics (plays, sales, conversion). Building this into the admin gives the owner business intelligence without third-party platforms. | MEDIUM | Track: page views, beat plays, play-to-purchase conversion, booking conversion, revenue by service type, top beats. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time chat / messaging | Seems like it would help client communication | Massive complexity (WebSockets, presence, message storage, notifications). Owner can't monitor 24/7. Creates support expectations. PROJECT.md already marks this out of scope. | Contact form + email. Link to social DMs (Instagram, Twitter) for informal communication. |
| Beat marketplace (multi-producer) | BeatStars model -- let other producers sell on the platform | Completely different business model. Requires: multi-tenant accounts, commission tracking, payout infrastructure, dispute resolution, content moderation. Enormous scope expansion for v1. | Single-producer store. If collaborators contribute beats, handle via co-producer splits on owner's store. |
| AI beat recommendations / personalization | BeatStars rebuilt their recommendation engine in 2025 | Requires usage data at scale to be useful. With a catalog of dozens to hundreds of beats (not millions), simple genre/mood filtering works better. AI is premature. | Good tagging, filtering, and curated collections/bundles. |
| Streaming / subscription model | Monthly access to beat catalog, Spotify-style | PROJECT.md explicitly out of scope. Complicates licensing (streaming rights vs. purchase rights). Requires different payment infrastructure (recurring billing). Cannibalizes per-beat sales. | Per-beat licensing is the proven model. Offer bulk discounts via bundles instead. |
| Mobile app | Native app for browsing beats or managing bookings | PROJECT.md out of scope. Responsive web covers the use case. App store approval, dual codebase maintenance, push notification infrastructure -- all for features the website handles fine. | Progressive Web App (PWA) if needed later. Responsive design for v1. |
| Social features (comments, likes, follows) | Community engagement on beats | Requires moderation. Low engagement on single-producer sites (not enough users). Spam magnet. Adds complexity to every beat page. | Social proof via play counts and purchase counts (displayed numbers). Link to actual social media for community. |
| Content ID / YouTube monetization | Airbit offers Content ID. Seems like a revenue stream. | Requires partnerships with distributors (complex legal agreements). Not feasible for a self-hosted website. | If needed, use Airbit or DistroKid separately for Content ID. Keep the website focused on direct sales. |
| Multi-language support | Reach international audience | PROJECT.md out of scope for v1. i18n adds complexity to every string, every page, every email template. | English only. Revisit if analytics show significant non-English traffic. |
| DAW plugin / desktop integration | Some beat stores offer VST plugins for browsing beats inside the DAW | Extremely high complexity. Separate software product. Tiny user base for a single studio. | Good mobile-responsive website that producers can use alongside their DAW on a second screen or phone. |

## Feature Dependencies

```
[Auth System (Client Accounts)]
    |
    |-- requires --> [Database + User Model]
    |
    +-- enables --> [Beat Store (Purchase History, Downloads)]
    |                   |
    |                   +-- requires --> [Payment Processing (Stripe + PayPal)]
    |                   +-- requires --> [Persistent Audio Player]
    |                   +-- requires --> [Beat Catalog + Licensing System]
    |                   +-- requires --> [Digital File Storage + Delivery]
    |                   +-- requires --> [Transactional Email (Receipts)]
    |
    +-- enables --> [Booking System]
    |                   |
    |                   +-- requires --> [Calendar/Availability Management]
    |                   +-- requires --> [Payment Processing (Deposits)]
    |                   +-- requires --> [Transactional Email (Confirmations)]
    |
    +-- enables --> [Client Dashboard (View History)]

[Admin Dashboard]
    |
    +-- requires --> [Auth System (Admin Role)]
    +-- requires --> [Beat Catalog CRUD]
    +-- requires --> [Booking Management]
    +-- requires --> [Content CMS (Blog, Pages, Bios)]
    +-- requires --> [Email Campaign System]

[Public Website (No Auth Required)]
    |
    +-- includes --> [Service Pages]
    +-- includes --> [Video Portfolio]
    +-- includes --> [Artist Profiles]
    +-- includes --> [Blog]
    +-- includes --> [Contact Form]
    +-- includes --> [Newsletter Signup]
    +-- includes --> [Beat Catalog Browsing (Preview Only)]

[Persistent Audio Player]
    +-- requires --> [Audio File Hosting (Watermarked Previews)]
    +-- enhances --> [Beat Catalog]
    +-- enhances --> [Audio Portfolio]
```

### Dependency Notes

- **Beat Store requires Auth + Payments + Player:** Cannot sell beats without all three. These form a critical dependency chain -- no single piece works alone.
- **Booking requires Calendar + Payments:** Calendar availability is the core of booking. Prepayment prevents no-shows.
- **Admin Dashboard requires all content models:** Admin is the last thing to build because it surfaces CRUD for everything else. Build the data models and public-facing features first, admin UI second.
- **Public Website is independent:** Service pages, portfolio, blog, and profiles can ship without auth or e-commerce. This is the logical Phase 1.
- **Persistent Audio Player is a cross-cutting concern:** Affects layout architecture from day one. Must be planned into the app shell early, even if the full beat store comes later.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept and start generating revenue.

- [ ] Public website with cyberpunk aesthetic (homepage, service pages, about/team) -- establishes brand presence
- [ ] Video portfolio with embedded playback -- showcases work immediately
- [ ] Artist/producer profile pages -- builds personal brand
- [ ] Contact form with email routing -- enables client inquiries
- [ ] Beat catalog with persistent audio player, genre/BPM/key filtering -- core product for beat sales
- [ ] Tiered licensing system (MP3, WAV, Stems, Exclusive) with license PDF generation -- industry-standard sales model
- [ ] Watermarked previews -- protects intellectual property
- [ ] Shopping cart + Stripe/PayPal checkout -- enables revenue
- [ ] Instant digital delivery (signed download URLs) -- fulfills orders without manual work
- [ ] Client accounts (auth, purchase history, re-downloads) -- required for digital delivery
- [ ] Calendar booking with deposit payment -- enables studio session revenue
- [ ] Admin dashboard (beat CRUD, booking management, basic content editing) -- owner can operate independently
- [ ] Transactional emails (purchase receipts, booking confirmations) -- professional communication
- [ ] Mobile-responsive design -- majority of traffic will be mobile
- [ ] SEO fundamentals -- discoverability

### Add After Validation (v1.x)

Features to add once core is working and generating revenue.

- [ ] Blog / news section -- add when SEO strategy is defined and owner commits to content cadence
- [ ] Newsletter system with campaigns -- add when email list reaches meaningful size (100+ subscribers)
- [ ] Beat bundles / collection pricing -- add when catalog is large enough (20+ beats) to justify bundles
- [ ] Case studies for client work -- add when there are 3+ completed client projects to feature
- [ ] Admin analytics dashboard (plays, sales, conversions) -- add when there's enough data to be meaningful
- [ ] Testimonials section -- add when testimonials are collected from real clients
- [ ] Co-producer split tracking -- add if/when collaborator beats are listed

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Progressive Web App (PWA) -- defer until mobile usage patterns justify offline/install capabilities
- [ ] Advanced search (full-text, similar beats) -- defer until catalog exceeds 100+ beats
- [ ] Client file sharing / review portal (upload stems for mix review) -- defer until studio booking volume justifies the complexity
- [ ] Multi-admin roles (engineer, manager, owner permissions) -- defer until team grows beyond solo operator
- [ ] Affiliate / referral program -- defer until consistent sales volume exists

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Public website + aesthetic | HIGH | MEDIUM | P1 |
| Video portfolio | HIGH | LOW | P1 |
| Persistent audio player | HIGH | HIGH | P1 |
| Beat catalog + filtering | HIGH | MEDIUM | P1 |
| Licensing system + contracts | HIGH | MEDIUM | P1 |
| Beat watermarking | HIGH | MEDIUM | P1 |
| Shopping cart + checkout | HIGH | MEDIUM | P1 |
| Digital delivery | HIGH | MEDIUM | P1 |
| Client auth + accounts | HIGH | MEDIUM | P1 |
| Calendar booking | HIGH | HIGH | P1 |
| Admin dashboard | HIGH | HIGH | P1 |
| Transactional emails | HIGH | MEDIUM | P1 |
| Service pages | HIGH | LOW | P1 |
| Contact form | MEDIUM | LOW | P1 |
| Mobile responsive | HIGH | MEDIUM | P1 |
| SEO | MEDIUM | LOW | P1 |
| Artist profiles | MEDIUM | LOW | P1 |
| Blog | MEDIUM | LOW | P2 |
| Newsletter system | MEDIUM | MEDIUM | P2 |
| Beat bundles | MEDIUM | LOW | P2 |
| Case studies | MEDIUM | LOW | P2 |
| Admin analytics | MEDIUM | MEDIUM | P2 |
| Testimonials | LOW | LOW | P2 |
| Co-producer splits | LOW | MEDIUM | P2 |
| Cyberpunk visual effects (advanced) | MEDIUM | MEDIUM | P2 |
| PWA capabilities | LOW | MEDIUM | P3 |
| Client file sharing portal | MEDIUM | HIGH | P3 |
| Multi-admin roles | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | BeatStars | Airbit | Typical Studio Sites | Glitch Studios Approach |
|---------|-----------|--------|---------------------|------------------------|
| Beat audio player | Persistent player, waveform, queue | Persistent player, clean UI | N/A | Persistent player with WaveSurfer.js waveform, cyberpunk styling |
| Licensing tiers | MP3, WAV, Stems, Unlimited, Exclusive | MP3, WAV, Tracked Out, Unlimited, Exclusive | N/A | MP3, WAV, Stems, Unlimited, Exclusive -- industry standard tiers |
| Watermarking | Auto-watermark on upload | Auto-watermark on upload | N/A | Pre-baked watermarked previews for v1, automated later |
| License contracts | Auto-generated PDF per tier | Auto-generated per tier | N/A | Template-based PDF generation per tier |
| Video portfolio | None | None | Showreel + project grid | Full video portfolio with case studies -- differentiator from beat platforms |
| Studio booking | None | None | Contact form or Calendly embed | Built-in calendar booking with deposit -- differentiator from beat platforms |
| Service listings | None | None | Service pages with pricing | Service pages integrated with booking -- unified experience |
| Analytics | Detailed play/sale analytics | Strong analytics focus | Basic Google Analytics | Custom admin analytics dashboard -- owns the data |
| Customization | Template-based storefront | Customizable website | Fully custom | Fully custom Next.js -- complete creative control |
| Commission | 0% Pro Page, 12% marketplace | 0% own site, 10-20% marketplace | N/A | 0% commission -- own platform, keep everything |
| Payment options | Stripe, PayPal, Apple Pay, Google Pay | Stripe, PayPal | Varies | Stripe + PayPal at launch, expandable |
| Blog / content | None | None | Sometimes | Blog for SEO + audience building |
| Email marketing | Basic notifications | Basic notifications | Newsletter via Mailchimp etc. | Built-in newsletter + transactional from admin |

## Sources

- [BeatStars features and 2025 updates](https://blog.beatstars.com/posts/beatstars-release-notes-june-2025)
- [Best Beat Marketplaces Compared 2026](https://www.soundclick.com/guides/best-beat-marketplaces/)
- [BeatStars vs Airbit comparison](https://producerfury.com/resources/beatstars-vs-airbit)
- [Airbit beat selling features](https://airbit.com/sell-beats)
- [Beat licensing and pricing guide 2025](https://baxonbeats.com/blogs/news/how-much-do-beats-cost-a-complete-guide-to-beat-pricing-and-licensing)
- [Beat license tier comparison](https://currentsound.com/beat-license-type-comparison/)
- [Music production website design best practices](https://nilead.com/industry/music-production-website-design)
- [Music producer website showcasing best practices](https://mixprodmasters.com/audio/music-producer-website-best-practices-for-showcasing-your-work/)
- [Studio booking software features](https://www.booknetic.com/blog/music-studio-booking-software)
- [Studio scheduling and client portal](https://mysonido.com/platform/)
- [WaveSurfer.js persistent player in Next.js](https://github.com/katspaugh/wavesurfer.js/discussions/3190)
- [Beat store audio players for producers](https://thecorporatethiefbeats.com/music-marketing/music-players-websites/)
- [Soundgine beat selling platform features](https://soundgine.com/)
- [Which beat marketplace is best in 2026](https://slimegreenbeats.com/blogs/music/which-beat-marketplace-is-the-best-in-2026)

---
*Feature research for: Music/Video Production Studio Website + Beat Store*
*Researched: 2026-03-25*
