# F Studio — Phase 9.3.10-A Authentication Core Foundation Report

**Scope:** Complete the Auth.js v5 Credentials configuration and wire the
single-owner authentication + Initial Owner Setup flows end-to-end,
continuing from the uploaded Phase 9.3.9 project. No middleware/route-guard
changes, no Logout UI, no OAuth, no new database model — see "Forbidden" in
the brief, honored as described below.

**Environment note:** as in every prior phase, this sandbox has no network
access, so `npm install`, `prisma generate`, and `next build`/`tsc --noEmit`
could not be run against real dependencies. Every file below was
hand-written and re-checked (brace/paren balance verified programmatically;
every changed/added file diffed against the Phase 9.3.9 upload to confirm
the change list below is exhaustive), but a real build/typecheck has not
been executed. **Please run `npm install && npx prisma generate && npm run
build` before shipping.**

---

## 1. Created files

| File | Purpose |
|---|---|
| `src/lib/owner-store.ts` | Single-owner credential store: reads/writes one JSON record (`username`, bcrypt `passwordHash`, `name`, `createdAt`) at `.data/owner.json`. Exports `getOwner`, `hasOwner`, `createOwner`, `verifyOwnerCredentials`. |
| `src/lib/actions/auth.ts` | `loginAction` Server Action — calls Auth.js's `signIn("credentials", ...)`, redirects to `/admin/dashboard` on success or back to `/admin/login?error=invalid-credentials` on failure. |
| `src/lib/actions/owner.ts` | `createOwnerAction` Server Action — enforces single-owner (redirects to login if one exists), validates the setup form fields, calls `createOwner`. |
| `src/types/next-auth.d.ts` | Module augmentation adding `id`/`username` to Auth.js's `Session`, `User`, and `JWT` types (type-only; no runtime behavior). |

## 2. Modified files

| File | Change |
|---|---|
| `src/auth.ts` | Added the single Credentials provider (`authorize()` calls `verifyOwnerCredentials`), returning `{ id: "owner", name, username }` on success or `null` on failure. |
| `src/auth.config.ts` | Added `jwt`/`session` callbacks that copy the owner's `id`/`username` from `authorize()` onto the token/session. `authorized` callback and empty edge-safe `providers: []` left exactly as Phase 9.3.8 wrote them. |
| `src/app/admin/login/page.tsx` | Form now has `action={loginAction}`. Identifier field renamed `email` → `username` (`type="text"`, label "Username" — was `type="email"`, label "Email"). Added an inline error string on `?error=invalid-credentials`. No layout/class/structural change. |
| `src/app/admin/setup/page.tsx` | Form now has `action={createOwnerAction}`. Page is now `async` and calls `hasOwner()` first, redirecting to `/admin/login` if an owner already exists (setup permanently disabled). Identifier field renamed `email` → `username` the same way as Login. Added inline error strings for the three validation failure states. No layout/class/structural change. |
| `package.json` | Added `bcryptjs` (dependency) + `@types/bcryptjs` (devDependency) — pure-JS password hashing, chosen over `bcrypt` to avoid a native/node-gyp build step. |
| `src/lib/README.md` | Documented the three new `lib/` files. |
| `src/database/README.md` | Added a note that Phase 9.3.10 did not add a `User` table, consistent with its own existing record of the approved-models restriction. |
| `.gitignore` | Did not exist before this phase; created with the usual Next.js/Node entries plus `.data/` (the new owner-credential file — see §3, must never be committed). |

**`src/middleware.ts` was intentionally left untouched.** It already exists
from Phase 9.3.8 and already implements route protection for the 5 admin
routes; this phase's brief lists "Middleware protection" / "Route guards"
under **Forbidden**, which is read here as "do not add or modify
route-protection logic this phase" — not as "remove the route protection
Phase 9.3.8 already shipped." Practical effect: because a Credentials
provider now exists, the middleware's existing `req.auth?.user` check can,
for the first time, actually succeed once someone signs in — but that
behavior comes from Phase 9.3.8's file working as designed, not from any
new code written in this phase.

No public page, admin page other than Login/Setup, component, layout,
Prisma schema, or `mock-data.ts`/`services-content.ts` content file was
touched. The full-tree diff against the Phase 9.3.9 upload confirms the
lists above are exhaustive.

---

## 3. Why a JSON file instead of a database model

The brief forbids a `User` model (and `Role`/`Permission`/etc.), and the
project's Architecture Decision Record already restricts
`prisma/schema.prisma` to exactly `Project`, `Testimonial`, `Message`.
Credentials auth still needs *somewhere* to persist the one owner's
username + password hash between Setup and every later Login, so
`src/lib/owner-store.ts` stores that single record as a JSON file at
`.data/owner.json` (git-ignored) rather than a database row. This is the
smallest persistence mechanism that satisfies "single owner account" and
"no new database model" simultaneously — the same kind of judgment call
prior phases (`next-auth` version, Next.js version) made explicitly rather
than silently. See §6 for the real limitation this introduces.

---

## 4. Authentication flow

1. **First run:** `/admin/setup` calls `hasOwner()`. No record exists →
   the existing form renders (name, username, password, confirm).
2. **Submit:** the form posts to `createOwnerAction`, which re-checks
   `hasOwner()` (defense against a race/resubmit), validates the fields
   (all required, passwords match, ≥ 12 characters — the form's own hint),
   then calls `createOwner()`, which bcrypt-hashes the password (cost 12)
   and writes `.data/owner.json`.
3. **Redirect:** on success, back to `/admin/login?setup=complete`. On
   validation failure, back to `/admin/setup?error=<reason>` with the
   matching inline message.
4. **Later runs:** visiting `/admin/setup` once an owner exists
   immediately redirects to `/admin/login` — setup is permanently
   disabled, per the brief.
5. **Login:** `/admin/login`'s form posts to `loginAction`, which calls
   `signIn("credentials", { username, password, redirectTo:
   "/admin/dashboard" })`.
6. **Credentials provider (`src/auth.ts`) `authorize()`:** looks up the
   owner via `verifyOwnerCredentials(username, password)` (username exact
   match + `bcrypt.compare` against the stored hash). Returns
   `{ id: "owner", name, username }` on success, `null` on any failure
   (no owner yet, wrong username, wrong password) — Auth.js surfaces a
   `null` return as a generic `CredentialsSignin` `AuthError`.
7. **On success:** Auth.js issues a JWT session and redirects to
   `/admin/dashboard`. **On failure:** `loginAction` catches the
   `AuthError` and redirects to `/admin/login?error=invalid-credentials`,
   which the page renders as an inline password-field error.

Only Credentials, only one provider, only username + password — no email
field/verification, no OAuth, no registration flow beyond the single Setup
form, no roles.

---

## 5. Session flow

- `session.strategy: "jwt"` (unchanged from Phase 9.3.8) — no database
  adapter, so nothing session-related touches Postgres/Prisma.
- New this phase: the `jwt` callback copies `user.id`/`user.username`
  (from `authorize()`'s return value) onto the token on sign-in; the
  `session` callback copies them from the token onto `session.user` on
  every session read.
- This is **preparation**, not new consumption: no page or component
  currently reads `session.user.id`/`username` — that's available for a
  future phase (e.g. a "Signed in as ..." label, or Logout wiring), per
  the brief's "Prepare session management" (vs. "Implement").
- The module augmentation in `src/types/next-auth.d.ts` makes
  `session.user.id`/`.username` and `token.id`/`.username` type-safe
  without `as`-casts anywhere in `auth.config.ts` or `auth.ts`.

---

## 6. Validation

| Check | Result |
|---|---|
| Auth.js v5 configuration complete | ✅ Credentials provider registered in `src/auth.ts`; edge-safe `auth.config.ts` still has zero Node-only imports |
| Credentials-only, username + password | ✅ one provider, `username`/`password` fields only; no email field, no OAuth provider |
| Single owner enforced | ✅ `createOwner()` throws if `hasOwner()` is true; `createOwnerAction` and the Setup page both check `hasOwner()` before rendering/writing |
| Setup disabled after first use | ✅ `/admin/setup` redirects to `/admin/login` once `.data/owner.json` exists |
| Login flow reaches a real session | ✅ `authorize()` returns a user object on a verified username/password match; JWT session issued by Auth.js |
| No middleware/route-guard changes | ✅ `src/middleware.ts` byte-identical to the Phase 9.3.9 upload (confirmed by diff) |
| No Logout UI | ✅ no logout button/link/action added anywhere; `signOut` remains exported but uncalled |
| No OAuth / Google / GitHub / Email login | ✅ `providers: [Credentials(...)]` only |
| No user registration beyond single-owner Setup | ✅ `createOwnerAction` is single-use by construction (see above) |
| No roles / permissions / multi-user | ✅ no role/permission field anywhere; `id` is the constant string `"owner"` |
| No Client authentication | ✅ nothing touches the public Client Review page or Decision Record 002 |
| No forbidden database models | ✅ `prisma/schema.prisma` untouched — still exactly `Project`, `Testimonial`, `Message` (confirmed by diff) |
| Public pages unchanged | ✅ only `admin/login` and `admin/setup` were touched, and only their `<form>` wiring + one field's name/type/label; diff confirms no other page/component/layout was touched |
| No real build/typecheck run | ⚠️ see Environment note above — brace/paren-balance checked programmatically instead |

---

## 7. Remaining limitations

- **No real build/typecheck was run** (no network access in this
  environment). Run `npm install && npx prisma generate && npm run build`
  (or `tsc --noEmit`) before shipping. In particular, please confirm
  `next-auth@5.0.0-beta.25`'s exact `Credentials` provider and `AuthError`
  export signatures match what's written here — this was hand-written
  against the documented v5 beta API, not verified against installed
  types.
- **The JSON-file owner store is not durable on most serverless
  deployments** (see §3). Vercel's production filesystem is read-only
  outside `/tmp`, and `/tmp` is not guaranteed to persist across
  invocations or be shared across instances — so in a real Vercel
  deployment, the owner record written by Setup may vanish before the
  next Login request reaches the same instance. This is acceptable for
  local development and for proving this phase's Credentials +
  single-owner flow end-to-end, but a production deployment needs a
  durable, **separately-approved** persistence decision (e.g. a
  dedicated, explicitly-approved migration reusing the existing Postgres
  database, or a managed secret store) before this can be trusted in
  production. This is flagged here rather than solved silently, matching
  how prior phases flagged their own environment-driven judgment calls.
- **`bcryptjs` was added but not installed/verified** in this
  environment — it is pure JS (no native build step), chosen deliberately
  over `bcrypt` for that reason, but `npm install` still needs to run
  before anything here executes.
- **Login/Setup form fields were minimally edited** (identifier field
  `email` → `username`; `type="email"` → `type="text"`) to satisfy this
  phase's explicit "Username + Password... No Email login" requirement.
  This is a one-attribute-per-field content change, not a layout or
  visual-design change — no spacing, class, component, or structural edit
  was made to either page. Flagged explicitly since the brief also says
  "Do not redesign UI"; this was read as "don't change the visual design,"
  not as "the field must stay mislabeled 'Email' while behaving as a
  username."
- **Logout UI is out of scope this phase** (per "Forbidden") — `signOut`
  is exported from `src/auth.ts` but nothing calls it yet. A signed-in
  owner currently has no in-app way to end their session.
- **No password-strength enforcement beyond length** (≥ 12 characters, the
  number the existing form's own hint already advertised) — no complexity
  rules were added, since none were specified and adding them would be
  UI-adjacent scope creep beyond "prepare owner initial setup logic."
- **Setup's race condition is best-effort, not transactional**: two
  concurrent first-run submissions could both pass the `hasOwner()` check
  before either writes the file. Given this is a one-time, operator-run
  step (not a public-facing flow), this was judged acceptable for a Core
  Foundation pass rather than adding file-locking logic.

---

Final Status:
PASS
