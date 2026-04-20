# Portfolio Service Match Convention

Decision date: 2026-04-20
Source audit: scripts/09-portfolio-service-match-audit.ts
Raw audit output: /tmp/09-portfolio-audit.json
Consumer: Wave 3 (Plan 09-05) Service Detail Panel Example Work section

## Audit Evidence

- Total active services: 5
- Total active portfolio items: 6
- Services with at least 1 match via `portfolio.type = service.type`: 0
- Services with at least 1 match via `portfolio.category = service.slug`: 0
- Services with at least 1 match via `portfolio.category = service.type`: 0
- Services with ZERO union matches: 5

### Per-service breakdown

| Service (slug / type) | by type | by slug-as-cat | by type-as-cat | union |
|-----------------------|---------|----------------|----------------|-------|
| recording-session / studio_session | 0 | 0 | 0 | 0 |
| mixing-mastering / mixing | 0 | 0 | 0 | 0 |
| video-production / video_production | 0 | 0 | 0 | 0 |
| sfx-design / sfx | 0 | 0 | 0 | 0 |
| graphic-design / graphic_design | 0 | 0 | 0 | 0 |

### Raw portfolio distribution

- `type="video"` (4 items): music_video x2, documentary, commercial
- `type="case_study"` (2 items): music_video, branding

### Key observation

Portfolio enums (`video`, `case_study`) and service `type` enums (`studio_session`, `mixing`, `video_production`, `sfx`, `graphic_design`) use **different vocabularies**. There is NO natural textual join between the two tables with the current seed data, under any of the three candidate predicates.

Practical consequence: under any of Options A, B, or C, every service's Example Work section is empty today. Per UI-SPEC § Service Detail Panel row 8, "If no matching portfolio items exist, section is hidden entirely" — so the entire EXAMPLE WORK block hides on all 5 services in the current state.

## Decision

Options considered:
- Option A (preferred when by-type gives best coverage): portfolioItems.type = services.type
- Option B (preferred when admin content is category-tagged): portfolioItems.category = services.slug
- Option C (when neither alone covers ≥ 50% of services): union of both via OR

Chosen: C

Rationale: All three options give 0/5 coverage today, so coverage cannot drive the decision. The union shape (C) is chosen because (a) it is the most permissive — if either future convention (`type`, `category`) is adopted in seed/admin data, matches will light up without a Wave 3 code change; (b) it matches RESEARCH.md Example 6 verbatim; (c) UI-SPEC's hide-if-empty fallback keeps the detail panel clean today and lets the section self-populate once portfolio items are backfilled.

Future enhancement: an admin-controlled `portfolioItems.serviceId` FK is the correct long-term fix but is out of Phase 09 scope — it would require a migration and admin UI. Flag for a future decimal phase (09.1 if needed) or defer to data-entry convention going forward.

## Locked Query Shape

Wave 3 MUST use this function signature and query body verbatim:

```typescript
import { and, or, eq, desc, asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { services, portfolioItems } from "@/db/schema"

export async function getPortfolioForService(service: { slug: string; type: string }) {
  return await db.select().from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.isActive, true),
        or(
          eq(portfolioItems.type, service.type),
          eq(portfolioItems.category, service.slug),
        )
      )
    )
    .orderBy(desc(portfolioItems.isFeatured), asc(portfolioItems.sortOrder))
    .limit(3)
}
```

Note: `services.type` is `notNull()` in the schema (`serviceTypeEnum`), so no null-guard wrapper is required.

## Fallback Behavior

Per UI-SPEC § Service Detail Panel row 8: "If no matching portfolio items exist, section is hidden entirely (no empty state in this sub-section)."

Wave 3 (Plan 09-05) task MUST:
- Skip rendering the entire EXAMPLE WORK block (heading included) when the query returns `[]`.
- Not render a "Coming soon" placeholder in its stead.
- Not render a skeleton loader (the section either exists with 1-3 items or does not exist at all).

## Wave 3 Implementation Notes

- Export `getPortfolioForService` from a new module (e.g. `src/lib/services/portfolio-for-service.ts`) — keep the query in one place so a later seed-data backfill need not edit the render component.
- Cache via `react.cache(...)` to prevent duplicate queries when the Server Component tree evaluates the same service twice.
- The service detail panel receives `portfolioByServiceId: Record<string, PortfolioItem[]>` from the page Server Component — build once per request, pass down.
