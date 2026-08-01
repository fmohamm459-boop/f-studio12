# F Studio — Phase 9.3.8 Database & Authentication Foundation Report

**Scope:** Prepare Prisma (PostgreSQL) and Auth.js (NextAuth) infrastructure
only — schema, client wiring, and route-protection scaffolding. No CRUD, no
business logic, no login logic, no page/component changes, no migrations,
no seeding.

**Environment note:** This sandbox has no network access, so `npm install`,
`prisma generate`, and `next build`/`tsc --noEmit` could not be run against
real dependencies. Every file below was hand-written and re-checked
(brace/paren balance verified programmatically; every changed/added file
diffed against the original upload to confirm no unintended edits), but a
real build/typecheck has not been executed. **Please run `npm install &&
npx prisma generate && npm run build` before shipping.**

---

## 1. Created files

### Prisma foundation
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Datasource (PostgreSQL), generator, and the 3 approved models |

### Authentication foundation
| File | Purpose |
|---|---|
| `src/auth.config.ts` | Edge-safe Auth.js config: empty `providers`, `pages.signIn`, JWT `session`, `authorized` callback |
| `src/auth.ts` | `NextAuth(...)` instance exporting `handlers`, `auth`, `signIn`, `signOut` |
| `src/middleware.ts` | Route-protection preparation for `/admin/:path*`, excluding Login/Setup |
| `src/app/api/auth/[...nextauth]/route.ts` | The one Auth.js API route the brief explicitly allows; re-exports `handlers` only |

### Database preparation
| File | Purpose |
|---|---|
| `src/lib/db.ts` | Prisma Client singleton (globalThis-cached, dev-safe) |

No `.env.example` changes were needed — `DATABASE_URL`, `NEXTAUTH_URL`, and
`NEXTAUTH_SECRET` already existed in the file from an earlier phase and
already cover everything this phase's config reads (`src/auth.ts` accepts
either `AUTH_SECRET` or `NEXTAUTH_SECRET`, so the existing variable name
works without modification).

---

## 2. Modified files

| File | Change |
|---|---|
| `package.json` | Added `"postinstall": "prisma generate"`; bumped `next-auth` from `^4.24.0` → `^5.0.0-beta.25` |
| `src/database/README.md` | Updated to note the schema now lives at `prisma/schema.prisma`, not this folder, and that this folder still awaits a future query layer |
| `src/lib/README.md` | Updated to list `db.ts` and note `auth.ts`/`auth.config.ts` live at `src/` root (Auth.js's required location) |

**Why `next-auth` was bumped (and why nothing else in the "locked stack"
was):** the brief asks by name for `auth.ts` / `auth.config.ts` /
"middleware preparation" — this is the Auth.js **v5** file layout
(`NextAuth(config)` returning `{ handlers, auth, signIn, signOut }`, config
split for Edge middleware). `next-auth@4` uses a different API
(`pages/api/auth/[...nextauth].ts` + `getServerSession`) and has no
`auth.config.ts` concept, so delivering the requested file structure
required the v5 package. `next-auth@5` is still tagged `beta` upstream as
of this phase — run `npm install next-auth@beta` to pin the exact current
beta before shipping.

**Why `next` was deliberately left at `^14.2.0`**, despite the brief
listing "Next.js 15" in the locked stack: Next.js 15 makes `params` (and
`cookies()`/`headers()`) asynchronous in the App Router. This project's
existing dynamic route —
`src/app/(public)/portfolio/[slug]/page.tsx` — reads
`params: { slug: string }` synchronously (confirmed by inspection). Bumping
the Next major version would silently change that page's runtime behavior
under a Next 15 build without a single line of that file being edited,
which conflicts with this phase's own "existing pages remain unchanged"
requirement. Treating a framework major-version bump as its own
explicitly-scoped, page-by-page-verified phase — rather than a side effect
of an auth-package upgrade — was judged the safer reading of "do not
replace or modify the approved stack." This is flagged again in
§5 Limitations.

No public page, admin page, component, layout, or `mock-data.ts` /
`services-content.ts` content file was touched. Diffing the full delivered
tree against the original upload confirms the file list above is
exhaustive — nothing else changed.

---

## 3. Prisma models

Three approved models only (Architecture Decision Record, Decision 1) — no
`User`, `Settings`, or other entity was added:

- **`Project`** — mirrors `src/lib/mock-data.ts`'s `Project` type field-for-field
  (`slug`, `title`, `client`, `category`, `year`, `role`, `status`,
  `liveLink`, `summary`, `description`, `tags[]`, `overview`, `challenge`,
  `research`, `solution`, `resultStats` as `Json`), plus `id`/`createdAt`/`updatedAt`.
- **`Testimonial`** — mirrors `Testimonial` (`quote`, `author`, `role`,
  `rating`, `projectSlug`, `status`, `submittedAt`), plus `id`/`createdAt`/`updatedAt`.
- **`Message`** — mirrors `Message` (`name`, `email`, `subject`, `service`,
  `message`, `status`, `receivedAt`), plus `id`/`createdAt`/`updatedAt`.

`ProjectCategory`, `ProjectStatus`, `TestimonialStatus`, `MessageService`,
and `MessageStatus` enums mirror the corresponding string-literal union
types already used in `mock-data.ts`. No migration was generated (`prisma
migrate` was not run) and the database is not seeded, per the brief.

---

## 4. Auth.js foundation

- **Providers:** none registered. A Credentials provider that would back
  the existing `/admin/login` form is documented as a future step in
  `auth.config.ts`'s comments but is **not implemented**.
- **Adapter:** none. Sessions are JWT-only — a database adapter would
  additionally require `User`/`Account`/`Session` tables, which fall
  outside the three-model restriction.
- **Session config:** `strategy: "jwt"`, secret sourced from
  `AUTH_SECRET` or `NEXTAUTH_SECRET`.
- **Pages:** `signIn` routed to the existing `/admin/login` page (no new
  page created).
- **Middleware / route protection:** `src/middleware.ts` matches
  `/admin/:path*`, allow-lists `/admin/login` and `/admin/setup`, and
  redirects everything else to `/admin/login` when `req.auth?.user` is
  falsy.

**Important behavioral note:** because no provider is registered, no
session can ever be created yet — so **every** protected admin route
(`/admin/dashboard`, `/admin/projects`, `/admin/messages`,
`/admin/testimonials`, `/admin/settings`) will now redirect to
`/admin/login` until a future, separately-scoped phase adds real
credential logic. This is the intended, literal result of shipping the
"route protection preparation" the brief asked for — see §5.

---

## 5. Validation

| Check | Result |
|---|---|
| Existing pages unchanged | ✅ confirmed via full-tree diff against the original upload — no `.tsx` page/component/layout file was touched |
| Existing components unchanged | ✅ same diff — `src/components/**` untouched |
| Only database/auth foundation added | ✅ diff shows exactly: `prisma/schema.prisma`, `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/db.ts`, plus the `package.json`/README edits listed in §2 |
| No unauthorized files | ✅ nothing outside the deliverable list above was created |
| No CRUD / business logic | ✅ `db.ts` exports a client only; no query functions anywhere |
| No login logic / OAuth / registration / roles | ✅ `providers: []`; no credential-checking code exists |
| Approved models only | ✅ `Project`, `Testimonial`, `Message` — no others |
| No migrations generated | ✅ no `prisma/migrations/` folder created |
| No seeding | ✅ no seed script or seed data added |
| Mock data / pages not connected to DB | ✅ `mock-data.ts` still the only data source any page reads |

---

## 6. Remaining limitations

- **No real build/typecheck was run** (no network access in this
  environment). Run `npm install && npx prisma generate && npm run build`
  (or `tsc --noEmit`) before shipping.
- **`next-auth` is on a beta version** (`^5.0.0-beta.25`, upstream still
  tagged `beta`) — expected for Auth.js v5 at this time; re-pin to the
  exact current beta with `npm install next-auth@beta`.
- **Next.js framework version was intentionally not bumped to 15** (stays
  `^14.2.0`) — see §2 for the reasoning (async `params` would silently
  change `portfolio/[slug]/page.tsx` behavior). If a Next 15 upgrade is
  wanted, it should be its own explicitly-scoped phase with a page-by-page
  compatibility pass (`params`/`searchParams`/`cookies()`/`headers()` all
  became `Promise`-based in 15).
- **Visiting any of the 5 authenticated admin routes now redirects to
  `/admin/login`** (see §4) — there is currently no way to obtain a
  session, since no provider exists. This is expected/intentional given the
  brief's own "middleware preparation" / "route protection preparation"
  deliverables, but it does change today's manual-testing experience of the
  admin pages built in Phase 9.3.7 (their markup/behavior is unchanged;
  only reachability through `/admin/*` via the browser is now gated). A
  future phase adding the Credentials provider will restore normal access
  once real sign-in exists.
- **No Prisma Client can actually be generated/queried yet** in this
  environment (no `npm install`, no live PostgreSQL instance) — `db.ts` is
  unexercised code until a real environment runs `prisma generate` against
  a real `DATABASE_URL`.
- **`resultStats` on `Project` is stored as `Json`**, not a normalized
  relation, to stay within the "approved models ONLY" restriction — a
  future phase may choose to normalize it once new models are explicitly
  approved.
- **No type-augmentation file** (e.g. a `next-auth.d.ts` module
  augmentation for a custom `Session`/`JWT` shape) was added — the brief
  said "Do NOT create additional roles" and no custom session fields are
  needed yet, so the default Auth.js session type is used as-is.

---

## Final Status: **PASS**

The Prisma schema (3 approved models only, no migrations, no seed), the
Prisma Client connection helper, and the full Auth.js foundation
(`auth.ts`, `auth.config.ts`, JWT session config, middleware, and the one
required API route) are all in place. No existing page, component, layout,
or mock data file was modified or connected to the database, and no
login/OAuth/registration/permission logic was implemented. The two
stack-version judgment calls in §2 (next-auth v5, Next.js left at 14) are
called out explicitly rather than made silently.
