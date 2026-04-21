---
phase: 10-blog
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/db/schema.ts
  - src/actions/admin-blog.ts
  - src/components/admin/blog-post-form.tsx
  - src/app/admin/blog/[id]/edit/page.tsx
autonomous: true
requirements: [BLOG-02]
must_haves:
  truths:
    - "blog_posts table has an is_featured boolean column that defaults to false"
    - "Admin can toggle 'Feature on blog page' on the post-edit form"
    - "Setting is_featured=true on a post un-features any other currently-featured post (single-featured invariant)"
    - "Public /blog page can query for the single featured post via the is_featured column"
  artifacts:
    - path: "src/db/schema.ts"
      provides: "is_featured boolean column in blogPosts table"
      contains: "isFeatured: boolean"
    - path: "src/actions/admin-blog.ts"
      provides: "updateBlogPost + getBlogPost support for is_featured with single-featured invariant"
      exports: ["updateBlogPost", "getBlogPost", "setFeaturedPost"]
    - path: "src/components/admin/blog-post-form.tsx"
      provides: "Switch UI for is_featured with helper copy"
      contains: "Feature on blog page"
  key_links:
    - from: "src/components/admin/blog-post-form.tsx"
      to: "src/actions/admin-blog.ts updateBlogPost"
      via: "handleSave passes isFeatured in formData"
      pattern: "isFeatured"
    - from: "src/actions/admin-blog.ts updateBlogPost"
      to: "db.update(blogPosts) with is_featured=false where id != current"
      via: "single-featured invariant enforcement"
      pattern: "is_featured"
---

<objective>
Add the `is_featured` boolean column to the `blog_posts` table, migrate the DB, and expose an admin toggle on the post-edit form. The toggle MUST enforce the single-featured invariant per D-01: when admin sets `is_featured=true` on a post, every other post's `is_featured` is set to `false` in the same transaction.

Purpose: This is the single source of truth that all other Phase 10 work reads. The hero banner (Plan 05), the blog page fetch (Plan 06), and the admin UX all depend on this column existing and behaving correctly.

Output: Migrated schema + working admin toggle + server-action support for featured-post assignment.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/10-blog/10-CONTEXT.md
@.planning/phases/10-blog/10-UI-SPEC.md

@src/db/schema.ts
@src/actions/admin-blog.ts
@src/components/admin/blog-post-form.tsx
@src/app/admin/blog/[id]/edit/page.tsx

<interfaces>
<!-- Existing signatures the executor must preserve/extend. -->

From src/db/schema.ts (blogPosts table lines 151-165):
```ts
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  categoryId: uuid("category_id").references(() => blogCategories.id),
  authorId: text("author_id"),
  status: postStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

From src/actions/admin-blog.ts:
```ts
interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  tagNames: string[]
  coverImageUrl: string | null
  content: string
  status: "draft" | "scheduled" | "published"
  scheduledAt: string | null
}
export async function createBlogPost(data: BlogPostFormData): Promise<string>
export async function updateBlogPost(id: string, data: BlogPostFormData): Promise<void>
export async function getBlogPost(id: string): Promise<BlogPost & { tagNames: string[] } | null>
```

Portfolio single-featured pattern reference (src/db/schema.ts line 138): `isFeatured: boolean("is_featured").default(false)` — use identical column name in the Drizzle schema.

Admin form uses @/components/ui/switch (confirmed exists at src/components/ui/switch.tsx).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add is_featured column to blogPosts + push migration</name>
  <files>src/db/schema.ts</files>
  <read_first>
    - src/db/schema.ts (full file — you are modifying the blogPosts table at ~line 151-165, need full context of import order and adjacent tables)
    - drizzle.config.ts (to confirm migration approach)
  </read_first>
  <action>
    Edit src/db/schema.ts. In the `blogPosts` pgTable definition (currently at lines 151-165, ends with `updatedAt: timestamp("updated_at").defaultNow().notNull(),`), add a new column immediately BEFORE `createdAt`:

    ```ts
    isFeatured: boolean("is_featured").default(false).notNull(),
    ```

    Mirror the exact pattern used on `portfolioItems` at line 138 (`isFeatured: boolean("is_featured").default(false),`) but add `.notNull()` so downstream Drizzle selects return `boolean`, not `boolean | null`. The `boolean` import is already present (used by portfolioItems).

    Final `blogPosts` should have EXACTLY these columns in order: id, title, slug, excerpt, content, coverImageUrl, categoryId, authorId, status, publishedAt, scheduledAt, isFeatured, createdAt, updatedAt.

    After editing, run `pnpm db:push` to push the schema change to the DB. This creates the column with default false on every existing row.

    DO NOT generate a migration file — this project uses `drizzle-kit push` for rapid schema iteration (established pattern per package.json scripts).
  </action>
  <verify>
    <automated>grep -q "isFeatured: boolean(\"is_featured\").default(false).notNull()" src/db/schema.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `src/db/schema.ts` contains the line `isFeatured: boolean("is_featured").default(false).notNull(),` inside the `blogPosts` pgTable definition
    - The line appears BEFORE `createdAt` in `blogPosts`
    - `pnpm tsc --noEmit` exits 0
    - `pnpm db:push` completes successfully (applies column to DB)
  </acceptance_criteria>
  <done>`blog_posts.is_featured` column exists in DB, Drizzle schema reflects it, TypeScript compiles with no errors.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Extend updateBlogPost / createBlogPost / getBlogPost to handle isFeatured with single-featured invariant</name>
  <files>src/actions/admin-blog.ts</files>
  <read_first>
    - src/actions/admin-blog.ts (full file — you are modifying BlogPostFormData, createBlogPost, updateBlogPost, getBlogPost)
    - src/db/schema.ts (to confirm new isFeatured field shape after Task 1)
  </read_first>
  <action>
    Edit src/actions/admin-blog.ts:

    1. Add `isFeatured: boolean` to the `BlogPostFormData` interface (after `scheduledAt`):
       ```ts
       interface BlogPostFormData {
         title: string
         slug: string
         excerpt: string
         categoryId: string
         tagNames: string[]
         coverImageUrl: string | null
         content: string
         status: "draft" | "scheduled" | "published"
         scheduledAt: string | null
         isFeatured: boolean
       }
       ```

    2. In `createBlogPost`, after `await requirePermission(...)`, add the single-featured-invariant guard BEFORE the `db.insert` call:
       ```ts
       if (data.isFeatured) {
         await db.update(blogPosts).set({ isFeatured: false }).where(eq(blogPosts.isFeatured, true))
       }
       ```
       Then include `isFeatured: data.isFeatured,` in the `.values({...})` object passed to `db.insert(blogPosts)`.

    3. In `updateBlogPost`, add the same single-featured guard BEFORE the `db.update(blogPosts).set({...}).where(eq(blogPosts.id, id))` call — but exclude the current post (so flipping on doesn't immediately unflip itself):
       ```ts
       if (data.isFeatured) {
         await db.update(blogPosts)
           .set({ isFeatured: false })
           .where(and(eq(blogPosts.isFeatured, true), ne(blogPosts.id, id)))
       }
       ```
       Import `ne` from `drizzle-orm` at the top (add to existing import: `import { eq, desc, ilike, and, count, sql, ne } from "drizzle-orm"`).

       Then include `isFeatured: data.isFeatured,` in the `.set({...})` object passed to `db.update(blogPosts)`.

    4. `getBlogPost` already returns the full row via `db.query.blogPosts.findFirst` — no change needed (Drizzle auto-includes the new column). Verify that the returned shape now includes `isFeatured`.

    5. End both `createBlogPost` and `updateBlogPost` with the existing `revalidatePath("/admin/blog")` and `revalidatePath("/blog")` — already present, no change needed.
  </action>
  <verify>
    <automated>grep -q "isFeatured: boolean" src/actions/admin-blog.ts &amp;&amp; grep -q "ne(blogPosts.id, id)" src/actions/admin-blog.ts &amp;&amp; grep -q "eq(blogPosts.isFeatured, true)" src/actions/admin-blog.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `BlogPostFormData` interface contains `isFeatured: boolean`
    - `createBlogPost` un-features all other posts (`eq(blogPosts.isFeatured, true)`) when `data.isFeatured === true`, BEFORE the insert
    - `updateBlogPost` un-features other posts using `and(eq(blogPosts.isFeatured, true), ne(blogPosts.id, id))` when `data.isFeatured === true`, BEFORE the update
    - Both `.values({...})` (create) and `.set({...})` (update) include `isFeatured: data.isFeatured`
    - `ne` is imported from `drizzle-orm`
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Admin-blog actions persist `is_featured` with the single-featured invariant enforced server-side. Flipping one post to featured automatically un-features the previous featured post.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Wire "Feature on blog page" Switch into BlogPostForm</name>
  <files>src/components/admin/blog-post-form.tsx, src/app/admin/blog/[id]/edit/page.tsx</files>
  <read_first>
    - src/components/admin/blog-post-form.tsx (full file — you are adding state + UI + wiring to handleSave)
    - src/components/ui/switch.tsx (to confirm shadcn Switch API — it's a Radix Switch wrapper)
    - src/app/admin/blog/[id]/edit/page.tsx (to add isFeatured to initialData mapping)
    - src/actions/admin-blog.ts (to confirm the new BlogPostFormData.isFeatured field after Task 2)
  </read_first>
  <action>
    Edit src/components/admin/blog-post-form.tsx:

    1. Add `Switch` to imports at the top: `import { Switch } from "@/components/ui/switch"`.

    2. Extend `initialData` prop type to include `isFeatured: boolean | null`:
       ```ts
       initialData?: {
         title: string
         slug: string
         excerpt: string | null
         categoryId: string | null
         tagNames: string[]
         coverImageUrl: string | null
         content: string
         status: "draft" | "scheduled" | "published" | null
         scheduledAt: Date | string | null
         isFeatured: boolean | null
       }
       ```

    3. Add state after the existing `scheduledAt` state declaration (~line 73-79):
       ```ts
       const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
       ```

    4. In `handleSave`, include `isFeatured` in the `formData` object passed to `createBlogPost` / `updateBlogPost` (~line 130-140):
       ```ts
       const formData = {
         title,
         slug: slug || slugify(title),
         excerpt,
         categoryId,
         tagNames,
         coverImageUrl,
         content,
         status: targetStatus,
         scheduledAt: targetStatus === "scheduled" ? scheduledAt : null,
         isFeatured,
       }
       ```

    5. In the JSX, add a new form block AFTER the "Scheduled Date" block and BEFORE the "Content" block (~around line 309, before the `{/* Content */}` comment). Use this EXACT markup — copy matches UI-SPEC "Copywriting Contract":
       ```tsx
       {/* Featured on blog page */}
       <div>
         <div className="flex items-start justify-between gap-4">
           <div>
             <label htmlFor="is-featured-switch" className="block font-mono text-[13px] text-[#888888] uppercase mb-1">
               Feature on blog page
             </label>
             <p className="text-[#555555] font-sans text-[13px] max-w-md">
               Only one post can be featured at a time. Turning this on will un-feature any currently featured post.
             </p>
           </div>
           <Switch
             id="is-featured-switch"
             checked={isFeatured}
             onCheckedChange={setIsFeatured}
           />
         </div>
       </div>
       ```

    6. Also update the toast on successful save — leave the existing "Post updated" / "Post created" toast. DO NOT add a separate featured-post toast (scope creep).

    Edit src/app/admin/blog/[id]/edit/page.tsx:

    7. Add `isFeatured: post.isFeatured,` to the `initialData` object passed to `<BlogPostForm>` (~line 44-54). The full block becomes:
       ```tsx
       initialData={{
         title: post.title,
         slug: post.slug,
         excerpt: post.excerpt,
         categoryId: post.categoryId,
         tagNames: post.tagNames,
         coverImageUrl: post.coverImageUrl,
         content: post.content,
         status: post.status,
         scheduledAt: post.scheduledAt,
         isFeatured: post.isFeatured,
       }}
       ```

    The admin create page (src/app/admin/blog/new/page.tsx) does NOT pass initialData, so the form will default `isFeatured` to `false` via the `?? false` fallback — no change required there.
  </action>
  <verify>
    <automated>grep -q "Feature on blog page" src/components/admin/blog-post-form.tsx &amp;&amp; grep -q "isFeatured" src/components/admin/blog-post-form.tsx &amp;&amp; grep -q "isFeatured: post.isFeatured" src/app/admin/blog/\[id\]/edit/page.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `src/components/admin/blog-post-form.tsx` imports `Switch` from `@/components/ui/switch`
    - Form contains `const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)`
    - JSX contains the exact label text `Feature on blog page`
    - JSX contains the exact helper text `Only one post can be featured at a time. Turning this on will un-feature any currently featured post.`
    - `formData` passed to createBlogPost/updateBlogPost includes `isFeatured,`
    - `src/app/admin/blog/[id]/edit/page.tsx` includes `isFeatured: post.isFeatured` in the initialData object
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>Admin can toggle "Feature on blog page" on any post-edit page. On save, the post is marked featured and all other featured posts are cleared.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Manually: open /admin/blog/{id}/edit, flip the toggle, save — DB shows only that post with `is_featured=true`
</verification>

<success_criteria>
- `blog_posts.is_featured` column exists in DB (default false, not null)
- Drizzle schema reflects `isFeatured: boolean` (non-nullable)
- `updateBlogPost` + `createBlogPost` enforce single-featured invariant server-side
- Admin post-edit form has a working Switch toggle with exact copy from UI-SPEC
- All downstream plans (05 hero banner, 06 blog page integration) can query for the featured post via `eq(blogPosts.isFeatured, true)`
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-01-SUMMARY.md` documenting: new schema column, updated action signatures, and the single-featured invariant behavior.
</output>
