---
phase: 10-blog
plan: 01
status: complete
---

# Plan 10-01 Summary — Featured schema + admin toggle

## What shipped

- `blog_posts.is_featured` boolean column (default false, not null) added via raw `ALTER TABLE` (drizzle-kit push/generate hit tooling bugs — column verified live in DB).
- `BlogPostFormData.isFeatured: boolean` added to `src/actions/admin-blog.ts`.
- `createBlogPost` and `updateBlogPost` enforce single-featured invariant server-side (`updateBlogPost` excludes current post via `ne(blogPosts.id, id)`).
- Admin BlogPostForm has a `Switch` labelled "Feature on blog page" with helper copy from UI-SPEC.
- Edit page passes `isFeatured` through to the form's initial data.

## Key files

created: []
modified:
  - src/db/schema.ts
  - src/actions/admin-blog.ts
  - src/components/admin/blog-post-form.tsx
  - src/app/admin/blog/[id]/edit/page.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
- `information_schema.columns` confirms `blog_posts.is_featured boolean NOT NULL DEFAULT false`.
