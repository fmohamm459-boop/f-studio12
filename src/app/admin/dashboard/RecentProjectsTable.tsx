"use client";

import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import type { Project } from "@/lib/mock-data";

type RecentProjectsTableProps = {
  projects: Project[];
};

const columns: DataTableColumn<Project>[] = [
  {
    key: "title",
    header: "Project",
    sortable: true,
    sortValue: (p) => p.title,
    render: (p) => (
      <div>
        <p className="font-medium text-foreground">{p.title}</p>
        <p className="text-xs text-foreground/60">{p.client}</p>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    sortable: true,
    sortValue: (p) => p.category,
    render: (p) => <MonoChip>{p.category}</MonoChip>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (p) => p.status ?? "",
    render: (p) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
        <span
          aria-hidden="true"
          className={`inline-block h-1.5 w-1.5 rounded-full ${p.status === "Published" ? "bg-primary" : "bg-foreground/40"}`}
        />
        {p.status ?? "Draft"}
      </span>
    ),
  },
  {
    key: "updatedAt",
    header: "Updated",
    sortable: true,
    align: "end",
    sortValue: (p) => p.updatedAt ?? "",
    render: (p) => <span className="numeral-ltr text-foreground/70">{p.updatedAt}</span>,
  },
];

/**
 * Recent Projects table (Page_Structure.md §12 Admin Dashboard). Phase
 * 9.3.14-D, Task 4 — extracted out of admin/dashboard/page.tsx (a Server
 * Component) into its own Client Component, matching the established
 * Server-page + Client-Management-component pattern already used by
 * Projects/Testimonials/Messages Management (e.g. ProjectsManagement.tsx).
 *
 * This receives `projects` as plain data and defines `columns`/
 * `rowActions` internally, so no function value ever has to cross the
 * Server -> Client prop boundary — the invalid pattern the previous
 * inline `<DataTable columns={...} rowActions={...} />` call in
 * page.tsx relied on. Behavior is unchanged: View/Edit/Delete remain the
 * same presentational no-ops described in this page's own comment (no
 * CRUD/API wiring for the dashboard's Recent Projects table is in scope
 * for this fix).
 */
export function RecentProjectsTable({ projects }: RecentProjectsTableProps) {
  return (
    <DataTable
      caption="Recent projects"
      columns={columns}
      rows={projects}
      getRowId={(p) => p.slug}
      getRowLabel={(p) => p.title}
      rowActions={[
        { label: "View", onSelect: () => {} },
        { label: "Edit", onSelect: () => {} },
        { label: "Delete", onSelect: () => {}, destructive: true },
      ]}
    />
  );
}
