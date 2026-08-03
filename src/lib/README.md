# lib

Utility and configuration modules (db client, auth config, helpers).

- `fonts.ts` — typography wiring.
- `icons.tsx`, `services-content.ts` — existing page/content data.
- `mock-data.ts` — still exports the `Project`/`Testimonial`/`Message`
  (and related enum) types and `SERVICE_OPTIONS`, which pages and
  components continue to import. As of Phase 9.3.9, the static
  `PROJECTS`/`TESTIMONIALS`/`MESSAGES` arrays in this file are no longer
  read by any connected page (see `data/` below) but the file itself is
  unchanged and still backs the Contact form and any page not in this
  phase's integration scope (Home, Admin Dashboard).
- `db.ts` — Prisma Client connection helper (Phase 9.3.8).
- `db-mappers.ts` — Phase 9.3.9. Translates between Prisma's enum values
  (`BRANDING`, `PUBLISHED`, ...) and the string-literal shapes in
  `mock-data.ts` (`"Branding"`, `"Published"`, ...), so every existing
  page/component keeps the prop types it was already built against.
- `data/` — Phase 9.3.9. Read-only data-access functions per approved
  model: `projects.ts`, `testimonials.ts`, `messages.ts`. Each returns the
  same shape the corresponding mock array used to.
- `actions/` — Phase 9.3.9. Server Actions (`"use server"`) implementing
  the approved CRUD scope: Project and Testimonial get Create/Read/Update/
  Delete; Message gets Read/Delete only. No entity outside the three
  approved models is touched.

Auth.js configuration (`auth.ts`, `auth.config.ts`) lives at `src/` root, not
in this folder — that is Auth.js's own required file location for the
middleware-compatible split config pattern, not a project convention choice.

- `owner-store.ts` — Phase 9.3.10-A ("Authentication Core Foundation").
  Single-owner credential store (username + bcrypt password hash),
  persisted as a JSON file at `.data/owner.json` rather than a Prisma
  model — the project's approved-models restriction (Project, Testimonial,
  Message only) forbids adding a `User` table. See the file's own comments
  for the full reasoning and the production-durability limitation this
  implies (flagged in the Phase 9.3.10-A report).
- `actions/auth.ts` — Phase 9.3.10-A. `loginAction` Server Action, wired
  into the existing Admin Login form; calls Auth.js's `signIn("credentials", ...)`.
- `actions/owner.ts` — Phase 9.3.10-A. `createOwnerAction` Server Action,
  wired into the existing Initial Owner Setup form; validates input and
  calls `owner-store.ts`'s `createOwner`.
