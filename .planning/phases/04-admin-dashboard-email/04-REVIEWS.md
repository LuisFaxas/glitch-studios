---
phase: 4
reviewers: [codex]
reviewed_at: 2026-03-27T05:30:00.000Z
plans_reviewed: [04-01-PLAN.md, 04-02-PLAN.md, 04-03-PLAN.md, 04-04-PLAN.md, 04-05-PLAN.md, 04-06-PLAN.md, 04-07-PLAN.md, 04-08-PLAN.md]
---

# Cross-AI Plan Review — Phase 4

## Codex Review

**Overall**
The Phase 4 plan set is directionally strong and mostly sequenced well, but several plans are not implementable as written against the current repo. The biggest recurring problems are partial RBAC migration across an existing `admin`-gated surface, schema/field-name mismatches with the current code, and missing production behaviors around email compliance and homepage component contracts. Overall risk: **HIGH**.

### 04-01 Plan
**Summary**
Strong foundation plan, but it is overloaded and underestimates the RBAC migration blast radius.

**Strengths**
- Establishes schema, permissions, shell, and roles early, which other plans can build on.
- Unifies admin navigation and creates a clear permission model.

**Concerns**
- **HIGH:** Existing admin pages, actions, and APIs still hard-code `role === "admin"` in the repo, so editors/managers will not actually work even if the new sidebar does.
- **HIGH:** The app Drizzle schema does not currently expose Better Auth's `user` table, yet this plan relies on querying admin members/users directly.
- **MEDIUM:** The default role grants in the plan differ from the research matrix, which can ship unintended access rules.

**Suggestions**
- Expand this plan to include a compatibility pass over all existing admin routes/actions/APIs, not just the new ones.
- Define one concrete strategy for auth-table access and lock the default permission matrix before implementation.

**Risk Assessment**
**HIGH** — if this plan is only partially done, Phase 4 will have inconsistent auth and broken admin access.

### 04-02 Plan
**Summary**
Good shared-component plan, but the upload flow is specified in a way that can accidentally defeat direct-to-R2 uploads.

**Strengths**
- Correctly centralizes Tiptap and media picker before content/newsletter work.
- Reuses the existing R2 presign pattern instead of inventing new storage logic.

**Concerns**
- **HIGH:** `uploadMedia(formData)` implies sending real files to a server action just to extract metadata, which reintroduces payload/timeout issues.
- **MEDIUM:** Delete flow has no reference tracking, so removing a shared asset can silently break content.
- **MEDIUM:** The 50MB limit is low for a studio video workflow, and metadata extraction for audio/video is underspecified.

**Suggestions**
- Use a metadata-only action (`filename`, `mimeType`, `size`) plus client-side upload and client-side media probing.
- Add usage checks or an archive/soft-delete flow before permanent deletion.

**Risk Assessment**
**MEDIUM** — the design is solid, but the upload contract needs correction before implementation.

### 04-03 Plan
**Summary**
The editorial workflow is well chosen, but this plan has multiple schema and public-site contract mismatches.

**Strengths**
- Draft/schedule/publish plus cron is the right workflow for blog management.
- Category/tag CRUD and Tiptap reuse are efficient.

**Concerns**
- **HIGH:** The plan uses `featuredImageUrl` and `body`, while the current blog schema/public pages use `coverImageUrl` and `content`.
- **HIGH:** `publishedAt` handling is missing on scheduled publish, but current public blog ordering and metadata depend on it.
- **MEDIUM:** The plan ignores `excerpt`, which current blog cards and SEO already use.

**Suggestions**
- Normalize to the existing blog schema or explicitly migrate the public blog surface in the same plan.
- Define publish-state transitions precisely: when `publishedAt`, `scheduledAt`, `status`, and excerpt are set or cleared.

**Risk Assessment**
**HIGH** — this can look complete in admin while still breaking public blog behavior.

### 04-04 Plan
**Summary**
Necessary content CRUD, but the service-management part treats booking-critical records too casually.

**Strengths**
- Reuses the shared editor/media tooling appropriately.
- Team and testimonial CRUD are a clean fit for this phase.

**Concerns**
- **HIGH:** Services in this repo are tied to booking config and existing bookings, so delete/slug/type changes can break operational flows.
- **HIGH:** The plan uses `heroImageUrl` for services, but that field is not added in the foundation schema plan.
- **MEDIUM:** It does not explain how existing `/admin/services/[id]/booking-config` stays discoverable after the new services UI lands.

**Suggestions**
- Treat services as semi-immutable operational entities: soft-delete only, restrict destructive edits, and preserve booking-config links.
- Add the missing schema changes for service media fields or remove them from scope.

**Risk Assessment**
**HIGH** — good scope, but the service data model is incomplete and tightly coupled to bookings.

### 04-05 Plan
**Summary**
Useful admin pages, but it under-delivers against both client-management and settings requirements as currently defined.

**Strengths**
- Client detail sheet is a good UX choice.
- Key/value settings are pragmatic for simple studio/contact data.

**Concerns**
- **HIGH:** The client list only targets registered users, but orders and bookings already support guests; that excludes real customers.
- **HIGH:** ADMN-05 includes pricing and availability, but this plan only covers studio/contact/social fields.
- **MEDIUM:** Plain text key/value settings are weak for structured config and future reuse.

**Suggestions**
- Model clients primarily by email across account, guest order, and guest booking data.
- Either broaden this plan to include pricing/availability surfaces or narrow the requirement explicitly.

**Risk Assessment**
**HIGH** — as written, this does not fully satisfy ADMN-04 or ADMN-05.

### 04-06 Plan
**Summary**
Reasonable inbox plan with acceptable v1 scope, but operational email details need tightening.

**Strengths**
- Clean split between notification delivery and inbox/reply UI.
- Admin-side reply tracking is sufficient for v1.

**Concerns**
- **MEDIUM:** The plan uses `service`, but the current contact flow/schema use `serviceInterest`.
- **MEDIUM:** Reply emails are sent from `noreply` with no `replyTo`, which is poor for real client conversations.
- **LOW:** Marking messages read inside `getMessage()` can create accidental state changes.

**Suggestions**
- Align field naming with the existing contact action and use absolute dashboard URLs in email templates.
- Set a monitored `replyTo` or support mailbox, and separate read-state changes from simple detail fetches.

**Risk Assessment**
**MEDIUM** — likely implementable, but needs production-minded mail behavior.

### 04-07 Plan
**Summary**
The product slice is right, but the plan is weak on email compliance, segmentation freshness, and failure recovery.

**Strengths**
- Composer, preview, broadcast history, and subscriber management are the right v1 features.
- Reusing Tiptap and Resend batch sends is sensible.

**Concerns**
- **HIGH:** There is no real unsubscribe/suppression flow, even though the plan sends broadcasts and renders unsubscribe URLs.
- **HIGH:** Segment tags are only described as a utility; the plan does not wire them into order/booking completion or backfill existing subscribers.
- **MEDIUM:** Batch sends can partially succeed before failing, but the plan has no idempotency or per-broadcast failure tracking.

**Suggestions**
- Use `newsletterSubscribers.isActive` for unsubscribe/suppression and implement a real unsubscribe route.
- Add backfill plus post-purchase/post-booking tagging hooks, and record broadcast status/errors explicitly.

**Risk Assessment**
**HIGH** — the UX is good, but the operational email model is incomplete.

### 04-08 Plan
**Summary**
High-value feature, but this is the least internally consistent plan and it underestimates required public-site refactors.

**Strengths**
- Reorder + visibility + hero editing is a strong, bounded customization surface.
- Fallback to the current hardcoded homepage is a sensible rollout guardrail.

**Concerns**
- **HIGH:** Section naming is inconsistent (`portfolio` vs `featured_videos`), which will leak into schema, UI, and rendering logic.
- **HIGH:** Current homepage components do not accept the props this plan assumes, and `FeaturedCarousel` is still placeholder-only.
- **MEDIUM:** The plan promises a configurable blog section, but the current home component set has no blog section implementation.

**Suggestions**
- Normalize section taxonomy first, then explicitly add the required public-component refactors to the plan.
- Add discoverability in admin nav and define what "preview before publish" means for homepage changes.

**Risk Assessment**
**HIGH** — strong idea, but the current repo needs more public-surface work than the plan accounts for.

---

## Consensus Summary

### Agreed Strengths
- Wave structure and dependency ordering are well-designed
- Reuse of existing patterns (R2 uploads, React Email, Server Actions, shadcn tables) is efficient
- Phase scope is correctly bounded to admin dashboard + email operations

### Agreed Concerns
1. **RBAC migration blast radius (HIGH)** — Existing admin pages hard-code `role === "admin"`, new custom roles will not work without a compatibility pass across all existing admin routes
2. **Schema/field-name mismatches (HIGH)** — Plans reference field names that don't match current schema (e.g., `featuredImageUrl` vs `coverImageUrl`, `body` vs `content`, `service` vs `serviceInterest`)
3. **Email compliance gaps (HIGH)** — Newsletter plan lacks real unsubscribe flow, subscriber tagging is not wired to purchase/booking events, no broadcast failure tracking
4. **Guest client exclusion (HIGH)** — Client management only queries registered users, missing guest purchasers and guest bookings
5. **Homepage component contracts (HIGH)** — Plan assumes props that current homepage components don't accept; public-surface refactors not accounted for

### Divergent Views
N/A — single reviewer (Codex only)

---

*Reviewed: 2026-03-27*
*Reviewer: Codex CLI (codex-cli 0.113.0)*
