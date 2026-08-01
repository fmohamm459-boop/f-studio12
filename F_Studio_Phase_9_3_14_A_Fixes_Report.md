# F Studio — Phase 9.3.14-A Fixes Report
## Audit Critical Fixes

**Type:** Fix-only phase, continuing strictly from the uploaded
`f-studio-phase-9-3-13-b-hotfix.zip`. No previous phase was restarted.
Only the three fixes below were implemented — no unrelated
improvements were made, even where other pre-existing issues (noted in
§8) were visible while working in these files.

---

## 1. Audit issues fixed

| # | Finding (from the 9.3.14-A audit) | Status |
|---|---|---|
| 1 | Home page (`(public)/page.tsx`) rendered static `mock-data.ts` arrays instead of live database data | ✅ Fixed |
| 2 | Public route group double-rendered its shell (empty placeholder `<header>`/`<main>`/`<footer>` around every page's own real one), nesting `<main>` inside `<main>` sitewide | ✅ Fixed |
| 3a | Stray `tsconfig.tsbuildinfo` build artifact at project root | ✅ Removed |
| 3b | `.gitignore` didn't exclude TypeScript's build-cache file | ✅ Updated |
| 3c | Stale comments contradicting current implementation (`auth.ts`, `media.ts`) | ⏭️ Not modified — see §5 for why |

---

## 2. Files modified

| File | Change |
|---|---|
| `src/app/(public)/page.tsx` | Home now reads live `Project`/`Testimonial` rows via the existing data layer instead of the static mock arrays. |
| `src/app/(public)/layout.tsx` | Reduced to a passthrough (`return <>{children}</>;`); removed the empty placeholder header/main/footer shell that was duplicating every page's own real one. |
| `.gitignore` | Added `*.tsbuildinfo`. |

## Files removed

| File | Reason |
|---|---|
| `tsconfig.tsbuildinfo` | Accidental artifact from an ad hoc `tsc --noEmit` sanity check run during Phase 9.3.13-B; not a project deliverable, not previously gitignored (see §4). |

No other file was created, renamed, or restructured.

---

## 3. Fix 1 — Home Page Data Integration: data flow changes

**Before:** `import { PROJECTS, TESTIMONIALS } from "@/lib/mock-data";`
with `featuredProjects`/`featuredTestimonial` computed as **module-level
constants** from those static arrays — evaluated once, at module load,
never touching the database. `HomePage` was a plain (non-`async`)
component.

**After:**
```ts
import { getProjects } from "@/lib/data/projects";
import { getTestimonials } from "@/lib/data/testimonials";
// ...
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();
  const testimonials = await getTestimonials();
  const featuredProjects = projects.slice(0, 3);
  const featuredTestimonial = testimonials[0];
  // ...
}
```

- `getProjects()` and `getTestimonials()` are the **existing** data-layer
  functions (`src/lib/data/projects.ts` / `src/lib/data/testimonials.ts`,
  Phase 9.3.9) already used by `(public)/portfolio/page.tsx` and
  `(public)/testimonials/page.tsx` — no new query function was written.
- `featuredProjects`/`featuredTestimonial` are computed the same way as
  before (`.slice(0, 3)` / first item) — just against live rows instead
  of the mock array. Because `getProjects()` orders by `updatedAt desc`
  (existing behavior, unchanged), "Selected Works" now shows the 3
  most-recently-updated projects instead of always the same 3 mock
  ones.
- **`export const dynamic = "force-dynamic";`** was added — the same
  directive already present on `(public)/portfolio/page.tsx` and
  `(public)/testimonials/page.tsx` — so Home always reads current data
  on every request rather than being statically generated once at build
  time with stale results baked in. This was necessary to actually
  achieve "Home page displays real database data" (a page that only
  ever queried the database once at build time would defeat the fix),
  so it's included as part of the same change rather than as a separate
  modification.
- **Neither `getProjects()` nor `getTestimonials()` was changed.** Both
  are read exactly as `(public)/portfolio/page.tsx` and
  `(public)/testimonials/page.tsx` already read them — including their
  existing lack of a `status`/moderation filter. This matches those
  pages' current behavior exactly rather than introducing new filtering
  logic Fix 1 didn't ask for (see §8, "Remaining risks," for the
  consequence of this).
- **UI/components/styling: byte-identical.** Every `<section>`, class
  name, and component (`ProjectCard`, `TestimonialCard`, `ServiceCard`,
  `Button`) is unchanged — only the two data sources feeding
  `featuredProjects`/`featuredTestimonial` changed.
- **Empty states preserved:** the mock arrays were never empty, so the
  original code unconditionally rendered "Selected Works" and "Client
  Feedback." With live data, a fresh/emptied database is now possible,
  so both sections were wrapped in a guard (`{featuredProjects.length >
  0 ? (...) : null}` / `{featuredTestimonial ? (...) : null}`) so the
  page degrades gracefully (skips the section) instead of crashing on
  `undefined.quote` — the rendered markup when data *is* present is
  unchanged from before.

**Scope note:** `src/app/admin/dashboard/page.tsx` has the identical
pattern (`import { PROJECTS, TESTIMONIALS, MESSAGES } from
"@/lib/mock-data"`) and was flagged in the same audit finding category.
It was **not modified** — Fix 1 named only `(public)/page.tsx`, and
"Admin dashboard" is explicitly on this phase's Forbidden list. Flagged
here for visibility, not fixed.

---

## 4. Fix 2 — Public Layout Duplication: layout correction explanation

**Root cause (confirmed in the audit and re-verified here):**
`src/app/(public)/layout.tsx` was an unfinished Foundation-stage stub —
its own original comment said TopNavBar/Footer "are NOT built here...
this layout wires their slot so page implementation can proceed later."
That never happened: every one of the 10 pages in the route group
(Home, About, Brand Identity, Portfolio, Project Details, Services,
Testimonials, Contact, Client Review, Review) instead grew its own
complete, real `<TopNavBar />` / `<main role="main">` / `<Footer />`
shell directly in the page component. Both layers were left in place,
so every public page rendered:
- an empty placeholder `<header>` (from the layout) **and** a real one
  (from the page),
- a `<main>` (from the layout) wrapping **another** `<main>` (from the
  page) — invalid HTML, and two `role="main"` landmarks per page for
  assistive technology,
- an empty placeholder `<footer>` **and** a real one.

**Two candidate fixes considered:**
1. Make the layout the *real* single source of TopNavBar/Footer, and
   strip the now-duplicate real shell out of all 10 page files.
2. Make the layout a passthrough, since every page's own shell is
   already correct and complete on its own.

**Chosen: option 2 — minimal, and the only one compliant with this
phase's rules.** Option 1 would have required editing all 10 public
page files, which falls squarely under this phase's forbidden "Public
page design." Option 2 requires touching exactly one file
(`layout.tsx`) and changes zero visual output: every page keeps
rendering the exact same single `<TopNavBar />` / `<main role="main">`
/ `<Footer />` it already had; the only thing removed is the redundant,
empty, non-functional outer layer that was never wired up. Result:

```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- **No duplicate landmarks, no nested `<main>`, one `<header>`/`<main>`/
  `<footer>` per page** — confirmed by re-reading the resulting render
  tree for a representative page (Home): `PublicLayout` now renders
  only `{children}`, and Home's own `<div><TopNavBar/><main
  role="main">...</main><Footer/></div>` is the entire output.
- **No page file was touched.** UI_Guidelines §18.1's "one logo instance
  per header, one per footer" is still satisfied — each page still
  renders exactly one `<TopNavBar />` and one `<Footer />`, unchanged.
- **No visual regression:** since the placeholder header/footer were
  always empty (`data-slot="..."` divs with no content, no styling, no
  layout-affecting classes) and the extra `<main>` only added
  `className="flex-1"` with no visible box model impact inside a
  `flex flex-col` parent that no longer exists, removing that wrapper
  changes only the DOM structure, not anything rendered on screen.
- Routes are unaffected — this is a layout, not a page; no URL changed.

---

## 5. Fix 3 — Cleanup: what was done, and what was deliberately not

**Done:**
- Removed `tsconfig.tsbuildinfo` from the project root.
- Added `*.tsbuildinfo` to `.gitignore` so this can't recur silently.

**Not done — stale comments in `src/auth.ts` and `src/lib/actions/media.ts`:**
The 9.3.14-A audit identified two comments that no longer match the
current implementation:
- `src/auth.ts`: "`signOut` is exported but intentionally unused this
  phase" — inaccurate; `signOut` is used, via `logoutAction`
  (`src/lib/actions/auth.ts`), wired into `SideNavBar.tsx`.
- `src/lib/actions/media.ts`: "Currently used for PDF uploads only...
  image/logo/identity uploads are not wired up yet" — inaccurate;
  `PdfUploadZone.tsx`'s own `UploadZone` export is confirmed reused for
  Hero Image and Gallery Images too (Stage 2).

This phase's Fix 3 brief says to update stale comments "only if they
contradict current implementation" — both of these qualify. However,
this phase's **Forbidden** list separately and explicitly says **"Do
NOT modify: Authentication"** and **"Do NOT modify: ... Cloudinary
system"**. `src/auth.ts` is the authentication module; `src/lib/actions/media.ts`
is the Cloudinary upload-signature action. Both stale comments live
inside files that fall under an explicit Forbidden category.

Per this phase's own instruction — *"If another file must change:
Explain why in the report before modifying"* — this is exactly that
situation, surfaced instead of resolved unilaterally: the Forbidden
list is the more specific and more strongly worded constraint, so it
was treated as controlling, and **neither file was modified**. Both
comments remain stale in the delivered project. If a comment-only edit
to these two files is wanted despite the Forbidden list, please confirm
explicitly and it can be done as a one-line, comment-only change with
no logic touched.

**Not done — `src/app/(admin)/admin/layout.tsx` (orphaned dead code):**
The audit also flagged this file as dead code (a different, unused
directory tree from the real admin pages at `src/app/admin/*`). Fix 3's
brief lists only three concrete cleanup items (tsbuildinfo, `.gitignore`,
stale comments) and does not mention this file; it also falls under the
Forbidden "Admin pages" category. Left untouched.

---

## 6. Files confirmed untouched

Verified with a direct diff against the freshly-extracted upload — only
`.gitignore`, `src/app/(public)/layout.tsx`, and `src/app/(public)/page.tsx`
differ, and `tsconfig.tsbuildinfo` is the only removed file. Everything
else, including but not limited to:

- Authentication (`src/auth.ts`, `src/auth.config.ts`,
  `src/app/api/auth/[...nextauth]/route.ts`)
- Middleware (`src/middleware.ts`)
- Owner Store (`src/lib/owner-store.ts`)
- `prisma/schema.prisma` and every Prisma model
- Cloudinary (`src/lib/cloudinary.ts`, `src/lib/actions/media.ts`)
- Upload components (`src/app/admin/projects/PdfUploadZone.tsx`)
- Admin dashboard and every other admin page/management component
- Settings (`src/app/admin/settings/*`)
- Client Review System (`(public)/client-review/*`, `(public)/review/[token]/*`,
  `src/lib/actions/review.ts`)
- Every other public page's own file (About, Brand Identity, Portfolio,
  Project Details, Services, Testimonials, Contact, Client Review,
  Review — all 9 besides Home)
- The component library (`src/components/**`)
- `tailwind.config.ts`, `src/app/globals.css`
- `package.json` (no dependency or script changed)
- `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx` (9.3.13-B)

...is byte-identical to the uploaded project.

---

## 7. Verification

**Not run**, per this phase's instruction (no `npm install`, `prisma
generate`, `lint`, or `build` unless dependencies are already
available) — this sandbox has no `node_modules` installed for this
project and no network access to install them, so none of these
commands could be run even as a courtesy check. Documented honestly
rather than claimed.

Before shipping, run `npm install && npx prisma generate && npm run
lint && npm run build`, then manually verify:
- Home page (`/`) renders real project/testimonial data from a seeded
  database, and that both "Selected Works" and "Client Feedback"
  gracefully disappear (not crash) against an empty database.
- View source / accessibility inspector on any public page confirms
  exactly one `<header>`, one `<main>`, one `<footer>` landmark.
- Visual diff of every public page against the pre-fix version shows no
  pixel change (the layout fix should be DOM-structure-only).

---

## 8. Remaining risks

- **Home now shows unpublished/unmoderated content, same as the pages
  it mirrors.** `getProjects()`/`getTestimonials()` have no `status`
  filter — `(public)/portfolio/page.tsx` and `(public)/testimonials/page.tsx`
  already had this same gap before this fix. Home now inherits it
  identically (a draft project or a still-Pending testimonial could
  appear on Home), rather than introducing a new, inconsistent
  behavior. This was a deliberate choice to match existing, already-
  shipped page behavior rather than add new filtering logic Fix 1
  didn't request — flagged here as a pre-existing, now-shared risk, not
  a new one introduced by this fix.
- **`src/app/admin/dashboard/page.tsx` still has the same mock-data
  pattern** Home had (§3) — left untouched because "Admin dashboard" is
  explicitly Forbidden this phase.
- **Two stale comments (`auth.ts`, `media.ts`) remain stale** — left
  untouched because their files fall under this phase's Forbidden
  "Authentication" / "Cloudinary system" categories (§5). Revisit if a
  future phase explicitly authorizes touching those files.
- **`src/app/(admin)/admin/layout.tsx` remains orphaned dead code** —
  left untouched, same reasoning (§5).
- Build/lint/typecheck have not been run against real dependencies this
  phase (§7) — the change is small and mechanical, but unverified by a
  real compiler.

---

## Final Validation

| Check | Result |
|---|---|
| Home page reads live Prisma-backed data via existing query functions | ✅ |
| Home page UI/components/styling unchanged | ✅ |
| Home page empty states handled gracefully | ✅ |
| Public layout duplication removed (no nested `<main>`, no duplicate empty landmarks) | ✅ |
| No public page file modified to achieve the layout fix | ✅ |
| `tsconfig.tsbuildinfo` removed | ✅ |
| `.gitignore` updated to prevent recurrence | ✅ |
| Stale comments updated | ⏭️ not done — conflicts with explicit Forbidden list (§5) |
| No new models, routes, or components created | ✅ |
| No package version changed | ✅ |
| Authentication, Middleware, Owner Store, Prisma schema, Cloudinary, Upload components, Admin dashboard/pages, Settings, Client Review System, Public page design, Component Library untouched | ✅ confirmed by diff (§6) |
| Build/lint/typecheck executed | ⏭️ not run — no dependencies available in this sandbox (§7) |

---

Final Status:

**Implementation: PASS WITH NOTES** — Fixes 1 and 2 delivered in full,
within their stated constraints. Fix 3 delivered partially: the two
concrete, mechanical items (remove `tsconfig.tsbuildinfo`, update
`.gitignore`) are done; the stale-comment item was not applied because
both instances live in files this same phase explicitly forbids
modifying — surfaced in §5 rather than resolved by guessing.
**Verification: NOT RUN**, per explicit instruction and sandbox
limitation.
