import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Route protection (Phase 9.3.8, "Authentication Foundation"; made
// functional + Edge-compatible in Phase 9.3.10-B, "Authentication
// Completion & Final Verification").
//
// Guards the 5 authenticated admin routes (Page_Structure.md PART B §12-16:
// Admin Dashboard, Projects Management, Messages Management, Testimonials
// Management, Settings) behind a session check, while leaving the two
// pre-auth admin pages reachable: Admin Login (§10) and Initial Owner
// Setup (§11). Anonymous requests to any protected route are redirected to
// /admin/login (Task 1).
//
// This also IS the session verification step (Task 2): `auth((req) => ...)`
// below decodes and validates the session JWT before this callback ever
// runs, and `req.auth?.user` reflects that verified result. Because
// Next.js Middleware runs before the matched page is rendered, no
// protected page (dashboard/projects/messages/testimonials/settings) can
// render for a request that fails this check — verification happens here,
// once, rather than being duplicated in each page component (Task 4: "Do
// NOT duplicate authentication logic").
//
// CRITICAL BUG FIXED (Phase 9.3.10-B) — Auth.js v5 Edge compatibility:
// this file previously imported `auth` from `./auth` (src/auth.ts), the
// FULL Auth.js instance. `src/auth.ts` registers the Credentials provider,
// whose `authorize()` calls `verifyOwnerCredentials` (src/lib/owner-store.ts),
// which imports Node's `fs`/`path`. Next.js Middleware runs on the Edge
// runtime by default, and this project targets Next 14.2 (no stable
// Node.js-runtime-for-middleware option) — so bundling `src/auth.ts` here
// would attempt to bundle `fs`/`path` into the Edge middleware bundle,
// which fails. This is why `auth.ts` and `auth.config.ts` are split files
// in the first place (see auth.config.ts's own header comment, written in
// Phase 9.3.8) — but middleware.ts itself was never actually updated to
// import the providers-free `auth.config.ts` once a real provider (with
// Node-only dependencies) was added in Phase 9.3.10-A. Middleware only
// ever needs to *read* an already-issued session (JWT decode + the
// `authorized` callback below); it never calls `authorize()`, so building
// a separate instance from `auth.config.ts` alone is correct and
// sufficient, and keeps this file Edge-safe. No authentication logic
// changed — only which config the instance is built from.
const { auth } = NextAuth(authConfig);

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isAuthorized = Boolean(req.auth?.user);
  if (!isAuthorized) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Scoped to admin routes only — public pages, the Auth.js API route
  // itself, static assets, and Next.js internals are never matched.
  matcher: ["/admin/:path*"],
};
