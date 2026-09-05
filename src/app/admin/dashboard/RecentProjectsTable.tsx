"use client";

import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import type { Project } from "@/lib/mock-data";
import { useTranslation } from "@/i18n/client";

type RecentProjectsTableProps = {
  projects: Project[];
};

export function RecentProjectsTable({ projects }: RecentProjectsTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<DataTableColumn<Project>[]>(() => [
    {
      key: "title",
      header: t.projectsCMS.projectCol,
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
      header: t.projectsCMS.categoryCol,
      sortable: true,
      sortValue: (p) => p.category,
      render: (p) => {
        let label = p.category;
        if (p.category === "Branding & Visual Identity") {
          label = t.projectsCMS.categoryBranding;
        } else if (p.category === "Website Development") {
          label = t.projectsCMS.categoryWebDev;
        } else if (p.category === "Data Architecture") {
          label = t.projectsCMS.categoryData;
        } else if (p.category === "AI Integration") {
          label = t.projectsCMS.categoryAI;
        }
        return <MonoChip>{label}</MonoChip>;
      },
    },
    {
      key: "status",
      header: t.projectsCMS.statusCol,
      sortable: true,
      sortValue: (p) => p.status ?? "",
      render: (p) => {
        const isPublished = p.status === "Published";
        const statusLabel = isPublished ? t.projectsCMS.statusPublished : t.projectsCMS.statusDraft;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
            <span
              aria-hidden="true"
              className={`inline-block h-1.5 w-1.5 rounded-full ${isPublished ? "bg-primary" : "bg-foreground/40"}`}
            />
            {statusLabel}
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      header: t.projectsCMS.updatedCol,
      sortable: true,
      align: "end",
      sortValue: (p) => p.updatedAt ?? "",
      render: (p) => <span className="numeral-ltr text-foreground/70">{p.updatedAt}</span>,
    },
  ], [t]);

  return (
    <DataTable
      caption={t.admin.recentProjects}
      columns={columns}
      rows={projects}
      getRowId={(p) => p.slug}
      getRowLabel={(p) => p.title}
      rowActions={[
        { label: t.projectsCMS.viewAction, onSelect: () => {} },
        { label: t.projectsCMS.editAction, onSelect: () => {} },
        { label: t.projectsCMS.deleteAction, onSelect: () => {}, destructive: true },
      ]}
    />
  );
}
