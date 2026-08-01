# database

Reserved for the future query/data-access layer for the three approved entities:
Projects, Testimonials, Messages (Architecture Decision Record, Decision 1).

As of Phase 9.3.8 ("Database & Authentication Foundation"), the Prisma schema
itself has been created at `prisma/schema.prisma` (repo root, alongside
`package.json` — the standard Prisma/Next.js location, and the path this
project's own foundation plan specifies), not inside this folder. The Prisma
Client connection helper lives at `src/lib/db.ts`.

As of Phase 9.3.9 ("Database Integration"), the query/data-access layer this
folder was reserved for has been added — but at `src/lib/data/` (reads:
`projects.ts`, `testimonials.ts`, `messages.ts`) and `src/lib/actions/`
(Server Action mutations: `projects.ts`, `testimonials.ts`, `messages.ts`),
alongside this project's existing `src/lib/*` convention, rather than inside
this `src/database/` folder. This folder remains reserved/empty; nothing
was added here in Phase 9.3.9.

Per the Architecture Decision Record, a Settings entity must NOT be added to
the schema unless explicitly approved in future documentation — Phase 9.3.8
did not add one, and Phase 9.3.9 (Database Integration) leaves that
restriction unchanged.

Phase 9.3.10 ("Authentication Core Foundation") added the single-owner
Credentials login but, per this same restriction (and the phase's own
"no `User` model" rule), did **not** add a `User` (or any other) table to
`prisma/schema.prisma` — it remains exactly `Project`, `Testimonial`,
`Message`. The one owner record is instead stored outside Prisma entirely,
as a JSON file — see `src/lib/owner-store.ts`.
