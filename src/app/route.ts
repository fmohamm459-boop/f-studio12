import { handlers } from "@/auth";

// Auth.js (NextAuth) route handler — Phase 9.3.8, "Authentication
// Foundation". This is the single API route the phase's "Strict Rules"
// explicitly allow ("Create APIs except the minimum Auth.js route
// required"). It only re-exports the handlers Auth.js itself generates
// from src/auth.ts — no custom request handling, CRUD, or business logic
// lives here.
export const { GET, POST } = handlers;
