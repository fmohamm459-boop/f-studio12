import { prisma } from "@/lib/db";
import { toUiMessage } from "@/lib/db-mappers";
import type { Message } from "@/lib/mock-data";

// Data access layer — Message reads only (Phase 9.3.9, Database
// Integration). Mirrors the read shape the admin Messages Management page
// already expects from src/lib/mock-data.ts. Per this phase's brief, Message
// only supports Read + Delete (no Create/Update) — see
// src/lib/actions/messages.ts.

export async function getMessages(): Promise<Message[]> {
  const rows = await prisma.message.findMany({ orderBy: { receivedAt: "desc" } });
  return rows.map(toUiMessage);
}
