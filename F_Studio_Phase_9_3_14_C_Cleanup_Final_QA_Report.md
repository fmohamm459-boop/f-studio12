# F Studio — Phase 9.3.14-C Cleanup & Final QA Report

**Type:** Cleanup-only phase, continuing from the current project state
after Phase 9.3.14-B (which made no code changes). No previous phase
was restarted. Only the five in-scope cleanup items were addressed;
critical production issues found along the way were reported, not
fixed, per this phase's explicit instruction.

---

## 1. Task 1 — Build artifact cleanup

**Already done, no action needed this phase.** `tsconfig.tsbuildinfo`
was removed and `.gitignore` was updated with a `*.tsbuildinfo` rule
during Phase 9.3.14-A Fixes. Both were re-verified at the start of this
phase: the file is absent, and the `.gitignore` rule is in place. No
new change was required.

---

## 2. Task 2 — Stale comments

**No files modified.** A codebase-wide search for stale/placeholder
language (`TODO`, `FIXME`, "not wired up", "not implemented",
"Foundation stage", "scaffold", "left to", etc.) found two comments
that genuinely contradict the current implementation:

- `src/auth.ts` — claims `signOut` "is exported but intentionally
  unused this phase," though it's actually used via `logoutAction`.
- `src/lib/actions/media.ts` — claims image uploads "are not wired up
  yet," though they are (Stage 2, confirmed).

Both were already identified in the 9.3.14-A audit and left untouched
in the 9.3.14-A Fixes phase because they sit inside files this
project's Strict Rules explicitly forbid touching. **This phase's own
Strict Rules repeat the same restriction** — "Do NOT: change
authentication... change uploads / Cloudinary" — so the same decision
applies again, for the same reason: `src/auth.ts` is the authentication
module, `src/lib/actions/media.ts` is the Cloudinary upload action.
Neither was modified.

Every other match from the search (`placeholder=` HTML attributes on
`Input`/`Select`/`Textarea`/`PortfolioBrowser`, a message-form
placeholder string, the root layout's Technical Mono font comment) was
checked individually and confirmed to be either a false positive (an
HTML `placeholder` attribute, not a stale comment) or still accurate
(the Technical Mono font genuinely still isn't wired — that comment is
correct, not stale). No eligible file was found.

---

## 3. Task 3 — Unused folders / dead code

**Removed:** `src/app/(admin)/admin/layout.tsx`, and its now-empty
parent directories `src/app/(admin)/admin/` and `src/app/(admin)/`.

**Why this was safe:** confirmed, before deleting, that:
- It was the *only* file in that entire route-group subtree (`find
  "src/app/(admin)" -type f` returned exactly one result).
- No `page.tsx` exists anywhere under it, so it never rendered for any
  request — Next.js only invokes a `layout.tsx` for routes that
  actually have a page beneath it.
- The real, working admin pages live at the physically separate
  `src/app/admin/*` directory (confirmed present and untouched:
  `dashboard/`, `login/`, `messages/`, `projects/`, `settings/`,
  `setup/`, `testimonials/`), which has no relationship to
  `src/app/(admin)/admin/` — they're two different directory trees
  that happen to resolve to the same URL segment name, not a parent/
  child pair.
- Its own content was two unresolved `TODO` comments referencing a
  "Foundation Plan §4" component build order that Phase 9.3.7 (Admin
  Pages Implementation) superseded by building the real pages
  elsewhere — it was never finished, never wired up, and nothing in
  the approved architecture (Page_Structure PART B) depends on this
  specific file existing.
- This is not "admin page layouts" in the sense Strict Rules means —
  no real admin page rendered through it, so nothing about how any
  actual admin page looks or behaves is affected.

No other unused file or folder was found. Every other file's contents
were traced back to a real, rendered route or an actively-imported
utility during this and prior phases' audits.

---

## 4. Task 4 — No-op "View" action

**Investigated fully; not modified, per this phase's "report critical
issues only" rule.**

**Correction to the original audit:** the 9.3.14-A audit report cited
`ProjectsManagement.tsx`'s "View" action as the no-op. Re-checking it
at the start of this phase found it **already correctly wired**:
```ts
{
  label: "View",
  onSelect: (project) =>
    window.open(`/portfolio/${project.slug}`, "_blank", "noopener,noreferrer"),
},
```
This citation was imprecise — the actual, still-unwired no-op "View"
action (along with "Edit" and "Delete") is in a different file:
**`src/app/admin/dashboard/page.tsx`**, in its "Recent projects" table:
```ts
rowActions={[
  { label: "View", onSelect: () => {} },
  { label: "Edit", onSelect: () => {} },
  { label: "Delete", onSelect: () => {}, destructive: true },
]}
```
This page's own comment already discloses this as intentional:
*"the Recent Projects 'View'/'Edit' actions have no destination or
handler wired (no CRUD/API per Foundation restriction)."*

**Why this was not fixed — a critical issue was found underneath it:**
`admin/dashboard/page.tsx` is a **Server Component** (no `"use
client"` directive; it exports `Metadata`, which is Server-Component-
only). It passes `rowActions` — an array **containing function
values** (`onSelect: () => {}`) — directly as a prop to `DataTable`, a
**Client Component** (`"use client"`, confirmed at the top of
`src/components/data/DataTable.tsx`). React Server Components cannot
serialize functions across the Server→Client prop boundary; passing a
function prop from a Server Component directly into a Client
Component is invalid and is expected to fail (Next.js's own error for
this exact pattern is "Functions cannot be passed directly to Client
Components" / "Event handlers cannot be passed to Client Component
props"). This appears to be a **pre-existing, undetected,
critical/build-affecting bug** — undetected because `next build` has
never actually been run against this project in any phase (deferred
every time, due to this sandbox's lack of network access).

This is corroborated by the codebase's own established, correct
pattern elsewhere: every other admin page with a `DataTable` (Projects,
Testimonials, Messages Management) is structured as a thin **Server**
page (`admin/projects/page.tsx`, fetches data, no interactivity) that
renders a separate **Client** component (`ProjectsManagement.tsx`,
`"use client"`) which owns the `DataTable` and defines its
`rowActions` *internally* — so the function values never cross a
Server→Client prop boundary. `admin/dashboard/page.tsx` is the one
page that doesn't follow this pattern; it defines `rowActions` inline,
inside the Server Component itself.

Fixing the "View" button correctly requires resolving this underlying
structural issue first (e.g., extracting the "Recent projects" table
into its own small Client Component, matching the established
Management-component pattern) — which is a bigger, riskier change than
"minimal," and edges toward "redesign the admin UI" (restructuring a
page's component boundaries), both of which this phase's Strict Rules
disallow. Per this phase's explicit instruction — *"Do NOT address
critical production issues in this phase... If a critical issue is
encountered, report it only"* — this is reported here, not fixed.

**Recommended fix (not applied):** extract Dashboard's "Recent
projects" `DataTable` + `rowActions` into a small `"use client"`
component (e.g. `RecentProjectsTable.tsx`) that receives `projects` as
plain data and defines `View`/`Edit`/`Delete` handlers internally —
`View` can reuse the exact `window.open('/portfolio/${slug}', '_blank',
'noopener,noreferrer')` pattern already proven correct in
`ProjectsManagement.tsx`. `Edit`/`Delete` would need a decision on
scope (inline mutation vs. redirect to `/admin/projects`) — out of
this report's remit to decide, flagged for the follow-up phase.

---

## 5. Task 5 — Accessibility minor issues

**Fixed:** the destructive-action inline confirm step in the shared
`DataTable` component now announces itself to assistive technology.

**Before:** clicking a `destructive: true` row action (e.g. "Delete")
swaps that row's action buttons for a "Delete {item}? [Confirm]
[Cancel]" prompt — a real, visible state change — but the container
had no ARIA live-region role, so a screen reader user wouldn't be told
this happened unless they were already focused inside that exact area.

**After:**
```diff
- <div className="flex items-center justify-end gap-2">
+ <div role="status" className="flex items-center justify-end gap-2">
    <span className="text-xs text-foreground/70">Delete {getRowLabel(row)}?</span>
```
`role="status"` is a polite, non-interrupting live region — it
announces the new "Delete X? Confirm/Cancel" content to screen readers
as soon as it appears, without stealing focus or interrupting anything
else in progress.

- **File modified:** `src/components/data/DataTable.tsx` — one line.
- **No visual, layout, spacing, color, or class change** — same
  `className`, same markup structure, same two buttons.
- **RTL, landmarks, focus states, and 44px targets unaffected** — this
  is shared by every table in the app (Projects, Testimonials, Messages
  Management), so the fix applies everywhere the confirm step already
  existed, with zero design-system change.

**Other candidates considered, not applied:**
- Adding a "(opens in new tab)" screen-reader hint to the four
  `target="_blank"`/`window.open` links/buttons in the app. Three of
  the four live in files this phase forbids touching (public pages,
  Client Review System); the fourth (`ProjectsManagement.tsx`'s "View"
  button) gets its accessible name from `DataTable`'s generic
  `aria-label={`${action.label} ${getRowLabel(row)}`}` logic, which has
  no per-action "opens new tab" concept today — adding one would mean
  extending the shared component's prop API, which is a larger change
  than "small, safe" for this phase.
- A broader sweep for missing `aria-label`s on icon-only buttons
  (`SideNavBar`, `TopNavBar`) found existing labels already present —
  no gap found there.

---

## 6. Files modified

| File | Change |
|---|---|
| `src/components/data/DataTable.tsx` | Added `role="status"` to the destructive-action confirm-step container (Task 5). |

## Files removed

| File/Directory | Reason |
|---|---|
| `src/app/(admin)/admin/layout.tsx` | Confirmed orphaned dead code — never rendered, superseded by the real admin pages at `src/app/admin/*` (Task 3). |
| `src/app/(admin)/admin/` (now-empty directory) | Removed after its only file was deleted. |
| `src/app/(admin)/` (now-empty directory) | Removed after its only child was deleted. |

No other file was created, renamed, or restructured this phase.

---

## 7. Remaining issues (not addressed this phase, by design)

- **Critical (newly surfaced this phase):** `admin/dashboard/page.tsx`
  passes function props from a Server Component to the Client
  Component `DataTable` — likely an invalid, previously-undetected
  build/runtime error (§4). Recommended as its own dedicated fix phase.
- **Critical (carried over from 9.3.14-B, unchanged):** public Project
  Details page never renders uploaded hero/gallery/PDF media; the
  Contact form never persists a `Message`; eight mutating admin Server
  Actions have no in-action authentication check. None revisited this
  phase — explicitly out of scope ("Do NOT address critical production
  issues in this phase").
- **Medium (carried over):** Admin Dashboard reads `mock-data.ts`
  directly rather than live data (same root file as the Task 4 finding
  above — a second, independent problem in the same page).
- **Two stale comments** in `auth.ts`/`media.ts` remain, for the
  reasons in §2.
- **Contact/Client Review forms' misleading success copy** — untouched,
  public-page/Client-Review-System territory, forbidden this phase.

---

## 8. Confirmation: critical production issues were not changed

No change was made to: Authentication (`src/auth.ts`,
`src/auth.config.ts`, `src/app/api/auth/**`), Middleware
(`src/middleware.ts`), Uploads/Cloudinary (`src/lib/cloudinary.ts`,
`src/lib/actions/media.ts`, `PdfUploadZone.tsx`), the Prisma schema,
any public page (`src/app/(public)/**`), any admin page's *layout* or
composition beyond the one dead file removed, the component library's
visual design (only one non-visual `role="status"` attribute was
added), package versions, or any Server Action's authentication
behavior. The three Critical issues surfaced across this phase and the
prior testing phase (media not rendered, Contact form not persisting,
unauthenticated mutating actions) were left exactly as found — reported
in §7, not modified.

---

## Final Validation

| Check | Result |
|---|---|
| `tsconfig.tsbuildinfo` absent, `.gitignore` updated | ✅ already done in 9.3.14-A, re-verified |
| Stale comments reviewed; eligible ones (in forbidden files) left untouched | ✅ |
| Orphaned dead code removed | ✅ `(admin)` route group deleted |
| No approved-architecture file removed | ✅ confirmed via `find` before deleting |
| No-op "View" action fully investigated | ✅ correct file identified, root cause found |
| No-op "View" action fixed | ⏭️ not done — a critical structural issue was found underneath it, reported per this phase's rule instead |
| One safe, minimal accessibility fix applied | ✅ `role="status"` on `DataTable`'s confirm step |
| Design system, RTL, landmarks, focus states, 44px targets unchanged | ✅ |
| Authentication, middleware, uploads/Cloudinary, schema, public pages, admin page layouts, component library design, package versions unchanged | ✅ |
| No new pages, models, or features added | ✅ |
| Critical production issues addressed | ⏭️ intentionally not — reported only, per explicit instruction |

---

Final Status:

**Implementation: PASS WITH NOTES** — Tasks 1, 3, and 5 completed with
real, verified changes (or confirmed already complete). Task 2
completed with zero eligible files (both stale comments sit in files
this phase separately forbids touching). Task 4 was fully investigated
but not modified — it uncovered a genuine critical issue this phase's
own rules require reporting rather than fixing.
