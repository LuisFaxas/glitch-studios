# Requirements: Glitch Studios

**Defined:** 2026-03-25
**Core Value:** Clients can discover Glitch Studios' work and book services or buy beats in one seamless experience.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Beat Store

- [x] **BEAT-01**: Persistent audio player with waveform visualization that survives page navigation
- [x] **BEAT-02**: Beat catalog with genre, BPM, key, and mood filtering
- [x] **BEAT-03**: Beat search across title, tags, and genre
- [x] **BEAT-04**: Tiered licensing system (MP3 Lease, WAV Lease, Stems, Unlimited, Exclusive)
- [x] **BEAT-05**: Auto-generated PDF license agreement per tier on purchase
- [x] **BEAT-06**: Watermarked audio previews on all beats
- [x] **BEAT-07**: Shopping cart supporting multiple beats with persistent state
- [x] **BEAT-08**: Stripe + PayPal checkout for beat purchases
- [x] **BEAT-09**: Instant digital delivery via signed download URLs after purchase
- [x] **BEAT-10**: Beat bundles/collections with discounted pricing
- [x] **BEAT-11**: Co-producer split tracking with percentage assignments per beat

### Booking

- [x] **BOOK-01**: Service pages with clear pricing for studio sessions, mixing/mastering, video production, SFX, graphic design
- [x] **BOOK-02**: Calendar-based booking with available time slot selection
- [x] **BOOK-03**: Service type selection during booking flow
- [x] **BOOK-04**: Deposit/prepayment collection at booking via Stripe/PayPal
- [x] **BOOK-05**: Contact form with name, email, service interest, and message routing to admin inbox
- [x] **BOOK-06**: Testimonials section with admin-managed client quotes

### Portfolio

- [x] **PORT-01**: Video portfolio grid with embedded playback, categorized by type
- [x] **PORT-02**: Audio portfolio/credits section for finished work and placements
- [x] **PORT-03**: Artist/producer profile pages with bio, photo, role, credits, social links
- [x] **PORT-04**: Video showreel hero on homepage (auto-playing muted, 30-60s)
- [x] **PORT-05**: Case study pages with client, challenge, approach, result, and media embeds

### Content

- [x] **CONT-01**: Blog/news section with rich-text posts, pagination, and categories
- [x] **CONT-02**: Newsletter signup form with email capture
- [x] **CONT-03**: SEO fundamentals — metadata, Open Graph, structured data, sitemap

### Auth

- [x] **AUTH-01**: Client account registration and login
- [x] **AUTH-02**: Admin account with role-based access (admin vs client)
- [x] **AUTH-03**: Client dashboard showing purchase history and re-download links
- [x] **AUTH-04**: Client dashboard showing upcoming and past bookings
- [x] **AUTH-05**: Session persistence across browser refresh

### Admin

- [x] **ADMN-01**: Beat management — CRUD for beats with metadata, files, pricing, licensing tiers
- [x] **ADMN-02**: Booking management — view, confirm, cancel, reschedule bookings
- [x] **ADMN-03**: Content management — CRUD for blog posts, service pages, team bios, testimonials
- [ ] **ADMN-04**: Client management — view client list, purchase history, booking history
- [ ] **ADMN-05**: Site settings — edit pricing, availability, about page, contact info
- [x] **ADMN-06**: Email campaign management — compose and send newsletters to subscriber list
- [x] **ADMN-07**: Media library — upload, organize, and manage all images, audio, and video from admin
- [x] **ADMN-08**: Homepage customization — reorder sections, edit hero content, feature beats/videos from admin
- [x] **ADMN-09**: Role-based admin access — owner, editor, and manager roles with granular permissions

### Email

- [x] **MAIL-01**: Purchase receipt emails with download links on beat sale
- [x] **MAIL-02**: Booking confirmation emails with session details
- [x] **MAIL-03**: Contact form submission notification to admin
- [x] **MAIL-04**: Newsletter broadcast emails from admin dashboard
- [x] **MAIL-05**: Contact inbox — view and reply to messages from admin dash

### Infrastructure

- [x] **INFR-01**: Caddy dev server configuration reserved for this project
- [x] **INFR-02**: Vercel deployment with production configuration
- [x] **INFR-03**: Mobile-first responsive design across all pages with desktop optimization
- [x] **INFR-04**: Cyberpunk/glitch visual identity — flat black & white, futuristic, sleek, dramatic typography
- [x] **INFR-05**: Framer Motion page transitions and UI animations throughout
- [x] **INFR-06**: Embla Carousel components for mobile-friendly content browsing (beats, portfolio, testimonials)

## v2.0 Requirements — Quality Overhaul

Sequential page-by-page quality overhaul. No new backend features — purely UX/UI polish. Playwright-verified.

### Admin Dashboard

- [ ] **ADMIN-01**: Admin sidebar scrolls independently from main content area
- [ ] **ADMIN-02**: Dashboard layout feels polished — stat tiles, activity feed, and navigation are visually cohesive

### Homepage

- [ ] **HOME-01**: Homepage has clear visual hierarchy with compelling above-the-fold content
- [ ] **HOME-02**: Homepage has obvious CTAs guiding visitors to book services, browse beats, and explore portfolio
- [ ] **HOME-03**: Homepage content sections flow logically and are not cluttered with scattered elements

### Beats Catalog

- [ ] **BEATS-01**: Beat catalog has industry-standard layout with prominent cover art on each beat card
- [ ] **BEATS-02**: Search and filter controls are grouped and intuitive, not scattered across the page
- [ ] **BEATS-03**: Mood tags are organized and visually clean, not chaotic

### Auth & Navigation

- [ ] **NAV-01**: Login redirects users based on role — admin to /admin, regular users to /dashboard
- [ ] **NAV-02**: Client account access (sign up, login, dashboard) is discoverable in main navigation, not buried
- [ ] **NAV-03**: Sign-up flow is clearly separated from admin login with appropriate sizing and placement

### Services & Booking

- [ ] **BOOK-06**: Booking flow shows all available services and provides enough detail at each step
- [ ] **BOOK-07**: Date, time, and payment steps are clearly separated with contextual information
- [ ] **BOOK-08**: Service pages display comprehensive information (pricing, details, what's included)

### Blog

- [ ] **BLOG-01**: Blog cards are visually consistent in size and layout across all posts
- [ ] **BLOG-02**: Blog page has engagement hooks — featured post, category navigation, reading time
- [ ] **BLOG-03**: Blog supports smooth scrolling or pagination that feels intentional

### Portfolio

- [ ] **PORT-06**: Portfolio detail view has clear navigation to browse between items
- [ ] **PORT-07**: Existing carousel animations and filters are preserved and refined

### Artists/Team

- [ ] **TEAM-01**: Artists page shows both internal team and collaborating artists with clear sections
- [ ] **TEAM-02**: Artist cards have rich content — role, specialties, social links, bio
- [ ] **TEAM-03**: Artists page has carousel or browsing mechanism similar to portfolio

### Contact

- [ ] **CONTACT-01**: Contact page includes WhatsApp integration and phone number
- [ ] **CONTACT-02**: Contact page displays studio location with map
- [ ] **CONTACT-03**: Contact page includes social media links

### Global Polish

- [ ] **POLISH-01**: Social media icons use actual platform brand icons (Instagram, YouTube, SoundCloud), not generic Lucide icons
- [ ] **POLISH-02**: Footer sign-up is properly sized and positioned, not buried or undersized
- [ ] **POLISH-03**: Audio player widget is visually refined and clearly functional

## Future Requirements

Deferred beyond v2.0. Tracked but not in current roadmap.

### Analytics

- **ANLY-01**: Admin analytics dashboard with play counts, sales, conversion rates
- **ANLY-02**: Revenue reporting by service type and beat category

### Advanced Features

- **ADVN-01**: Progressive Web App (PWA) capabilities
- **ADVN-02**: Advanced search with similar beats recommendations
- **ADVN-03**: Client file sharing/review portal for mix feedback
- ~~**ADVN-04**: Multi-admin roles with granular permissions~~ — Delivered in v1 as ADMN-09
- **ADVN-05**: Newsletter segmentation by client type (beat buyers vs studio clients)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time chat/messaging | Massive complexity, creates 24/7 support expectations |
| Beat marketplace (multi-producer) | Different business model entirely, enormous scope |
| AI beat recommendations | Requires scale data; good filtering works for smaller catalogs |
| Streaming/subscription model | Cannibalizes per-beat sales, complicates licensing |
| Mobile app | Responsive web covers the use case, dual codebase not justified |
| Social features (comments, likes) | Requires moderation, low engagement on single-producer sites |
| Content ID / YouTube monetization | Requires distributor partnerships, use Airbit/DistroKid separately |
| Multi-language support | English only for v1, revisit if analytics justify |
| DAW plugin integration | Separate software product, tiny user base |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BEAT-01 | Phase 2 | Complete |
| BEAT-02 | Phase 2 | Complete |
| BEAT-03 | Phase 2 | Complete |
| BEAT-04 | Phase 2 | Complete |
| BEAT-05 | Phase 2 | Complete |
| BEAT-06 | Phase 2 | Complete |
| BEAT-07 | Phase 2 | Complete |
| BEAT-08 | Phase 2 | Complete |
| BEAT-09 | Phase 2 | Complete |
| BEAT-10 | Phase 2 | Complete |
| BEAT-11 | Phase 2 | Complete |
| BOOK-01 | Phase 1 | Complete |
| BOOK-02 | Phase 3 | Complete |
| BOOK-03 | Phase 3 | Complete |
| BOOK-04 | Phase 3 | Complete |
| BOOK-05 | Phase 1.1 | Complete |
| BOOK-06 | Phase 1 | Complete |
| PORT-01 | Phase 1 | Complete |
| PORT-02 | Phase 1 | Complete |
| PORT-03 | Phase 1 | Complete |
| PORT-04 | Phase 1 | Complete |
| PORT-05 | Phase 1 | Complete |
| CONT-01 | Phase 1.1 | Complete |
| CONT-02 | Phase 1 | Complete |
| CONT-03 | Phase 1 | Complete |
| AUTH-01 | Phase 1.1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 3 | Complete |
| AUTH-05 | Phase 1.1 | Complete |
| ADMN-01 | Phase 2 | Complete |
| ADMN-02 | Phase 3 | Complete |
| ADMN-03 | Phase 4 | Complete |
| ADMN-04 | Phase 4 | Pending |
| ADMN-05 | Phase 4 | Pending |
| ADMN-06 | Phase 4 | Complete |
| ADMN-07 | Phase 4 | Complete |
| ADMN-08 | Phase 4 | Complete |
| ADMN-09 | Phase 4 | Complete |
| MAIL-01 | Phase 2 | Complete |
| MAIL-02 | Phase 3 | Complete |
| MAIL-03 | Phase 4 | Complete |
| MAIL-04 | Phase 4 | Complete |
| MAIL-05 | Phase 4 | Complete |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1.1 | Complete |
| INFR-03 | Phase 1 | Complete |
| INFR-04 | Phase 1 | Complete |
| INFR-05 | Phase 1 | Complete |
| INFR-06 | Phase 1 | Complete |

**v1 Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

**v2.0 Coverage:**
- v2.0 requirements: 25 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 25

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-28 — v2.0 Quality Overhaul requirements added (25 requirements across 10 categories)*
