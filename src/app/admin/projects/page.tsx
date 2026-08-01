import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getProjects } from "@/lib/data/projects";
import { ProjectsManagement } from "./ProjectsManagement";

export const metadata: Metadata = {
  title: "Projects Management — F Studio Admin",
  description: "Manage the F Studio portfolio of case studies.",
};

// Reads live Project rows on every request (Phase 9.3.9, Database
// Integration) rather than the static PROJECTS mock array.
export const dynamic = "force-dynamic";

/**
 * Projects Management (Page_Structure.md §13). Global Components:
 * SideNavBar, AdminHeader. Module Metrics render here; the interactive
 * Management Table + Project Editor drawer live in ProjectsManagement
 * (colocated client component, matching this project's existing
 * PortfolioBrowser/ContactForm pattern).
 */
export default async function AdminProjectsPage() {
  const projects = await getProjects();
  const publishedCount = projects.filter((p) => p.status === "Published").length;
  const draftCount = projects.filter((p) => p.status === "Draft").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="projects" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Projects" breadcrumbs={[{ label: "Admin" }, { label: "Projects" }]} />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label="Project metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label="Total projects" value={String(projects.length)} />
              <StatWidget label="Published" value={String(publishedCount)} />
              <StatWidget label="Draft" value={String(draftCount)} />
            </div>
          </section>

          <section aria-label="All projects" className="mt-8">
            <ProjectsManagement projects={projects} />
          </section>
        </main>
      </div>
    </div>
  );
}
