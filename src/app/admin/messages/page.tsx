import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getMessages } from "@/lib/data/messages";
import { getServerTranslation } from "@/i18n/server";
import { MessagesManagement } from "./MessagesManagement";

export const metadata: Metadata = {
  title: "Messages Management — F Studio Admin",
  description: "Review and respond to inbound studio inquiries.",
};



export default async function AdminMessagesPage() {
  const { t } = await getServerTranslation();
  const messages = await getMessages();
  const newCount = messages.filter((m) => m.status === "New").length;
  const pendingCount = messages.filter((m) => m.status !== "Replied").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="messages" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={t.admin.messages}
          breadcrumbs={[{ label: t.admin.dashboard, href: "/admin/dashboard" }, { label: t.admin.messages }]}
        />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label={t.messagesCMS.inboxMetrics}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label={t.messagesCMS.totalMessages} value={String(messages.length)} />
              <StatWidget label={t.messagesCMS.newCount} value={String(newCount)} />
              <StatWidget label={t.messagesCMS.pendingReply} value={String(pendingCount)} />
            </div>
          </section>

          <section aria-label={t.messagesCMS.allMessages} className="mt-8">
            <MessagesManagement messages={messages} />
          </section>
        </main>
      </div>
    </div>
  );
}
