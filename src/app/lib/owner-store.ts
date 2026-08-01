import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Single-owner credential store (Phase 9.3.10-A, "Authentication Core
// Foundation").
//
// WHY NOT A PRISMA MODEL: the project's Architecture Decision Record and
// this phase's own brief forbid adding a `User` (or any other new) model
// to `prisma/schema.prisma` — the schema stays at exactly the three
// approved models (`Project`, `Testimonial`, `Message`). Since Credentials
// authentication still needs somewhere to persist the one owner's
// username + password hash between the (future) Initial Owner Setup
// submission and every later login, this module stores that single
// record as a JSON file on disk instead of a database row. This is
// intentionally the smallest persistence mechanism that satisfies both
// "single owner account" and "no new database model" without touching
// the approved schema.
//
// SCOPE: this is a data-access module only — hashing, reading, and
// writing one record. No route, page, or component calls this directly;
// it is consumed by the Credentials provider in `src/auth.ts` and by the
// (also newly added) owner Server Action in `src/lib/actions/owner.ts`.
//
// KNOWN LIMITATION (flagged here and in the phase report): a local JSON
// file is not durable storage on most serverless deployments (e.g.
// Vercel's production filesystem is read-only outside `/tmp`, and `/tmp`
// itself is not shared or guaranteed to persist across invocations). This
// is acceptable for local development and for this phase's scoped goal
// (proving the Credentials + single-owner flow end-to-end), but a real
// production deployment will need a durable, explicitly-approved
// persistence decision — e.g. reusing the existing Postgres database
// under a dedicated, separately-approved migration, or a managed secret
// store. That decision is out of scope here; see "Remaining limitations"
// in the phase report.

export type OwnerRecord = {
  name: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

const OWNER_FILE = path.join(process.cwd(), ".data", "owner.json");

async function readOwnerFile(): Promise<OwnerRecord | null> {
  try {
    const raw = await fs.readFile(OWNER_FILE, "utf-8");
    return JSON.parse(raw) as OwnerRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeOwnerFile(record: OwnerRecord): Promise<void> {
  await fs.mkdir(path.dirname(OWNER_FILE), { recursive: true });
  await fs.writeFile(OWNER_FILE, JSON.stringify(record, null, 2), "utf-8");
}

/** Returns the owner record, or null if Initial Owner Setup has not run yet. */
export async function getOwner(): Promise<OwnerRecord | null> {
  return readOwnerFile();
}

/** True once the single owner account exists (setup must then stay disabled). */
export async function hasOwner(): Promise<boolean> {
  return (await readOwnerFile()) !== null;
}

/**
 * Creates the single owner account. Throws if one already exists — this
 * is the enforcement point for "only ONE administrator account is
 * allowed" and "after successful setup, disable setup permanently."
 */
export async function createOwner(input: {
  name: string;
  username: string;
  password: string;
}): Promise<OwnerRecord> {
  if (await hasOwner()) {
    throw new Error("An owner account already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const record: OwnerRecord = {
    name: input.name,
    username: input.username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await writeOwnerFile(record);
  return record;
}

/**
 * Verifies a username/password pair against the stored owner record.
 * Returns the owner record on success, or null on any failure (no owner
 * yet, unknown username, wrong password) — callers (the Credentials
 * provider's `authorize`) treat null as "reject the sign-in" uniformly.
 */
export async function verifyOwnerCredentials(
  username: string,
  password: string,
): Promise<OwnerRecord | null> {
  const owner = await readOwnerFile();
  if (!owner) return null;

  // Username match only (case-sensitive) — this is Credentials/username
  // auth, not email auth, so no normalization beyond a plain string
  // comparison is applied.
  if (owner.username !== username) return null;

  const matches = await bcrypt.compare(password, owner.passwordHash);
  return matches ? owner : null;
}
