import { PrismaClient } from "@prisma/client";

// Prisma Client connection helper (Phase 9.3.8, "Database Preparation").
//
// This is connection plumbing ONLY — no query, CRUD, or business logic
// lives here, and no page or component imports this yet (Foundation
// restriction; see the Phase 9.3.8 report, "Strict Rules"). It exists so a
// future Data Integration phase has one shared client to import instead of
// each route/file instantiating its own.
//
// The globalThis cache prevents Next.js's dev-mode module hot-reloading
// from creating a new PrismaClient (and a new DB connection pool) on every
// edit — a new client is only created once per process, exactly as
// Prisma's own Next.js guidance recommends.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
