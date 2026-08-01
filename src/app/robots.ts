import type { MetadataRoute } from "next";

// Phase 9.3.13-B — Robots (Task 2).
//
// Allows the public site; disallows the three categories named in the
// brief:
// - Admin: /admin (Page_Structure PART B, §10-16 — login, setup, dashboard,
//   and every management page all live under this one path prefix).
// - Private: /review (the private, unguessable per-project token-link
//   route from Phase 9.3.11 — the closest match in this codebase to
//   "private"; its own page already sets
//   `robots: { index: false, follow: false }` at the page level, and this
//   entry backs that up at the crawler-directive level too).
// - Authentication routes: /api/auth (the Auth.js NextAuth route handler,
//   src/app/api/auth/[...nextauth]/route.ts — the only auth-related route
//   in the app).
const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/review", "/api/auth"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
