# F Studio — Phase 9.3.13-A SEO Foundation & Metadata Report

**Scope:** Cloudinary `images.remotePatterns` configuration and Next.js
Metadata API (title, description, OpenGraph, Twitter Card) across the six
named static public pages plus the dynamic Project Details route,
continuing strictly from the uploaded Phase 9.3.12 Stage 2 project. No
authentication, middleware, schema, Server Action, Cloudinary upload,
component library, admin page, or design-system file was touched.

---

## 1. Modified files

| File | Change |
|---|---|
| `next.config.ts` | Added `images.remotePatterns` for `res.cloudinary.com` only. No other `images` setting (`formats`) or any other config key changed. |
| `src/app/layout.tsx` | Added `metadataBase` to the existing root `metadata` export (needed to resolve relative URLs used in each page's `openGraph`/`twitter` fields into absolute ones). Reuses the existing `NEXTAUTH_URL` env var rather than adding a new one — see §4. Title/description already there were left exactly as they were. |
| `src/app/(public)/page.tsx` (Home) | Existing `title`/`description` extracted into local consts, reused verbatim; `openGraph` and `twitter` added. |
| `src/app/(public)/about/page.tsx` | Same pattern. |
| `src/app/(public)/services/page.tsx` | Same pattern. |
| `src/app/(public)/portfolio/page.tsx` | Same pattern. |
| `src/app/(public)/contact/page.tsx` | Same pattern. |
| `src/app/(public)/client-review/page.tsx` | Same pattern — this is the static feedback-form page at `/client-review` (Page_Structure §9), **not** the private `/review/[token]` route from Phase 9.3.11 (see §5 for why that route was deliberately left alone). |
| `src/app/(public)/portfolio/[slug]/page.tsx` | `generateMetadata` extended in place — see §3. |

No file was created this phase; every one of the 6 named static pages,
and the dynamic route, already existed with a working `metadata` export
or `generateMetadata` function (title + description only) from earlier
phases — this phase only added the `openGraph`/`twitter` fields to what
was already there.

---

## 2. Cloudinary configuration (Task 1)

```ts
images: {
  formats: ["image/avif", "image/webp"],   // unchanged, from an earlier phase
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
  ],
},
```

This is the one config `next/image` needs to serve Cloudinary-hosted
URLs (`Project.heroImage`/`galleryImages`, added in Phase 9.3.12 Stage 2)
through Next's image optimizer. Nothing currently in the codebase calls
`next/image` with a Cloudinary URL yet — the admin editor's live preview
uses a plain `<img>` (documented in the Stage 2 report, since this exact
config didn't exist until now) — so this change has no visible effect by
itself; it's the prerequisite a future phase would need to start using
`next/image` for hero/gallery images on public pages, and is the reason
this task was placed in an "SEO Foundation" phase (`next/image` is also
how the OpenGraph image on `/portfolio/[slug]` — see §3 — would eventually
be optimized if rendered on-page, not just referenced in metadata).

---

## 3. Portfolio dynamic metadata (Task 3)

`generateMetadata` in `portfolio/[slug]/page.tsx` already called
`getProjectBySlug(params.slug)` and derived `title`/`description` from
the result. This phase extended the same function, from the same fetch,
with no second query and no hardcoded per-project copy:

```ts
export async function generateMetadata({ params }: ProjectDetailsPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return { title: "Project not found — F Studio" };
  }

  const title = `${project.title} — F Studio`;
  const description = project.summary;
  const openGraphImages = project.heroImage ? [{ url: project.heroImage }] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, url: `/portfolio/${project.slug}`, siteName: "F Studio", type: "article", images: openGraphImages },
    twitter: { card: openGraphImages ? "summary_large_image" : "summary", title, description, images: openGraphImages },
  };
}
```

**"Do not duplicate data" (Task 3), read literally:** `title` and
`description` are each computed once, as local variables, and reused in
the top-level metadata, `openGraph`, and `twitter` blocks — the same
approach used on all six static pages (§1) — rather than being retyped
three times per page and risking drift. Nothing about a project's SEO
copy is authored anywhere outside this one function; it's 100%
database-derived.

**Per-project OG image:** `project.heroImage` (Phase 9.3.12 Stage 2) is
used as the OpenGraph/Twitter image when a project has one uploaded —
these are real Cloudinary asset URLs, unlike the static pages (§5). When
a project has no hero image, `images` is simply omitted (not backfilled
with a placeholder) and the Twitter card degrades to `"summary"` (no
large-image layout without an image to show).

The existing `notFound()`-driving `if (!project)` branch, the page's own
`generateStaticParams`/`dynamic = "force-dynamic"` setup, and every other
line in this file are unchanged.

---

## 4. Root `metadataBase`

Next.js requires `metadataBase` to turn a relative `openGraph.url` or
`openGraph.images` path into the absolute URL social platforms need.
Rather than introduce a new environment variable (which would mean
touching `.env.example`, a file outside this phase's allowed list), the
existing `NEXTAUTH_URL` was reused — in this single-domain deployment it
already holds the site's own base URL. Flagged explicitly in case a
dedicated `NEXT_PUBLIC_SITE_URL` is ever preferred; not introduced here.

---

## 5. What was deliberately left out

- **`/brand-identity`, `/testimonials`, `/review/[token]`** were **not**
  touched. Task 4's static-page list was explicit and closed: Home,
  About, Services, Portfolio, Contact, Client Review. Brand Identity and
  Testimonials both already exist (from earlier phases) but weren't
  named, so they were left exactly as-is rather than assumed into scope.
  `/review/[token]` (Phase 9.3.11's private token-link page) already has
  its own metadata with `robots: { index: false, follow: false }` — it
  isn't part of Page_Structure's public IA at all, and Task 4 doesn't
  name it, so it wasn't revisited.
- **No default/site-wide OG image asset exists.** `public/` is currently
  empty — there is no shipped logo, favicon, or OG image file anywhere in
  this project. The six static pages' `openGraph`/`twitter` blocks
  therefore have no `images` field: referencing a path like
  `/og-image.png` that doesn't actually exist would look like SEO
  metadata but 404 the moment any crawler or social platform tried to
  fetch it — worse than omitting it. This is flagged, not silently
  patched over; see §6.
- **No `alternates.canonical`** was added — Task 2 named title,
  description, OpenGraph, and Twitter Card specifically; canonical URLs
  weren't requested, so none were added, to keep this phase's diff
  scoped to exactly what was asked.
- **No JSON-LD / structured data** — also not requested; noted as a
  natural next step for an "SEO Foundation" phase, not built here.

---

## 6. Build verification

**Deferred, as instructed.** No `npm install`, `npx prisma generate`,
`npm run lint`, or `npm run build` was executed this turn — this sandbox
has been confirmed (Phase 9.3.12) to have no outbound network access, and
this phase's brief explicitly said not to run these commands and to
report the deferral instead. No speculative fix was attempted.

Before shipping, run `npm install && npx prisma generate && npm run lint
&& npm run build` in an environment with registry access, and separately
verify social previews with each platform's own debug tool (e.g.
Facebook's Sharing Debugger, Twitter/X's Card Validator) once a real
deployment URL and OG image asset exist — metadata correctness at the
code level doesn't guarantee a given platform renders it as expected.

---

## 7. Remaining limitations

- **No OG image asset exists yet** (§5) — the single highest-value
  follow-up for actual social-share appearance. Once a `/public/og-*`
  (or Cloudinary-hosted) default image is added, each static page needs
  exactly one line (`images: ["/og-image.png"]` or similar) added to its
  already-structured `openGraph`/`twitter` blocks.
- **Brand Identity and Testimonials pages have no metadata beyond
  whatever they already had before this phase** (unchanged) — flagged
  per §5, pending an explicit decision to include them in a future SEO
  pass.
- **`metadataBase` reuses `NEXTAUTH_URL`** rather than a purpose-named
  site-URL variable (§4) — functionally correct for this single-domain
  deployment, but worth a dedicated `NEXT_PUBLIC_SITE_URL` if the app and
  auth domain ever diverge.
- **No structured data (JSON-LD)** and **no `alternates.canonical`** —
  not requested this phase, not built (§5).
- **Build/lint/typecheck not run** — deferred per explicit instruction;
  see §6.

---

## Final Validation

| Check | Result |
|---|---|
| `next.config.ts`: only Cloudinary `remotePatterns` added | ✅ |
| Metadata API implemented for Home, About, Services, Portfolio, Contact, Client Review | ✅ all six, title/description preserved, OpenGraph + Twitter Card added |
| `/portfolio/[slug]` dynamic metadata loads from the database, no duplicated data | ✅ single fetch reused for title/description/OG image; no hardcoded per-project copy |
| No new pages | ✅ |
| No new Prisma models / schema changes | ✅ schema untouched |
| Authentication, middleware, Server Actions, Cloudinary upload mechanics, component library, admin pages, design system | ✅ untouched — confirmed by diff against the uploaded Phase 9.3.12 Stage 2 project (exactly the 9 files in §1 differ) |
| Build/lint/typecheck executed | ⏭️ deferred, as explicitly instructed — see §6 |

---

Final Status:

**Implementation: PASS** — all four tasks delivered exactly within the
allowed file list. **Verification: DEFERRED**, per explicit instruction;
not claimed as a passing build.
