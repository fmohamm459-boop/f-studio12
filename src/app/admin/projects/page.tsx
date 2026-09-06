import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getProjects } from "@/lib/data/projects";
import { getServerTranslation } from "@/i18n/server";
import { ProjectsManagement } from "./ProjectsManagement";

export const metadata: Metadata = {
  title: "Projects Management — F Studio Admin",
  description: "Manage the F Studio portfolio of case studies.",
};

// Reads live Project rows on every request (Phase 9.3.9, Database
// Integration) rather than the static PROJECTS mock array.


export default async function AdminProjectsPage() {
  const { t } = await getServerTranslation();
  const projects = await getProjects();
  const publishedCount = projects.filter((p) => p.status === "Published").length;
  const draftCount = projects.filter((p) => p.status === "Draft").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="projects" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={t.admin.projects}
          breadcrumbs={[{ label: t.admin.adminBadge }, { label: t.admin.projects }]}
        />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label={t.projectsCMS.projectMetrics}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label={t.projectsCMS.totalProjects} value={String(projects.length)} />
              <StatWidget label={t.projectsCMS.published} value={String(publishedCount)} />
              <StatWidget label={t.projectsCMS.draft} value={String(draftCount)} />
            </div>
          </section>

          <section aria-label={t.projectsCMS.allProjects} className="mt-8">
            <ProjectsManagement projects={projects} />
          </section>
        </main>
      </div>
    </div>
  );
}
