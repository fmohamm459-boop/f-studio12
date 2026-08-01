import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { PROJECTS, TESTIMONIALS, MESSAGES } from "@/lib/mock-data";
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

const ACTIVITY = [
  { id: "a1", label: "Published \u201cMeridian Bank Identity\u201d", time: "2 hours ago" },
  { id: "a2", label: "Replied to a message from Marco Delgado", time: "Yesterday" },
  { id: "a3", label: "Approved a testimonial from Marcus Iyer", time: "3 days ago" },
  { id: "a4", label: "Saved changes to Website Development settings", time: "5 days ago" },
];

const SYSTEM_STATUS = [
  { id: "server", label: "Server", state: "Operational" as const },
  { id: "database", label: "Database", state: "Operational" as const },
];

/**
 * Admin Dashboard (Page_Structure.md §12). Global Components: SideNavBar,
 * AdminHeader (self-composed here, matching this project's existing
 * public-page convention of pages rendering their own chrome directly).
 * All data is static mock data; the Recent Projects "View"/"Edit" actions
 * have no destination or handler wired (no CRUD/API per Foundation
 * restriction) beyond DataTable's own presentational confirm-step demo.
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Dashboard" />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label="Studio metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatWidget label="Projects" value={String(PROJECTS.length)} />
              <StatWidget label="Published" value={String(publishedCount)} trend={{ direction: "up", text: "vs. last quarter" }} />
              <StatWidget label="Messages" value={String(MESSAGES.length)} trend={{ direction: "up", text: `${newMessagesCount} new` }} />
              <StatWidget label="Reviews" value={String(TESTIMONIALS.length)} />
              <StatWidget label="Visitors" value="4,180" trend={{ direction: "up", text: "last 30 days" }} />
            </div>
          </section>

          <section aria-label="Recent projects" className="mt-10">
            <h2 className="font-sans text-lg font-semibold text-foreground">Recent projects</h2>
            <div className="mt-4">
              <RecentProjectsTable projects={recentProjects} />
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section aria-label="Activity timeline">
              <h2 className="font-sans text-lg font-semibold text-foreground">Activity</h2>
              <ol className="mt-4 flex flex-col gap-6 border-s border-border ps-5">
                {ACTIVITY.map((item) => (
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

            <section aria-label="System status">
              <h2 className="font-sans text-lg font-semibold text-foreground">System status</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {SYSTEM_STATUS.map((item) => (
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
