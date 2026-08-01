# F Studio — Phase 9.3.14-B Functional Test Report
## Functional Testing & System Validation

**Type:** Testing & validation only. No source code was modified. As
instructed, no bug was fixed in this phase — every finding below is
reported, not patched.

---

## 0. Methodology (read this before the results)

This sandbox has **no installed dependencies** (`node_modules` absent,
no network access to install them), **no configured database**
(no `DATABASE_URL`, no `.env`), and **no way to run a dev server or a
browser**. Confirmed directly: `curl` to the npm registry returns
`403 host_not_allowed`, and there is no `.env` file in the project.

Because of this, **no test in this report was performed by running the
application.** Every result below comes from **static code-path
tracing** — reading the actual source, following each route/action/
query end-to-end by hand, and reasoning about what the code would do
for a given input. Where this report says "PASS," it means *"verified
correct by tracing the code,"* not *"observed working in a browser."*
Where a claim would require runtime behavior this method can't fully
settle (e.g., exact Server Action HTTP-dispatch semantics, real render
timing, measured contrast ratios), that uncertainty is stated
explicitly rather than asserted as fact.

This is the same constraint every prior phase in this project has
already disclosed (`npm install`/`build` were deferred since Phase
9.3.13-A) — nothing new was assumed silently here.

---

## 1. Scope

Validated the project as delivered after Phase 9.3.14-A Fixes (Home
data integration, public layout de-duplication, tsbuildinfo cleanup).
No previous phase was restarted. No feature was added, no file was
refactored, and no schema/auth/middleware/upload/design/package change
was made. Source of truth priority followed as instructed:
`Page_Structure.md` → `Component_List.md` → `UI_Guidelines.md` →
Decision Records → current project.

---

## 2. Test checklist & PASS/FAIL table

### Test Group 1 — Public Website

| Check | Result | Notes |
|---|---|---|
| Home renders, nav/buttons/links resolve to real routes | ✅ PASS | All `<Button href>` targets (`/contact`, `/portfolio`, `/services`) are real routes; verified after Fix 1 |
| Home reads live DB data | ✅ PASS | Confirmed fixed in 9.3.14-A; re-verified this phase — `getProjects()`/`getTestimonials()` |
| Home empty states (no projects/testimonials) | ✅ PASS | Sections conditionally omitted, verified in 9.3.14-A fix |
| About, Services, Brand Identity | ✅ PASS | Static content, no data dependency, links resolve |
| Portfolio: filter/search, empty ("no results") state | ✅ PASS | `PortfolioBrowser.tsx` renders a "Clear filters" empty state, confirmed in code |
| Portfolio: loading state | ⚠️ N/A | Page is server-rendered (`force-dynamic`); filtering is instant client-side array filtering with no network round-trip, so no skeleton is needed — not a defect |
| Portfolio Details: hero, metadata, narrative, tags, next-project link | ✅ PASS (partial — see Critical C-1) | Text-based sections render correctly; **media does not** — see §3 |
| Testimonials, Contact | ✅ PASS (Contact — see Critical C-2 re: submission) | Pages render; Contact form's actual submission is broken (§3) |
| Client Review (static) | ⚠️ PASS WITH NOTES | Renders; submission doesn't persist (pre-existing, documented — §5 Medium) |
| Metadata (title/description/OG/Twitter) on all 8 static pages + `[slug]` | ✅ PASS | Re-verified directly; all 8 pages + dynamic route have complete blocks (9.3.13-A/B) |
| Responsive classes (`sm:`/`lg:` breakpoints) present throughout | ✅ PASS | Consistent grid/flex responsive utility usage across all reviewed pages |
| RTL (`rtl:`/`ltr:` variants, logical properties) | ✅ PASS WITH NOTES | No physical-property misuse found; `dir` is hardcoded `ltr` with no locale switch — pre-existing, documented, not new |

### Test Group 2 — Portfolio

| Check | Result | Notes |
|---|---|---|
| Published project renders | ✅ PASS | `status !== "Published"` guard confirmed intact after 9.3.14-A |
| Draft project → 404 | ✅ PASS | Same guard; both `generateMetadata` and the page body call `notFound()` |
| "Hidden" project | ⚠️ N/A | No such state exists — `ProjectStatus` is only `DRAFT`/`PUBLISHED` (confirmed in `prisma/schema.prisma`). "Hidden" is a `Testimonial` status, not a `Project` status — test item doesn't map to an actual system state |
| Slug routing / 404 for unknown slug | ✅ PASS | `!project` branch, unchanged, calls `notFound()` |
| Project Details narrative/metadata | ✅ PASS | Renders `project.overview/challenge/research/solution`, client/category/year/role |
| Next Project | ✅ PASS | `allProjects[(index + 1) % allProjects.length]` — correctly wraps to the first project after the last |
| **Hero Image rendering** | ❌ **FAIL (Critical, C-1)** | Not rendered anywhere — see §3 |
| **Gallery rendering** | ❌ **FAIL (Critical, C-1)** | Not rendered anywhere — see §3 |
| **PDF download** | ❌ **FAIL (Critical, C-1)** | Not rendered anywhere — see §3 |
| Cloudinary URLs (persisted correctly) | ✅ PASS | `Project.heroImage`/`galleryImages`/`pdfFiles` correctly populated by `createProject`/`updateProject` — the data exists, it's just never displayed publicly |

### Test Group 3 — Admin

| Check | Result | Notes |
|---|---|---|
| Login | ✅ PASS | Credentials provider, `verifyOwnerCredentials`, redirect on success |
| Logout | ✅ PASS | `logoutAction` → `signOut({ redirectTo: "/admin/login" })`, wired in `SideNavBar.tsx` |
| Owner Setup | ✅ PASS | `hasOwner()` gate at both the page and the action level; one-time only |
| Dashboard | ⚠️ PASS WITH NOTES | Renders; still reads `PROJECTS`/`TESTIMONIALS`/`MESSAGES` from `mock-data.ts` (same pattern Home had before 9.3.14-A Fix 1) — flagged in the prior audit, explicitly Forbidden to touch this phase too; restated as still-open (Medium, M-1) |
| Projects CRUD | ✅ PASS (data layer) / ❌ **FAIL (Critical, C-3 — auth)** | Create/Update/Delete all correctly touch only approved fields; **none of the three actions verify a session themselves** — see §3 |
| Messages: Read | ✅ PASS | `getMessages()` reads live rows |
| Messages: Create | ❌ **FAIL (Critical, C-2)** | No code path anywhere creates a `Message` row — see §3 |
| Messages: Delete | ✅ PASS (data layer) / ❌ **FAIL (Critical, C-3 — auth)** | Deletes correctly; no session check in the action itself |
| Testimonials CRUD | ✅ PASS (data layer) / ❌ **FAIL (Critical, C-3 — auth)** | Same as Projects — functionally correct, but no in-action auth check |
| Settings | ✅ PASS | UI/config-only, matches Decision Record 001 exactly (no Settings model, none expected) |
| Session expiration | ⚠️ PASS WITH NOTES | No explicit `session.maxAge` is set in `auth.config.ts`; Auth.js v5 defaults to a 30-day JWT session. Not a bug — just worth confirming this default is the intended session lifetime (Low, L-1) |
| Protected routes (middleware) | ✅ PASS | `/admin/:path*` matcher + `PUBLIC_ADMIN_PATHS` allowlist, confirmed correct |
| Unauthorized access to admin pages | ✅ PASS | Redirects to `/admin/login` |
| **Unauthorized access to admin Server Actions directly** | ❌ **FAIL (Critical, C-3)** | See §3 |

### Test Group 4 — Upload System

| Check | Result | Notes |
|---|---|---|
| Hero Image upload (signed, direct-to-Cloudinary) | ✅ PASS | `getUploadSignature` (session-gated), `UploadZone` XHR flow |
| Gallery upload | ✅ PASS | Same `UploadZone`, append semantics |
| PDF upload | ✅ PASS | Same `UploadZone`, `/auto/upload` endpoint |
| Cloudinary integration / signature correctness | ✅ PASS | Only `{ timestamp, folder }` signed; matches Cloudinary's signed-upload contract |
| `secure_url` persistence | ✅ PASS | Only `.secure_url` is read from the Cloudinary response and stored; no other Cloudinary metadata persisted (matches schema: plain `String`/`String[]` fields) |
| Preview | ✅ PASS | Draft state shows thumbnails/file chips before Save |
| Delete (remove from draft) | ✅ PASS | Removes the URL from the array/field on Save |
| Delete (remove from Cloudinary itself) | ⚠️ PASS WITH NOTES | Confirmed **not** implemented — pre-existing, already documented in the 9.3.12 Stage 2 report as a known limitation, not new (Low, L-2) |
| Replace (Hero Image) | ✅ PASS | `maxFiles={1}` + replace semantics |
| Progress | ✅ PASS | XHR `upload.onprogress` wired to a visible progress indicator |
| Error handling | ✅ PASS | try/catch around the signed upload, error state surfaced in the UI |

### Test Group 5 — Client Review

| Check | Result | Notes |
|---|---|---|
| Token links (`/review/[token]`) | ✅ PASS | `validateReviewToken` looks up by `reviewToken`, unique per project |
| Expired token | ✅ PASS | `tokenExpiresAt < new Date()` → treated as invalid |
| Invalid/unknown token | ✅ PASS | `!project` → same "no longer available" state as expired (both share one message — a deliberate, acceptable UX simplification, not a bug) |
| **Successful review submission** | ⚠️ **N/A by design** | `/review/[token]` is **presentation-only** — confirmed no feedback form exists on this route at all (its own header comment says so explicitly: "this route is the presentation side"). This matches Decision Record 002 exactly, which describes the full submit-feedback flow as **future scope, not implemented now**. Not a defect. |
| **Duplicate submission prevention** | ⚠️ **N/A by design** | No submission exists to duplicate, on this route or (functionally) on the static `/client-review` page (see Medium, M-2) |

### Test Group 6 — Database

| Check | Result | Notes |
|---|---|---|
| Prisma schema / mapping consistency | ✅ PASS | Exactly 3 models; `db-mappers.ts` covers every enum value both directions |
| Project CRUD | ✅ PASS (functionality) / ❌ FAIL (auth, C-3) | See Test Group 3 |
| Testimonial CRUD | ✅ PASS (functionality) / ❌ FAIL (auth, C-3) | See Test Group 3 |
| Message CRUD | ❌ **FAIL (Critical, C-2 + C-3)** | No Create path exists at all; Delete has no in-action auth check |
| Cloudinary URL fields | ✅ PASS | Plain `String`/`String[]`, `secure_url`-only, consistent with Test Group 4 |

### Test Group 7 — SEO

| Check | Result | Notes |
|---|---|---|
| Metadata (title/description) | ✅ PASS | All 8 static pages + `[slug]` |
| OpenGraph / Twitter Cards | ✅ PASS | Same 9 sources, complete |
| Sitemap | ✅ PASS | `sitemap.ts` — 8 static routes + `PUBLISHED`-only project slugs |
| Robots | ✅ PASS | `robots.ts` — disallows `/admin`, `/review`, `/api/auth` |
| 404 page | ✅ PASS | `not-found.tsx`, `robots: noindex,nofollow` |
| Error page | ✅ PASS | `error.tsx`, client boundary, `reset()` recovery |
| Canonical consistency | ⚠️ PASS WITH NOTES | No `alternates.canonical` anywhere in the app — pre-existing, already flagged in 9.3.13-A/9.3.14-A, restated as still open (Low, L-3) |

### Test Group 8 — Accessibility

| Check | Result | Notes |
|---|---|---|
| Single `<h1>` per page | ✅ PASS | Verified by direct count on every page; `/review/[token]`'s two `<h1>`s sit in mutually exclusive branches |
| Landmarks (no duplicates) | ✅ PASS | Confirmed fixed in 9.3.14-A Fix 2 — one `<header>`/`<main>`/`<footer>` per public page now, re-verified this phase |
| Keyboard navigation | ✅ PASS WITH NOTES | All interactive elements are real `<button>`/`<a>`/form controls (no `<div onClick>` patterns found); full keyboard operability follows from that, though actual tab order can't be dynamically confirmed without a browser |
| Focus visibility | ✅ PASS | `focus-visible:` classes present on `Button`, `Input`, `Select`, `Textarea`, `DataTable` row actions |
| ARIA labels | ✅ PASS | `aria-hidden` on decorative icons, `aria-sort`/`scope="col"` on tables, `role="dialog"` on modals, `role="status"`/`"alert"` patterns present |
| Color contrast | ⚠️ PASS WITH NOTES | Can't be numerically measured without rendering, but the token palette (`--foreground` on `--background`/`--surface`, `--primary` teal on `--primary-foreground`) matches what UI_Guidelines specifies; no ad hoc colors found outside the token set |
| 44px touch targets | ✅ PASS | `min-h-[44px]` confirmed on `Button`, form controls, table row actions |
| RTL compatibility | ✅ PASS WITH NOTES | Same as Test Group 1 — architecturally sound, not yet switchable at runtime (pre-existing, documented) |

---

## 3. Critical issues

### C-1 — Public Project Details page never renders uploaded media
- **Description:** `Project.heroImage`, `Project.galleryImages`, and
  `Project.pdfFiles` are correctly captured, uploaded to Cloudinary, and
  persisted (Test Group 4 — all PASS), but the public-facing case study
  page never displays any of them. The "Project Hero" section renders a
  static empty `aria-hidden` placeholder `<div>` instead of the real
  hero image; there is no Gallery section at all; there is no PDF
  download link anywhere on the page.
- **Affected files:** `src/app/(public)/portfolio/[slug]/page.tsx`
  (confirmed: no `next/image`, no `heroImage`/`galleryImages`/
  `pdfFiles` reference anywhere in its JSX body — only `heroImage` is
  read, and only for OpenGraph metadata). No Gallery/Hero/PDF display
  component exists anywhere in `src/components/` either — this was
  never built, not merely disconnected.
- **Root cause:** the public Project Details page was built (its static
  placeholder boxes never replaced) before Phase 9.3.12 (File & Media
  Management) added these three fields; Phase 9.3.12 wired uploads into
  the **admin editor only** and never revisited the public page that
  was supposed to display the result.
- **Recommended fix (not applied this phase):** replace the empty
  placeholder hero `<div>` with a real image (`next/image` — Cloudinary
  `remotePatterns` already configured, Phase 9.3.13-A) when
  `project.heroImage` exists, add a Gallery section rendering
  `project.galleryImages`, and add a download link/list for
  `project.pdfFiles` — as a scoped, explicitly approved follow-up phase,
  since this touches "Public page design."

### C-2 — Contact form never persists anything; Messages has no Create path at all
- **Description:** the public Contact form is entirely client-side —
  its own header comment says so directly ("This phase has no API
  routes... submission is handled entirely client-side... wiring to a
  real POST /api/messages route is left to Data Integration"). Phase
  9.3.9 (Database Integration) gave `Message` full read access
  (`getMessages()`) and delete access (`deleteMessage`) but **never**
  added a create action — confirmed by searching the entire codebase
  for `prisma.message.create`: zero matches. A real visitor's contact
  submission is never saved anywhere; the admin Messages inbox can only
  ever show manually-seeded rows.
- **Affected files:** `src/app/(public)/contact/ContactForm.tsx`,
  `src/lib/actions/messages.ts` (only exports `deleteMessage` — no
  `createMessage`).
- **Root cause:** the "no API routes" constraint from an early phase
  was resolved for Project/Testimonial via Server Actions in Phase
  9.3.9, but Message was left behind — likely an oversight, since
  Message is the one model with the narrowest CRUD surface by design
  ("Read + Delete ONLY per this phase's approved CRUD scope," per its
  own comment) — but that scope decision appears to have been made
  without separately addressing how a message would ever get created in
  the first place.
- **Recommended fix (not applied):** add a `createMessage` Server
  Action (mirroring `createTestimonial`'s shape) and wire
  `ContactForm.tsx`'s `handleSubmit` to call it, as an explicitly
  scoped follow-up phase.

### C-3 — Mutating admin Server Actions have no authentication check of their own
- **Description:** `createProject`, `updateProject`, `deleteProject`
  (`src/lib/actions/projects.ts`), `deleteMessage`
  (`src/lib/actions/messages.ts`), and `createTestimonial`,
  `updateTestimonialStatus`, `updateTestimonial`, `deleteTestimonial`
  (`src/lib/actions/testimonials.ts`) — **8 mutating Server Actions in
  total** — contain **no call to `auth()`** anywhere in their bodies.
  They rely entirely on Next.js Middleware's path-based matcher
  (`/admin/:path*`) to gate access indirectly, by protecting the *page*
  that calls them.
- **Why this is Critical, not just a style gap:** this exact risk is
  already identified and mitigated **elsewhere in this same codebase**.
  `generateReviewLink`/`getReviewLink` (`src/lib/actions/review.ts`) and
  `getUploadSignature` (`src/lib/actions/media.ts`) **do** call
  `auth()` and throw if there's no session — and `review.ts`'s own
  comment explains exactly why: *"Server Actions are not covered by
  middleware's `/admin/:path*` matcher unless invoked from a matched
  admin page."* That reasoning applies identically to the 8 actions
  listed above, but it was never applied to them. Confirmed by grepping
  every file in `src/lib/actions/` for `auth()`: only `media.ts` and
  `review.ts` contain it. `src/lib/actions/owner.ts` shows the same
  self-check pattern too (re-verifying `hasOwner()` inside the action,
  not just relying on the page).
- **Affected files:** `src/lib/actions/projects.ts`,
  `src/lib/actions/messages.ts`, `src/lib/actions/testimonials.ts`.
- **Root cause:** an inconsistently-applied defense-in-depth pattern —
  three of the codebase's mutating/sensitive Server Action files
  self-check (`media.ts`, `review.ts`, `owner.ts`); the other two don't
  (`projects.ts`, `messages.ts`, `testimonials.ts`), seemingly because
  the self-checking ones were added in a later phase (9.3.10-A/9.3.11/
  9.3.12) by someone who'd already reasoned through this exact gap for
  that phase's own new actions, without a pass back over the earlier
  (9.3.9) Project/Testimonial/Message actions to apply the same fix.
- **Caveat (methodology):** this could not be dynamically verified in
  this sandbox — there is no running server to actually attempt an
  unauthenticated Server Action call against. The finding is based on
  the code itself: an authentication check is present in some mutating
  actions and absent in others, and the absent ones have no
  independent gate against `auth()` anywhere in their call chain. This
  is reported as Critical because the downside if the concern proves
  founded is severe (unauthenticated create/update/delete of all
  Projects and Testimonials, and delete of all Messages), and because
  the codebase's own prior-phase reasoning (in `review.ts`) already
  establishes that relying on middleware alone for a Server Action is
  considered insufficient by whoever wrote that comment.
- **Recommended fix (not applied):** add the same `const session =
  await auth(); if (!session?.user) throw new Error("Not
  authenticated.");` guard already used in `review.ts`/`media.ts` to
  the start of all 8 actions listed above. This is a small, mechanical,
  low-risk change, but it touches Authentication-adjacent logic and
  Projects/Messages/Testimonials actions — outside this phase's
  read-only, test-only scope, so not applied here.

---

## 4. High issues

None found beyond what's already captured under Critical above — every
other gap traced back to one of C-1/C-2/C-3, or is Medium/Low.

---

## 5. Medium issues

- **M-1 — Admin Dashboard still reads `mock-data.ts` directly**
  (`src/app/admin/dashboard/page.tsx`, imports `PROJECTS`, `TESTIMONIALS`,
  `MESSAGES`). Identical pattern to what Home had before 9.3.14-A Fix 1.
  Not fixed this phase or last: "Admin dashboard" is explicitly
  Forbidden in both phases. Dashboard metrics/recent-projects/activity
  shown to an admin are therefore not real. **Recommended fix (not
  applied):** same treatment as Home — swap to `getProjects()`/
  `getTestimonials()`/`getMessages()`, in an explicitly-scoped future
  phase that permits touching Admin.
- **M-2 — Static `/client-review` feedback form's success copy is
  misleading.** `ClientReviewForm.tsx` shows "your review has been sent
  to the studio for moderation" after submit, but nothing is sent
  anywhere (client-state only, confirmed no network call). Pre-existing
  and already documented in the component's own comment as a
  Foundation-stage placeholder — restated here because "Duplicate
  submission prevention" (Test Group 5) can't be meaningfully evaluated
  when nothing is actually submitted. **Recommended fix (not applied):**
  either wire this to a real action in a future phase, or soften the
  success copy in the meantime to not imply persistence that doesn't
  happen — touches "Client Review System," Forbidden this phase.
- **M-3 — `revalidateTestimonialPaths()` doesn't call
  `revalidatePath("/")`** (unlike `revalidateProjectPaths()`, which
  does). Practically inert now that Home is `force-dynamic` (it
  re-queries on every request regardless of any cache to invalidate),
  but worth tidying for consistency if Home's caching strategy ever
  changes. Not applied — testing-only scope this phase.

---

## 6. Low issues

- **L-1 — No explicit `session.maxAge`** in `auth.config.ts`; Auth.js
  v5's 30-day JWT default applies. Not a bug, just worth an explicit
  decision on whether 30 days is the intended admin session lifetime.
- **L-2 — "Remove" on an uploaded asset only detaches the URL; the
  underlying Cloudinary asset is never deleted.** Pre-existing,
  documented in the 9.3.12 Stage 2 report already.
- **L-3 — No `alternates.canonical` and no JSON-LD anywhere.**
  Pre-existing, documented in 9.3.13-A/9.3.14-A already.
- **L-4 — `src/app/(admin)/admin/layout.tsx` remains orphaned dead
  code**, and two stale comments (`auth.ts`, `media.ts`) remain
  un-updated — both already flagged and deliberately left alone in the
  9.3.14-A Fixes report (they sit inside Forbidden-category files).
  Restated only for completeness, not newly discovered.

---

## 7. Production readiness assessment

**Solid:** authentication (login/logout/owner setup/session/middleware
gating of pages), the three-model Prisma layer and its mapping, signed
direct-to-Cloudinary uploads with correct `secure_url`-only persistence,
complete SEO metadata/sitemap/robots/404/error handling, and — after
9.3.14-A — a corrected accessibility landmark structure and a live-data
Home page. Settings and the Client Review token-link *presentation*
correctly match their respective Decision Records.

**Not production-ready as-is**, for three independent reasons: (1) a
core content type — Project media (hero/gallery/PDF) — is captured and
stored but never shown to an actual site visitor, meaning the primary
purpose of a portfolio site's case-study page is unmet; (2) the
Contact form — this studio's stated lead-generation mechanism
(Page_Structure §8: "Purpose: Lead generation and inquiry management")
— silently discards every real inquiry; and (3) eight mutating admin
Server Actions have no authentication check of their own and depend
entirely on middleware's page-based matching to stay protected, a
pattern this same codebase's own commentary already treats as
insufficient for the actions it did apply it to.

---

## 8. Recommendation

**FAIL**

Not because anything already fixed is broken — 9.3.10 through 9.3.14-A
all hold up under this testing pass — but because this phase's own
testing objective (validate the *entire* project, end-to-end) surfaced
three independent, load-bearing gaps, each meaning a stated purpose of
the site (showcase project media, capture leads, keep admin mutations
authenticated) doesn't actually happen. None of these are
build-breaking, so none were modified per this phase's explicit rule.

**No source code modifications were necessary** to complete this
testing phase, and none were made. All three Critical issues are
recommended as explicitly-scoped follow-up fix phases.
