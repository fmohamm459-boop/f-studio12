import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { verifyOwnerCredentials } from "@/lib/owner-store";

// Auth.js (NextAuth) instance (Phase 9.3.8 "Authentication Foundation";
// Credentials provider added in Phase 9.3.10-A "Authentication Core
// Foundation").
//
//   - `handlers`  → re-exported by src/app/api/auth/[...nextauth]/route.ts
//                   (the one API route this phase is allowed to add).
//   - `auth`      → consumed by src/middleware.ts (unchanged, pre-existing
//                   from Phase 9.3.8) for route protection, and available
//                   to Server Components.
//   - `signIn` /
//     `signOut`   → `signIn` is now called by the login Server Action
//                   (src/lib/actions/auth.ts), wired into the existing
//                   /admin/login form. `signOut` is exported but
//                   intentionally unused this phase — Logout UI is a
//                   separately-scoped deliverable (see phase report).
//
// The single Credentials provider below is the only provider registered —
// no OAuth, no email/magic-link provider. It is defined here (Node
// runtime), not in auth.config.ts (Edge runtime, imported by
// middleware.ts), because `authorize()` needs bcrypt password comparison
// and filesystem access (src/lib/owner-store.ts), neither of which are
// Edge-safe. This is the standard Auth.js v5 split-config pattern for
// Credentials + middleware.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Owner Credentials",
      // Username + Password only — no "email" field. The provider does
      // not know or care that Page_Structure.md's Admin Login/Setup pages
      // pre-date this phase; it only ever receives whatever the login
      // Server Action forwards.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }
        if (!username || !password) {
          return null;
        }

        const owner = await verifyOwnerCredentials(username, password);
        if (!owner) {
          return null;
        }

        return { id: "owner", name: owner.name, username: owner.username };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "f-studio-default-auth-secret-key-32chars-min",
});

