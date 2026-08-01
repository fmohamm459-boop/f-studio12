# F Studio — Phase 9.3.13-B Production Readiness Report

**Scope:** Sitemap, robots directives, a global `not-found.tsx`, a global
`error.tsx`, and a review of production readiness (SEO, metadata, robots,
sitemap, Cloudinary/`next/image` compatibility). Continues strictly from
the uploaded Phase 9.3.13-A project. No authentication, middleware,
schema, Server Action, component library, admin page, or design-system
file was touched.

---

## 1. Modified / created files

| File | Change |
|---|---|
| `src/app/sitemap.ts` | **New.** Lists the 8 static public routes plus one entry per `PUBLISHED` Project slug. |
| `src/app/robots.ts` | **New.** Allows `/`, disallows `/admin`, `/review`, `/api/auth`; points `sitemap` at `/sitemap.xml`. |
| `src/app/not-found.tsx` | **New.** Global 404 boundary, built from the existing shell/components only. |
| `src/app/error.tsx` | **New.** Global error boundary with a `reset()`-driven retry action. |

No other file in the uploaded project was opened for editing. `next.config.ts`,
every `page.tsx`, the component library, admin pages, middleware, and
`prisma/schema.prisma` are byte-for-byte unchanged from Phase 9.3.13-A.

---

## 2. Sitemap (Task 1)

`src/app/sitemap.ts` exports the default `MetadataRoute.Sitemap` function
Next.js's App Router uses to serve `/sitemap.xml` automatically — no route
file or page was added beyond this one convention file.

**Static entries** — the 8 routes that exist in Page_Structure PART A:
`/`, `/about`, `/brand-identity`, `/services`, `/portfolio`,
`/testimonials`, `/contact`, `/client-review`. Each is read from a
hardcoded list matching the actual `page.tsx` files already in the
project — none were invented.

**Dynamic entries** — one entry per Project row, built with a direct
Prisma query (`prisma.project.findMany`) rather than reusing
`getProjectSlugs()` from `src/lib/data/projects.ts`, for one deliberate
reason: `getProjectSlugs()` returns **every** slug regardless of
`status`, but a sitemap is a public "please index this" signal, so this
file filters to `status: "PUBLISHED"` only. `lastModified` uses each
row's real `updatedAt`.

**Deliberately excluded:**
- `/admin/*` (Page_Structure PART B) — private, also blocked in `robots.ts`.
- `/review/[token]` — the private per-project token-link route (Phase
  9.3.11); its own page already sets `robots: { index: false, follow: false }`,
  so it has no reason to appear in a sitemap either.
- Draft Project rows — filtered out as above.

---

## 3. Robots (Task 2)

`src/app/robots.ts` exports the default `MetadataRoute.Robots` function
Next.js uses to serve `/robots.txt`.

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /review
Disallow: /api/auth
Sitemap: <site-url>/sitemap.xml
```

Mapping to the brief's three named categories:
- **`/admin`** — every admin route in Page_Structure PART B (§10 login,
  §11 setup, §12-16 dashboard/management pages) lives under this one
  prefix, so a single rule covers all of it.
- **"/private"** — this codebase has no literal `/private` path; the
  closest match is `/review/[token]`, the private, unguessable
  per-project client-review link (Phase 9.3.11, Decision Record 002).
  Disallowed here to reinforce (at the crawler-directive level) the
  page-level `robots: { index: false, follow: false }` it already sets.
- **Authentication routes** — `/api/auth` is the Auth.js/NextAuth route
  handler (`src/app/api/auth/[...nextauth]/route.ts`), the only
  authentication route that exists in the app.

`Allow: /` is explicit rather than implicit, and `Disallow` entries take
precedence per the standard, so `/admin`, `/review`, and `/api/auth`
are excluded even though `/` is allowed.

---

## 4. `not-found.tsx` (Task 3)

Global 404 boundary at `src/app/not-found.tsx` — catches unmatched
routes and any call to `notFound()` (e.g. the existing
`portfolio/[slug]/page.tsx` when a slug doesn't resolve).

No redesign: reuses `TopNavBar`, `Footer`, and `Button` exactly as every
other page does, and the same page-shell/typography/token classes
(`text-foreground`, `bg-surface`, `border-border`, `--radius-lg`,
mono-label eyebrow) already established across the project. Sets
`title: "Page not found — F Studio"` and `robots: { index: false, follow: false }`
so the 404 page itself is never indexed. Offers two recovery paths:
back to home, or to the portfolio.

---

## 5. `error.tsx` (Task 4)

Global error boundary at `src/app/error.tsx`. Per Next.js's App Router
contract this file must be a Client Component (`"use client"`) — it
receives `error` and a `reset()` callback from the framework at runtime.

**Graceful recovery:** a "Try again" button calls `reset()`, which
re-renders the failed segment in place without a full page reload; a
"Back to home" button offers a clean escape route. The caught error is
logged to the console (`useEffect` + `console.error`) for local
debugging only — no external error-reporting service exists in this
project, and none was introduced here (out of scope).

Same shell as `not-found.tsx` (`TopNavBar`/`Footer`/`Button`, identical
token classes) — no new visual language introduced. No `metadata`
export here, since `error.tsx` is a Client Component and the Metadata
API is Server-Component-only.

---

## 6. Production readiness review (Task 5)

Reviewed **only** the six areas named in the brief — no other file was
inspected or modified as part of this review.

### SEO / Metadata
- All 6 static public pages and the dynamic `/portfolio/[slug]` route
  carry `title`, `description`, `openGraph`, and `twitter` metadata
  (Phase 9.3.13-A) — unchanged and confirmed still present.
- `metadataBase` (root `layout.tsx`) correctly resolves the relative
  `openGraph.url`/`images` paths used across those pages into absolute
  URLs (Phase 9.3.13-A §4) — unchanged.
- `/review/[token]` correctly opts out of indexing at the page level;
  `not-found.tsx` (new, this phase) now does the same for the 404 page.
- **Gap, unresolved:** `/brand-identity` and `/testimonials` still have
  no `openGraph`/`twitter` metadata (flagged, not introduced, in Phase
  9.3.13-A §5/§7 — Task 4 of that phase named a closed 6-page list that
  didn't include them). Still open; out of this phase's scope to add.
- **Gap, unresolved:** no `alternates.canonical` and no JSON-LD anywhere
  in the app (also flagged, not built, in 9.3.13-A §5/§7). Still open.

### Robots
- `robots.ts` (new, this phase) now exists and correctly scopes out
  `/admin`, `/review`, and `/api/auth` while allowing the public site.
- Before this phase, there was no `robots.txt` at all — Next.js served
  none by default. This is now resolved.

### Sitemap
- `sitemap.ts` (new, this phase) now exists and correctly lists the 8
  static public routes plus every `PUBLISHED` project slug.
- Before this phase, there was no `sitemap.xml` at all. This is now
  resolved.
- **Limitation, unresolved:** `portfolio/[slug]/page.tsx` itself does
  not filter by `status` when resolving a slug (confirmed by reading
  the file — `getProjects()`/`getProjectBySlug()` return draft rows
  too), so a draft project's URL would still render if requested
  directly or linked from elsewhere; the sitemap simply doesn't
  advertise it. Fixing that filter would mean editing
  `portfolio/[slug]/page.tsx` (or `src/lib/data/projects.ts`), which is
  outside this phase's closed file list (sitemap.ts, robots.ts,
  not-found.tsx, error.tsx only) — flagged here rather than silently
  patched.

### Cloudinary compatibility
- `next.config.ts`'s `images.remotePatterns` for `res.cloudinary.com`
  (Phase 9.3.13-A) is unchanged and still correct — confirmed by
  reading the file directly rather than assumed.
- Still true as of this phase: no page currently renders a Cloudinary
  URL through `next/image` (the admin editor's live preview still uses
  a plain `<img>`, per the 9.3.13-A report §2) — this phase didn't touch
  that, since it's component-library/admin territory.

### `next/image` compatibility
- No `next/image` usage was added or needed by any of this phase's four
  new files (`not-found.tsx`/`error.tsx` use only text and existing
  components; no imagery).
- The `remotePatterns` config above is the only prerequisite this phase
  could contribute to, and it was already in place from 9.3.13-A.

---

## 7. Remaining limitations

- **`/brand-identity` and `/testimonials` have no OpenGraph/Twitter
  metadata** (carried over from 9.3.13-A, still unresolved).
- **No `alternates.canonical` and no JSON-LD** anywhere (carried over,
  still unresolved).
- **No default/site-wide OG image asset** — `public/` is still empty
  (carried over from 9.3.13-A §5/§7); the static pages' `openGraph`/
  `twitter` blocks still have no `images` field for this reason.
- **Draft projects remain reachable at their `/portfolio/[slug]` URL**
  even though the sitemap excludes them — the underlying data-fetch
  functions don't filter by `status`. Out of this phase's file scope to
  fix (see §6, "Sitemap").
- **No Cloudinary image is yet rendered through `next/image`
  anywhere in the app** — the `remotePatterns` config is a prerequisite
  only, not yet exercised (carried over from 9.3.13-A §2/§7).
- **`metadataBase` still reuses `NEXTAUTH_URL`** rather than a
  purpose-named site-URL variable (carried over from 9.3.13-A §4/§7);
  `sitemap.ts` and `robots.ts` in this phase reuse the same env var for
  the same single-domain-deployment reasoning, for consistency.

---

## 8. Build verification

**Deferred, as instructed.** No `npm install`, `npx prisma generate`,
`npm run lint`, or `npm run build` was executed. This sandbox has no
outbound network access (confirmed in prior phases) and no
`node_modules` installed for this project, so a real typecheck/build
couldn't be run even informally. No speculative fix was attempted.

Before shipping, run `npm install && npx prisma generate && npm run lint
&& npm run build` in an environment with registry access, then verify:
- `/sitemap.xml` renders all expected URLs and only `PUBLISHED` projects.
- `/robots.txt` renders the expected `Allow`/`Disallow` rules and a
  correct absolute `Sitemap:` URL for the real deployment domain.
- A forced error (e.g. throwing inside a page temporarily) renders
  `error.tsx` and that "Try again" actually recovers.
- An unmatched route (and an invalid `/portfolio/[slug]`) renders
  `not-found.tsx`.

---

## Final Validation

| Check | Result |
|---|---|
| `src/app/sitemap.ts` created — static routes + published Project slugs, no invented routes | ✅ |
| `src/app/robots.ts` created — allows public pages, disallows `/admin`, `/review`, `/api/auth` | ✅ |
| `src/app/not-found.tsx` created — existing design system only, no redesign | ✅ |
| `src/app/error.tsx` created — existing design system, graceful `reset()` recovery | ✅ |
| No new Prisma models / schema changes | ✅ schema untouched |
| No new routes beyond the four listed above | ✅ |
| Authentication, middleware, database schema, uploads, component library, admin pages, design system | ✅ untouched |
| Build/lint/typecheck executed | ⏭️ deferred, as explicitly instructed — see §8 |

---

Final Status:

**Implementation: PASS** — all five tasks delivered exactly within the
allowed file list (`sitemap.ts`, `robots.ts`, `not-found.tsx`,
`error.tsx`, plus this report). **Verification: DEFERRED**, per explicit
instruction; not claimed as a passing build.
