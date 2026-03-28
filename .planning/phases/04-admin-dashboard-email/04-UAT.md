---
status: testing
phase: 04-admin-dashboard-email
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md, 04-07-SUMMARY.md, 04-08-SUMMARY.md]
started: 2026-03-27T12:00:00Z
updated: 2026-03-27T12:00:00Z
---

## Current Test

number: 1
name: Admin Access & Sidebar Navigation
expected: |
  Navigate to /admin. If logged in as admin, you see the AdminShell with a tile-based sidebar listing sections: Overview, Content (Blog, Services, Team, Testimonials), Commerce (Beats, Bundles), Operations (Bookings, Rooms, Packages, Availability), Communication (Inbox, Newsletter), Settings (Site Settings, Homepage, Roles). Clicking each tile navigates to the correct page.
awaiting: user response

## Tests

### 1. Admin Access & Sidebar Navigation
expected: Navigate to /admin. If logged in as admin, you see the AdminShell with a tile-based sidebar listing sections: Overview, Content (Blog, Services, Team, Testimonials), Commerce (Beats, Bundles), Operations (Bookings, Rooms, Packages, Availability), Communication (Inbox, Newsletter), Settings (Site Settings, Homepage, Roles). Clicking each tile navigates to the correct page.
result: [pending]

### 2. Dashboard Overview Stats
expected: The /admin overview page shows stat tiles with counts (total beats, bookings, clients, revenue or similar metrics) and a recent activity feed below.
result: [pending]

### 3. Media Library Upload & Browse
expected: Go to /admin/media. Upload an image file. It appears in the grid. You can switch between grid and list view, search by filename, and click a media item to see its detail sheet with URL and metadata.
result: [pending]

### 4. Blog Post Create & Publish
expected: Go to /admin/blog, click New Post. The Tiptap rich text editor loads with formatting toolbar (bold, italic, headings, links, code blocks). You can insert an image via the media picker dialog. Set title, category, tags, and status to "published". Save and the post appears in the blog post list with correct status badge.
result: [pending]

### 5. Blog Draft & Schedule Flow
expected: Create a blog post with status "draft". It shows as Draft in the list. Edit it, change status to "scheduled" and pick a future date. It shows as Scheduled. The post is not visible publicly until the scheduled time.
result: [pending]

### 6. Blog Category & Tag Management
expected: Go to /admin/blog/categories. Create a new category. Create tags. Both appear in the blog post form's category/tag selectors.
result: [pending]

### 7. Service Page Management
expected: Go to /admin/services. Existing services from Phase 1 are listed. You can edit a service's details. Services with active bookings cannot be hard-deleted (soft-delete safety).
result: [pending]

### 8. Team Member CRUD
expected: Go to /admin/team. Add a new team member with name, role, bio, and photo. They appear in the list. Edit and delete work.
result: [pending]

### 9. Testimonial Management
expected: Go to /admin/testimonials. Add a testimonial with client name, text, and star rating. It appears in the list. Edit via dialog works.
result: [pending]

### 10. Client List with Guests
expected: Go to /admin/clients. The list shows registered users AND guest purchasers/bookers (from Stripe or booking without account). Click a client to see their detail sheet with purchase/booking history.
result: [pending]

### 11. Site Settings
expected: Go to /admin/settings. Form shows site-wide settings (site name, description, contact email, social links, etc.). Changes save and persist on reload.
result: [pending]

### 12. Roles & Permissions
expected: Go to /admin/roles. See a permission grid showing roles vs permissions. You can modify which permissions each role has. Team member table shows current admin users and their roles.
result: [pending]

### 13. Contact Inbox
expected: Go to /admin/inbox. See contact form submissions with read/unread state (unread have visual indicator). Click a message to open detail sheet. Mark as read. Reply via email sends through Resend with correct replyTo header.
result: [pending]

### 14. Newsletter Compose & Send
expected: Go to /admin/newsletter, click Compose. The Tiptap editor loads for composing the newsletter. You can select a segment (all subscribers, purchasers, etc.), preview the email, and send. Broadcast appears in history with status and delivery stats.
result: [pending]

### 15. Subscriber Management & Unsubscribe
expected: Go to /admin/newsletter/subscribers. See subscriber list with tags and search. Public unsubscribe page (/unsubscribe?token=...) works — clicking unsubscribe link in email removes the subscriber.
result: [pending]

### 16. Homepage Editor
expected: Go to /admin/settings/homepage. See homepage sections as draggable tiles. Drag to reorder. Toggle visibility on/off. Edit hero section content and featured beat/service selection. Save changes.
result: [pending]

### 17. Dynamic Public Homepage
expected: Visit the public homepage (/). It renders sections in the order configured in the admin homepage editor. Hidden sections don't appear. Featured content matches what was selected in admin. If no DB config exists, falls back to hardcoded defaults.
result: [pending]

## Summary

total: 17
passed: 0
issues: 0
pending: 17
skipped: 0
blocked: 0

## Gaps

[none yet]
