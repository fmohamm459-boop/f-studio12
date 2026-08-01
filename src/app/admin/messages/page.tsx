import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getMessages } from "@/lib/data/messages";
import { MessagesManagement } from "./MessagesManagement";

export const metadata: Metadata = {
  title: "Messages Management — F Studio Admin",
  description: "Review and respond to inbound studio inquiries.",
};

// Reads live Message rows on every request (Phase 9.3.9, Database
// Integration) rather than the static MESSAGES mock array.
export const dynamic = "force-dynamic";

/**
 * Messages Management (Page_Structure.md §14). Global Components:
 * SideNavBar, AdminHeader. Inbox Metrics render here; the Message List +
 * Detail View drawer live in MessagesManagement (colocated client
 * component).
 */
export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const newCount = messages.filter((m) => m.status === "New").length;
  const pendingCount = messages.filter((m) => m.status !== "Replied").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="messages" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Messages" breadcrumbs={[{ label: "Admin" }, { label: "Messages" }]} />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label="Inbox metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label="Total messages" value={String(messages.length)} />
              <StatWidget label="New" value={String(newCount)} />
              <StatWidget label="Pending reply" value={String(pendingCount)} />
            </div>
          </section>

          <section aria-label="All messages" className="mt-8">
            <MessagesManagement messages={messages} />
          </section>
        </main>
      </div>
    </div>
  );
}
