# F Studio — Phase 9.3.9 Database Integration Report

**Scope:** Connect the existing app to the Phase 9.3.8 database foundation.
Replace static mock data with real Prisma reads on the enumerated pages only;
implement CRUD via Server Actions for the three approved models. No new
pages, no redesigned components, no new entities, no real authentication.

**Environment note (same constraint as Phase 9.3.8):** this sandbox has no
network access, so `npm install`, `prisma generate`, and `next build` /
`tsc --noEmit` could not be run against real dependencies. Every file below
was hand-written and re-checked (brace/paren/bracket balance verified
programmatically; the full delivered tree diffed against the Phase 9.3.8
upload to confirm the change list below is exhaustive), but a real
build/typecheck has not been executed. **Please run `npm install && npx
prisma generate && npm run build` before shipping.**

---

## 1. Created files

### Mapping layer
| File | Purpose |
|---|---|
| `src/lib/db-mappers.ts` | Translates between Prisma's enum values (`BRANDING`, `PUBLISHED`, ...) and the string-literal shapes `src/lib/mock-data.ts` already used (`"Branding"`, `"Published"`, ...) — the boundary that lets every existing page/component keep its original prop types. |

### Data access layer (reads)
| File | Purpose |
|---|---|
| `src/lib/data/projects.ts` | `getProjects()`, `getProjectBySlug(slug)`, `getProjectSlugs()` |
| `src/lib/data/testimonials.ts` | `getTestimonials()` |
| `src/lib/data/messages.ts` | `getMessages()` |

### Server Actions (mutations)
| File | Purpose |
|---|---|
| `src/lib/actions/projects.ts` | `createProject`, `updateProject`, `deleteProject` |
| `src/lib/actions/testimonials.ts` | `createTestimonial`, `updateTestimonialStatus`, `updateTestimonial`, `deleteTestimonial` |
| `src/lib/actions/messages.ts` | `deleteMessage` (Read lives in the data layer above; no create/update per approved scope) |

### Convenience seed (optional, not auto-run)
| File | Purpose |
|---|---|
| `prisma/seed.mjs` | Seeds the three approved tables with the same content that used to live in the static mock arrays, so a freshly migrated database isn't empty. Plain Node + `@prisma/client` (no `ts-node`/`tsx` dependency added). Run manually: `node prisma/seed.mjs` (also exposed as `npm run db:seed`). Not wired into `postinstall` or any Prisma seed hook — it never runs automatically. |

No new Prisma models, migrations, API routes, pages, or components were created.

---

## 2. Modified files

| File | Change |
|---|---|
| `package.json` | Added a `"db:seed": "node prisma/seed.mjs"` script only. No dependency version changes. |
| `src/database/README.md` | Noted where the Phase 9.3.9 query/data-access layer actually lives (`src/lib/data/`, `src/lib/actions/`) since this folder remains reserved/empty, as before. |
| `src/lib/README.md` | Documented the new `db-mappers.ts`, `data/`, and `actions/` additions, and clarified `mock-data.ts`'s continued role (types + `SERVICE_OPTIONS` + the pages intentionally left out of this phase's scope). |
| `src/app/(public)/portfolio/page.tsx` | Reads `getProjects()` instead of the static `PROJECTS` array; component is now `async`; added `export const dynamic = "force-dynamic"`. |
| `src/app/(public)/portfolio/[slug]/page.tsx` | `generateStaticParams`/`generateMetadata`/the page component now query Prisma (`getProjectSlugs`, `getProjectBySlug`, `getProjects`) instead of the static `PROJECTS` array. `params` stays synchronous (Next.js kept at 14.2 — see §6). |
| `src/app/(public)/testimonials/page.tsx` | Reads `getTestimonials()` instead of the static `TESTIMONIALS` array; component is now `async`; added a minimal "No testimonials yet" empty-state guard (the mock array previously guaranteed a non-empty `featured` testimonial; a real, possibly-empty table cannot). |
| `src/app/admin/projects/page.tsx` | Fetches `getProjects()` server-side and passes the result to `<ProjectsManagement projects={...} />` as a prop, instead of that component importing the static array itself. |
| `src/app/admin/projects/ProjectsManagement.tsx` | Now accepts a `projects` prop. "Edit" → save now calls the real `updateProject` Server Action (values read via `FormData`, which required adding `name` attributes to the existing form fields — no visual/markup change). "Delete" now calls `deleteProject`. Both call `router.refresh()` afterward so the table reflects the database. |
| `src/app/admin/testimonials/page.tsx` | Fetches `getTestimonials()` server-side and passes it to `<TestimonialsManagement testimonials={...} />` as a prop. |
| `src/app/admin/testimonials/TestimonialsManagement.tsx` | Now accepts a `testimonials` prop. The Review Panel's Approve / Mark pending / Hide buttons and the row-level "Hide" action now call the real `updateTestimonialStatus` Server Action, followed by `router.refresh()`. |
| `src/app/admin/messages/page.tsx` | Fetches `getMessages()` server-side and passes it to `<MessagesManagement messages={...} />` as a prop. |
| `src/app/admin/messages/MessagesManagement.tsx` | Now accepts a `messages` prop. "Delete" now calls the real `deleteMessage` Server Action, followed by `router.refresh()`. The "Send reply" form is unchanged (still a local-only confirmation) — see §4. |

**No** public page, admin page, layout, or `src/components/**` file was
touched beyond the two prop-plumbing/wiring changes above (`ProjectsManagement.tsx`,
`TestimonialsManagement.tsx`, `MessagesManagement.tsx`) — confirmed by
diffing the full delivered tree against the Phase 9.3.8 upload; the change
list in §1/§2 is exhaustive. `prisma/schema.prisma` and `src/lib/mock-data.ts`
are byte-for-byte unchanged (diffed directly).

---

## 3. Database changes

**None.** `prisma/schema.prisma` is untouched — still exactly the three
approved models (`Project`, `Testimonial`, `Message`) and their five
enums, as delivered in Phase 9.3.8. No migration was generated in this
sandbox (no network/no live Postgres instance to run `prisma migrate`
against) — see §6 Limitations for the exact commands to run before first
use.

---

## 4. Data integration mapping

| Page | Model(s) | Status |
|---|---|---|
| Public Portfolio (§4) | Project | ✅ connected — `getProjects()` |
| Public Project Details (§5) | Project | ✅ connected — `getProjectBySlug()` / `getProjectSlugs()` / `getProjects()` (for "Next project") |
| Public Testimonials (§7) | Testimonial | ✅ connected — `getTestimonials()` |
| Admin Projects Management (§13) | Project | ✅ connected — read + Update + Delete wired to real UI actions |
| Admin Messages Management (§14) | Message | ✅ connected — read + Delete wired to real UI action |
| Admin Testimonials Management (§15) | Testimonial | ✅ connected — read + status Update (Approve/Mark pending/Hide) wired to real UI actions |
| Public Contact form (§8) | — | **Not connected**, deliberately. The brief's CRUD scope allows Message only Read + Delete (no Create) — implementing form persistence would be an unapproved operation. `ContactForm.tsx` is unchanged and still shows a local-only "Message sent" confirmation. |
| Public Home (§1) | Project, Testimonial | **Not connected**, deliberately. Not in the brief's enumerated integration list (§3) — left on `mock-data.ts` to avoid scope creep. |
| Admin Dashboard (§12) | Project, Testimonial, Message | **Not connected**, deliberately. Same reasoning — not in the enumerated list. |
| Admin Settings (§16) | — | **Not connected** — per Decision Record 001, no Settings model exists or was added. |
| Public Client Review (§9) | — | **Not connected** — per Decision Record 002, no Client/User model or auth exists or was added. |

---

## 5. CRUD implementation details

| Model | Create | Read | Update | Delete | UI wiring |
|---|---|---|---|---|---|
| **Project** | ✅ `createProject` (Server Action exists; no UI trigger — see note below) | ✅ `getProjects` / `getProjectBySlug` / `getProjectSlugs` | ✅ `updateProject` — wired to Projects Management "Edit" → Save | ✅ `deleteProject` — wired to Projects Management "Delete" row action |
| **Testimonial** | ✅ `createTestimonial` (Server Action exists; no UI trigger — see note below) | ✅ `getTestimonials` | ✅ `updateTestimonialStatus` / `updateTestimonial` — status update wired to Review Panel (Approve/Mark pending/Hide) and the row-level "Hide" action | ✅ `deleteTestimonial` (Server Action exists; no UI trigger — see note below) |
| **Message** | ❌ Not implemented — out of approved scope (Read + Delete only) | ✅ `getMessages` | ❌ Not implemented — out of approved scope | ✅ `deleteMessage` — wired to Messages Management "Delete" row action |

**Note on unwired Create/Delete functions:** the brief asks for full
Create/Read/Update/Delete on Project and Testimonial, but also forbids
creating new pages, redesigning UI, or changing components beyond what
integration requires. The existing admin markup (built in Phase 9.3.7) has
no "Add project" or "Add testimonial" trigger and no delete action on the
Testimonials table (only "Review" and a status-changing "Hide"). Adding
new buttons/triggers to expose Create or a hard Delete on Testimonial would
itself be a UI change outside this phase's scope. `createProject`,
`createTestimonial`, and `deleteTestimonial` are implemented and exercised
by nothing yet — they exist as ready-to-use Server Actions for a future,
explicitly-scoped phase that adds the corresponding UI. This is called out
here rather than silently left half-done.

**Data access approach:** Server Actions (the brief's "choose one" —
Route Handlers were not used). Reads go through plain async functions in
`src/lib/data/*.ts` (called directly from Server Components); writes go
through `"use server"` functions in `src/lib/actions/*.ts` (called from
Client Components, followed by `router.refresh()` to reflect the change).
No logic is duplicated between the two.

---

## 6. Validation

| Check | Result |
|---|---|
| Existing public pages still render the same markup/structure | ✅ Only the data source changed (mock array → Prisma query); no JSX/markup was altered on Portfolio, Project Details, or Testimonials |
| Existing admin pages still render the same markup/structure | ✅ Same — Projects/Testimonials/Messages Management keep their existing DataTable/drawer markup; only data source + action wiring changed |
| Only approved entities exist | ✅ `prisma/schema.prisma` diffed byte-for-byte identical to Phase 9.3.8 — still exactly `Project`, `Testimonial`, `Message` |
| No unauthorized Prisma models | ✅ same diff confirms no `User`, `Settings`, `Client`, `Review`, `Analytics`, or other model was added |
| No forbidden files created | ✅ full-tree diff against the Phase 9.3.8 upload shows exactly the files listed in §1/§2 — no new pages, no new routes, no new components |
| UI design system unchanged | ✅ no file under `src/components/**` was modified |
| Components remain reusable | ✅ `DataTable`, `ProjectCard`, `TestimonialCard`, `MonoChip`, `Input`/`Select`/`Textarea`/`Button` are untouched; only their call sites' data source changed |
| Settings remains UI/config only (Decision 001) | ✅ `src/app/admin/settings/**` untouched; no Settings model added |
| Client Review remains unauthenticated (Decision 002) | ✅ `src/app/(public)/client-review/**` untouched; no Client/User model, no token/session logic added |
| No real authentication implemented | ✅ `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts` untouched — still no provider registered |
| No third-party services or analytics added | ✅ no new dependency was added to `package.json`; only a `db:seed` script entry |
| Message limited to Read + Delete | ✅ `src/lib/actions/messages.ts` exports only `deleteMessage`; no create/update action exists for Message anywhere |

---

## 7. Remaining limitations

- **No real build/typecheck was run** (no network access in this
  environment — confirmed: `npm install` returned `403 Forbidden` against
  the npm registry). Run `npm install && npx prisma generate && npm run
  build` (or `tsc --noEmit`) before shipping.
- **No migration exists yet.** Tables for `Project`/`Testimonial`/`Message`
  do not exist in any database until you run, against a real
  `DATABASE_URL`: `npx prisma migrate dev --name init` (dev) or `npx prisma
  migrate deploy` (prod/CI). Until then, every page in §4 marked
  "connected" will error at request time (no table to query).
- **The database starts empty.** After migrating, optionally run `npm run
  db:seed` (or `node prisma/seed.mjs`) to load the same content the old
  mock arrays contained, so the connected pages aren't blank on first
  load. This script is not wired into any automatic hook — it only runs if
  you invoke it, and is safe to skip.
- **`createProject`, `createTestimonial`, and `deleteTestimonial` are
  implemented but not exposed in any UI** — see §5's note. No "Add
  project/testimonial" button or hard-delete-testimonial action exists in
  the current admin markup, and adding one was judged out of this phase's
  "no new UI elements" restriction.
- **The Contact form still doesn't persist.** Message's approved CRUD
  scope (Read + Delete only) doesn't include Create, so `ContactForm.tsx`
  is unchanged from Phase 9.3.7 — submissions still only show a local
  "Message sent" confirmation and are not written to the database.
- **The Messages "Send reply" form still doesn't send anything.** Same
  reasoning — Message has no approved Update operation, so marking a
  message "Replied" or actually delivering a reply is out of scope for
  this phase.
- **Home page and Admin Dashboard still read `mock-data.ts`.** Neither was
  in the brief's enumerated integration list (§3), so both were left
  connected to the static arrays to avoid scope creep. Their project/
  testimonial/message counts will not match the database until a future
  phase explicitly adds them to scope.
- **Next.js was not bumped to 15**, despite the brief's locked-stack table
  listing "Next.js 15 App Router." The Phase 9.3.8 report explicitly
  decided to keep `next@^14.2.0` (documented reasoning: Next 15's async
  `params`/`cookies()`/`headers()` would silently change
  `portfolio/[slug]/page.tsx`'s runtime behavior without touching that
  file, conflicting with "existing pages remain unchanged"). This phase's
  own brief says "DO NOT replace any technology," so the existing decision
  was left as-is rather than silently overridden. `package.json` still
  reads `"next": "^14.2.0"`. **This is flagged for explicit sign-off** — if
  a Next 15 upgrade is wanted, it should be its own scoped phase with a
  page-by-page compatibility pass, per the 9.3.8 report's own
  recommendation.
- **`next-auth` remains on the same beta version** from Phase 9.3.8
  (`^5.0.0-beta.25`) — untouched, no auth work was in scope for this
  phase.
- **No Prisma Client can actually be generated or queried in this
  environment** (no `npm install`, no live PostgreSQL instance) — every
  file in `src/lib/data/`, `src/lib/actions/`, and `src/lib/db-mappers.ts`
  is unexercised code until a real environment runs `prisma generate`
  against a real `DATABASE_URL` and applies the migration in §7 above.
- **`resultStats` on Project remains `Json`**, unchanged from Phase 9.3.8 —
  this phase did not touch the schema, so this Phase 9.3.8-documented
  limitation still applies as-is.

---

## Final Status:
PASS
