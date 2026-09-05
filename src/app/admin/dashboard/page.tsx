import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { PROJECTS, TESTIMONIALS, MESSAGES } from "@/lib/mock-data";
import { getServerTranslation } from "@/i18n/server";
import { RecentProjectsTable } from "./RecentProjectsTable";

export const metadata: Metadata = {
  title: "Admin Dashboard — F Studio",
  description: "Studio-wide overview of projects, messages, reviews, and system status.",
};

const publishedCount = PROJECTS.filter((p) => p.status === "Published").length;
const newMessagesCount = MESSAGES.filter((m) => m.status === "New").length;

const recentProjects = [...PROJECTS]
  .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
  .slice(0, 5);

export default async function AdminDashboardPage() {
  const { t } = await getServerTranslation();

  const activityItems = [
    { id: "a1", label: t.admin.activityPublished.replace("{title}", "Meridian Bank Identity"), time: t.admin.time2HoursAgo },
    { id: "a2", label: t.admin.activityReplied.replace("{name}", "Marco Delgado"), time: t.admin.timeYesterday },
    { id: "a3", label: t.admin.activityApproved.replace("{name}", "Marcus Iyer"), time: t.admin.time3DaysAgo },
    { id: "a4", label: t.admin.activitySavedSettings, time: t.admin.time5DaysAgo },
  ];

  const systemStatus = [
    { id: "server", label: t.admin.serverLabel, state: t.admin.operationalStatus },
    { id: "database", label: t.admin.databaseLabel, state: t.admin.operationalStatus },
  ];

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title={t.admin.dashboard} />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label={t.admin.quickStats}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatWidget label={t.admin.projectsMetric} value={String(PROJECTS.length)} />
              <StatWidget label={t.admin.publishedMetric} value={String(publishedCount)} trend={{ direction: "up", text: t.admin.vsLastQuarter }} />
              <StatWidget label={t.admin.messagesMetric} value={String(MESSAGES.length)} trend={{ direction: "up", text: `${newMessagesCount} ${t.admin.newCount}` }} />
              <StatWidget label={t.admin.reviewsMetric} value={String(TESTIMONIALS.length)} />
              <StatWidget label={t.admin.visitorsMetric} value="4,180" trend={{ direction: "up", text: t.admin.last30Days }} />
            </div>
          </section>

          <section aria-label={t.admin.recentProjects} className="mt-10">
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.admin.recentProjects}</h2>
            <div className="mt-4">
              <RecentProjectsTable projects={recentProjects} />
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section aria-label={t.admin.activityHeading}>
              <h2 className="font-sans text-lg font-semibold text-foreground">{t.admin.activityHeading}</h2>
              <ol className="mt-4 flex flex-col gap-6 border-s border-border ps-5">
                {activityItems.map((item) => (
                  <li key={item.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -start-[1.4rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background"
                    />
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-foreground/50">{item.time}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-label={t.admin.systemStatusHeading}>
              <h2 className="font-sans text-lg font-semibold text-foreground">{t.admin.systemStatusHeading}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {systemStatus.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-4"
                  >
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground/80">
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M4.3 7.2 6.1 9l3.6-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item.state}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
