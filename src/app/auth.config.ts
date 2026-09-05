import type { NextAuthConfig } from "next-auth";

// Auth.js (NextAuth) edge-safe configuration (Phase 9.3.8, "Authentication
// Foundation"; jwt/session callbacks added in Phase 9.3.10-A "Authentication
// Core Foundation"; `secret` added in Phase 9.3.10-B "Authentication
// Completion & Final Verification" — see the note below and this phase's
// report, "Middleware validation").
//
// Split out from auth.ts per Auth.js's standard middleware pattern: this
// file is imported by src/middleware.ts and therefore must stay free of
// Node-only imports (no Prisma Client, no bcrypt, no filesystem access,
// etc.) so it can run in the Edge runtime.
//
//   - NO providers are registered here. The single Credentials provider
//     (Phase 9.3.10-A) is registered in src/auth.ts instead, because its
//     `authorize()` needs bcrypt + filesystem access (src/lib/owner-store.ts),
//     which are not Edge-safe. `src/auth.ts` spreads this config and adds
//     `providers` on top, so middleware never needs to know about it.
//   - NO OAuth providers.
//   - NO adapter is configured, so sessions are JWT-only and nothing is
//     persisted to the database. An adapter would additionally require
//     User/Account/Session tables, which fall outside this project's
//     "approved models ONLY" restriction (Project, Testimonial, Message).
//   - The `authorized` callback only reports whether a session already
//     exists; it does not decide who may obtain one — that decision lives
//     in the Credentials provider's `authorize()` in src/auth.ts.
//   - `jwt`/`session` callbacks (added Phase 9.3.10-A) only copy the
//     owner's id/username from the Credentials `authorize()` result onto
//     the token/session — session-shape preparation only.
//   - `secret` (Phase 9.3.10-B): src/middleware.ts now builds its own
//     `NextAuth(authConfig)` instance directly from this file (Edge-safe
//     fix — see middleware.ts's own comment), separate from src/auth.ts's
//     Node instance. Both instances must sign/verify session JWTs with the
//     same secret, or a session issued at sign-in (Node instance) would
//     fail to validate in middleware (Edge instance) — every request would
//     then bounce back to /admin/login even after a successful login.
//     Reading it here with the same `AUTH_SECRET` / `NEXTAUTH_SECRET`
//     fallback src/auth.ts already used keeps the two instances in sync.
//     `process.env` access is itself Edge-safe; only Node APIs like `fs`
//     are not — so this does not reintroduce the Edge-compatibility issue
//     this split was written to avoid.
export default {
  providers: [
    // Intentionally empty — see note above. The real provider lives in
    // src/auth.ts (Node runtime), not here.
  ],

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "f-studio-default-auth-secret-key-32chars-min",

  pages: {
    // Route Page_Structure.md §10 Admin Login as the sign-in surface,
    // instead of Auth.js's default built-in page.
    signIn: "/admin/login",
  },

  session: {
    // JWT sessions only — see "NO adapter" above.
    strategy: "jwt",
  },

  callbacks: {
    // Route-protection preparation only, consumed by src/middleware.ts.
    // Pass-through check: true once a session exists, false otherwise.
    // Does not implement sign-in, registration, or permission/role logic.
    authorized({ auth }) {
      return Boolean(auth?.user);
    },

    // Session management preparation (Phase 9.3.10-A): carry the owner's
    // id/username from the Credentials `authorize()` result into the JWT,
    // then onto the session object, so a future phase (e.g. Logout UI,
    // or a display of "signed in as ...") has it available without
    // re-querying anything. No role/permission field is added — a single
    // owner has nothing to distinguish.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
