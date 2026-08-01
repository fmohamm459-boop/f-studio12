import type { DefaultSession } from "next-auth";

// Module augmentation (Phase 9.3.10-A, "Authentication Core Foundation").
//
// Extends Auth.js's default Session/JWT/User shapes with the two fields
// the single-owner Credentials flow needs: `id` (a constant "owner"
// identifier — there is no User table) and `username` (the value entered
// at Initial Owner Setup / Admin Login). No role/permission field is
// added — a single owner account has nothing to distinguish.
//
// This is a type-only change; it adds no runtime behavior.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
  }
}
