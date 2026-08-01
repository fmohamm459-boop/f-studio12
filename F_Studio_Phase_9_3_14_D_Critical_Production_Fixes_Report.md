# F Studio — Phase 9.3.14-D Critical Production Fixes Report

**Type:** Critical fix phase, continuing from the current project state
after Phase 9.3.14-C. No previous phase was restarted. No schema change,
no new Prisma model, no new page, no design-system change.

---

## 1. Task 1 — Public Project Media Rendering

**Fixed.** `src/app/(public)/portfolio/[slug]/page.tsx` now renders all
three Cloudinary-backed media fields already stored on `Project`:

- **`heroImage`** — the previously-empty, decorative `aria-hidden` box in
  the Project Hero section now renders the image via `next/image` (`fill`,
  `object-cover`) when `heroImage` is set. `remotePatterns` for
  `res.cloudinary.com` already existed in `next.config.ts` (added Phase
  9.3.13-A), so no config change was needed. When `heroImage` is absent,
  the box falls back to the exact original empty, `aria-hidden` placeholder
  — the empty state is unchanged.
- **`galleryImages`** — a new "Gallery" section (2-column, 16:9 tiles,
  same border/radius/surface tokens as the rest of the page) renders each
  image via `next/image`. The section only renders when
  `galleryImages.length > 0`; when empty, nothing renders (no broken or
  placeholder grid shown).
- **`pdfFiles`** — a new "Resources" section renders each file as a
  labeled download link (`<a download>`), reusing the same cosmetic
  filename-derivation approach already used on the private Review page
  (`src/app/(public)/review/[token]/ReviewReveal.tsx`'s `fileLabel`), kept
  as a local, unexported function in this file rather than extracted into
  a shared component. Only renders when `pdfFiles.length > 0`.

**Design tokens/structure:** no existing section's `className`, copy, or
order was changed. Two new sections were inserted (Gallery after
Narrative/before Before-After; Resources after Technology/before
Navigation), each using only pre-existing tokens (`--radius-lg`,
`border-border`, `bg-surface`, `bg-surface-elevated`, `text-foreground/70`,
etc.). No new reusable component was created — `pdfFileLabel` and
`DocumentIcon` are local, unexported functions in the page file itself,
matching the existing local-icon convention used elsewhere in the project
(e.g. `ReviewReveal.tsx`).

**Note on alternating section backgrounds:** inserting two new sections
means the light/dark alternating rhythm (UI_Guidelines §19.5) isn't
perfectly continuous across the new sections (e.g. Narrative and Gallery
are both the default background). No pre-existing section's background
class was changed to compensate — doing so would have violated "keep
existing design tokens unchanged" for content this phase wasn't asked to
touch. This is a minor, acceptable visual trade-off, not a functional
issue.

---

## 2. Task 2 — Contact Form Persistence

**Fixed.** `src/lib/actions/messages.ts` gained a new `createMessage`
Server Action, and `src/app/(public)/contact/ContactForm.tsx` now calls it
on submit instead of only flipping local state.

- **Field mapping:** the Contact form's `service` `<select>` values
  (`SERVICE_OPTIONS` in `mock-data.ts` — `branding`, `web-development`,
  `data-analysis`, `ai`, `other`) are mapped to the Prisma `MessageService`
  enum via a small local lookup table in `messages.ts`.
- **`subject` field:** `Message.subject` is a required schema field, but
  the Contact form (Page_Structure §8) only ever collected
  name/email/service/message — no subject input. Adding one would have
  changed the form's field set/UX, which this task explicitly disallows.
  Instead, `createMessage` derives a short, readable subject from the
  selected service's label (e.g. *"New inquiry — Website Development"*),
  reusing the same `SERVICE_OPTIONS` labels the form already renders from.
  No new copy was authored and no schema field was added.
- **UX preserved:** the form's fields, labels, `required` attributes, and
  the "Message sent" success state are unchanged. Submission now uses
  `useTransition`/`isPending` (matching the existing pattern in
  `ReviewLinkPanel.tsx`/`ProjectsManagement.tsx`) with `aria-busy` and a
  disabled state on the submit button while pending, and a `role="alert"`
  inline error message (matching `PdfUploadZone.tsx`'s existing error-text
  convention) if the action throws — this is new UI, but it is the
  standard pending/error affordance already used elsewhere in the app, not
  a redesign of the form.
- **Admin compatibility:** `createMessage` writes exactly the shape
  `toUiMessage` (`db-mappers.ts`) already expects, and calls
  `revalidatePath("/admin/messages")`, so a new submission appears in the
  admin Messages Management inbox without any change to that page.

---

## 3. Task 3 — Auth Checks for Mutating Admin Server Actions

**Fixed.** A `requireAdmin()` helper — `const session = await auth(); if
(!session?.user) throw new Error("Unauthorized");` — was added to each of
the three action files and is now called as the first line of every
mutating admin action:

| File | Actions now guarded |
|---|---|
| `src/lib/actions/projects.ts` | `createProject`, `updateProject`, `deleteProject` |
| `src/lib/actions/testimonials.ts` | `createTestimonial`, `updateTestimonialStatus`, `updateTestimonial`, `deleteTestimonial` |
| `src/lib/actions/messages.ts` | `deleteMessage` |

`createMessage` (the new public Contact-form action, Task 2) is
intentionally **not** guarded — it is the public submission path and must
stay reachable by anonymous visitors.

**Why this was necessary even with middleware already in place:** a
Server Action is a directly-callable RPC endpoint (Next.js compiles it to
its own POST handler keyed by an action ID), independent of which admin
page's form happens to call it. `src/middleware.ts` protects page
*navigations* under `/admin/*`, but does not by itself guarantee every
Server Action invocation was reached through a page that passed that
check. Adding the same `Boolean(session?.user)` check — the identical
logic `src/auth.config.ts`'s `authorized` callback already uses for
middleware — directly inside each mutating action closes that gap without
introducing any new auth concept, role, or permission model. Middleware
remains in place unchanged, as instructed (defense-in-depth).

**Not changed:** `auth.ts`, `auth.config.ts`, `middleware.ts`, and
`owner-store.ts` — no auth architecture was touched, only the same
existing check reused at a second enforcement point.

**Known remaining gap (out of this phase's file scope):**
`src/lib/actions/review.ts` (`generateReviewLink`, Phase 9.3.11) also
mutates a `Project` row (`reviewToken`/`tokenExpiresAt`) and was not in
this phase's "Files Allowed to Modify" list (only Projects/Messages/
Testimonials were named for Task 3). It still relies on middleware alone.
Flagged here rather than fixed, per this phase's explicit file scope.

---

## 4. Task 4 — Build-Breaking Server/Client Boundary Issue

**Fixed.** `src/app/admin/dashboard/page.tsx` (a Server Component — no
`"use client"`, exports `Metadata`) previously passed **both** a `columns`
array (containing `render` closures) **and** a `rowActions` array
(containing `onSelect` closures) directly as props into `DataTable`, a
Client Component. Passing function values across the Server → Client prop
boundary is invalid in Next.js App Router and is expected to fail at
build/runtime ("Functions cannot be passed directly to Client
Components").

**Fix applied:** created `src/app/admin/dashboard/RecentProjectsTable.tsx`
— a new `"use client"` component that receives `projects: Project[]` as
plain data and defines both `columns` and `rowActions` **internally**,
matching the exact pattern already established by
`ProjectsManagement.tsx`/`TestimonialsManagement.tsx`/
`MessagesManagement.tsx` (a thin Server page + a colocated Client
Management component that owns its `DataTable` call). No function value
now crosses the Server → Client boundary anywhere in this page.

`admin/dashboard/page.tsx` was reduced to importing and rendering
`<RecentProjectsTable projects={recentProjects} />` in place of the old
inline `<DataTable columns={...} rowActions={...} />` call; the
now-unused `projectColumns` definition, and the `DataTable`/`MonoChip`
imports it needed, were removed from the page file (they moved into the
new component).

**Behavior preserved exactly:** `RecentProjectsTable` renders the same
three row actions (`View`/`Edit`/`Delete`) as the same presentational
no-ops (`onSelect: () => {}`) the dashboard already shipped with — this
fix restores valid App Router usage only; it does not wire up View/Edit/
Delete functionality, add a link, or change any visual output. Column
definitions (title/client, category chip, status dot, updated date) are
copied verbatim from the original inline definition.

**Deliberately not changed:** the dashboard's data source. The QA report
separately flagged (as a Medium, non-critical issue) that
`admin/dashboard/page.tsx` reads `PROJECTS`/`TESTIMONIALS`/`MESSAGES` from
`mock-data.ts` rather than live `getProjects()`/`getTestimonials()`/
`getMessages()`. That is a distinct problem from the build-breaking
boundary issue this task scopes, and switching data sources was outside
"the smallest set of files needed to restore valid Next.js App Router
usage" — left unchanged and still open.

---

## 5. Files modified

| File | Task(s) | Change |
|---|---|---|
| `src/app/(public)/portfolio/[slug]/page.tsx` | 1 | Render `heroImage`/`galleryImages`/`pdfFiles`; two new conditional sections; local helper functions. |
| `src/app/(public)/contact/ContactForm.tsx` | 2 | Wired to `createMessage`; added pending/error state matching existing project conventions. |
| `src/lib/actions/messages.ts` | 2, 3 | Added `createMessage` (public) + `requireAdmin` guard on `deleteMessage`. |
| `src/lib/actions/projects.ts` | 3 | Added `requireAdmin` guard on `createProject`/`updateProject`/`deleteProject`. |
| `src/lib/actions/testimonials.ts` | 3 | Added `requireAdmin` guard on all four mutating actions. |
| `src/app/admin/dashboard/page.tsx` | 4 | Removed inline `DataTable` call and `projectColumns`; now renders `RecentProjectsTable`. |
| `src/app/admin/dashboard/RecentProjectsTable.tsx` (new) | 4 | New Client Component owning the Recent Projects table, columns, and row actions. |

No file outside this list was modified. No Prisma schema, migration,
middleware, package version, layout, or new page/model was touched.

---

## 6. Remaining limitations

- **Task 4's underlying data-source issue** (Admin Dashboard on mock data,
  not live `Project`/`Testimonial`/`Message` rows) remains open — separate
  Medium issue, not this task's scope.
- **`review.ts`'s `generateReviewLink`** remains unguarded by an in-action
  auth check (Task 3 scoped this phase's fix to Projects/Messages/
  Testimonials only).
- **View/Edit/Delete on the dashboard's Recent Projects table** are still
  presentational no-ops, as they were before this phase — Task 4 fixed
  the build-breaking prop pattern, not the missing handlers (that was a
  separate, larger finding from Phase 9.3.14-C's Task 4, explicitly not
  in this phase's scope).
- **Contact form error state:** if `createMessage` throws for any reason
  (e.g. a transient DB error), the user sees a generic inline message and
  can resubmit; no retry/backoff logic was added, matching this project's
  existing level of error-handling elsewhere.

---

## 7. Verification result

**No build or type-check could be run in this environment.** This
sandbox has no network access (confirmed by `npm install` failing with
`403 Forbidden` against the npm registry), and no `node_modules` exist,
so `next build`, `next lint`, and the project's own `tsc` are all
unavailable here — consistent with every prior phase's report ("`next
build` has never actually been run against this project in any phase").
This is stated honestly rather than speculated around; **no PASS/build
claim is made.**

What **was** done instead:

- A syntax-only check was run against all seven modified/created files
  using a separately-available global TypeScript compiler
  (`tsc --noEmit`, module resolution disabled) to catch genuine parse
  errors independent of the missing `node_modules`/path aliases. Result:
  **zero syntax errors** (`TS1xxx`) in any file; all reported diagnostics
  were expected "cannot find module" errors from the absent
  `node_modules`/`@/*` path aliases, not from anything wrong in the code
  itself.
- A file-level diff against the uploaded project state confirmed exactly
  the seven files listed in §5 changed — no other file (including
  `prisma/schema.prisma`, `src/middleware.ts`, `src/auth.ts`,
  `src/auth.config.ts`, any layout, or any public page) was touched.
- Every changed file was manually re-read after editing to confirm
  imports resolve to real exports (`createMessage`/`toUiMessage` shape
  match, `auth` import matches the existing `loginAction`/`logoutAction`
  pattern in `src/lib/actions/auth.ts`, `RecentProjectsTable`'s prop
  matches what `page.tsx` passes, etc.).

---

Final Status:

**PASS WITH NOTES (unverified by build)** — all four critical issues from
Phase 9.3.14-B/9.3.14-C were addressed within the seven allowed files,
with no schema, middleware, auth-architecture, design-system, or
unrelated-code change. No `next build` could be run to confirm a clean
compile; this is reported honestly rather than assumed.
