"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Project, ProjectCategory } from "@/lib/mock-data";
import { deleteProject, updateProject } from "@/lib/actions/projects";
import { ReviewLinkPanel } from "./ReviewLinkPanel";
import { UploadZone } from "./PdfUploadZone";

type ProjectsManagementProps = {
  projects: Project[];
};

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
  { value: "Branding", label: "Branding" },
  { value: "Web Development", label: "Web Development" },
  { value: "Data Analysis", label: "Data Analysis" },
  { value: "AI", label: "AI" },
];

const columns: DataTableColumn<Project>[] = [
  {
    key: "title",
    header: "Project",
    sortable: true,
    sortValue: (p) => p.title,
    render: (p) => (
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="aspect-video w-16 shrink-0 rounded-[var(--radius-lg)] border border-border bg-surface"
        />
        <div>
          <p className="font-medium text-foreground">{p.title}</p>
          <p className="text-xs text-foreground/60">{p.client}</p>
        </div>
      </div>
    ),
  },
  { key: "category", header: "Category", sortable: true, sortValue: (p) => p.category, render: (p) => <MonoChip>{p.category}</MonoChip> },
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
 * Projects Management (Page_Structure.md §13). Module Metrics live in the
 * parent server page; this client component owns the Management Table and
 * the Project Editor drawer (§15.5 — side drawer lg+, full-screen sheet on
 * mobile). Editing/deleting a project calls the real Project Server Actions
 * (src/lib/actions/projects.ts); router.refresh() re-reads the database
 * afterward so the table reflects the change.
 *
 * "Review link" row action (Phase 9.3.11 Stage 3) opens ReviewLinkPanel,
 * a self-contained modal for generating/viewing/copying a project's
 * private Client Review link (src/lib/actions/review.ts). No refresh is
 * needed after generating a link — nothing in this table's columns
 * reflects the token — so, unlike Edit/Delete, this action doesn't call
 * `router.refresh()`.
 *
 * "PDF resources" field (Phase 9.3.12 Stage 1, File & Media Management)
 * uploads directly to Cloudinary via UploadZone; the resulting URLs are
 * held in `pdfFilesDraft` state and only persisted when the surrounding
 * form's "Save changes" is submitted, the same as every other field
 * here — an upload itself never writes to the database on its own.
 *
 * "Hero image" / "Gallery images" (Phase 9.3.12 Stage 2) follow the exact
 * same pattern via the same UploadZone component, reused rather than
 * duplicated — see PdfUploadZone.tsx's header comment.
 */
export function ProjectsManagement({ projects }: ProjectsManagementProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Project | null>(null);
  const [saved, setSaved] = useState(false);
  const [reviewLinkFor, setReviewLinkFor] = useState<Project | null>(null);
  const [pdfFilesDraft, setPdfFilesDraft] = useState<string[]>([]);
  const [heroImageDraft, setHeroImageDraft] = useState<string[]>([]);
  const [galleryImagesDraft, setGalleryImagesDraft] = useState<string[]>([]);

  function openEditor(project: Project) {
    setSaved(false);
    setPdfFilesDraft(project.pdfFiles ?? []);
    setHeroImageDraft(project.heroImage ? [project.heroImage] : []);
    setGalleryImagesDraft(project.galleryImages ?? []);
    setEditing(project);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    startTransition(async () => {
      await updateProject(editing.slug, {
        title: String(formData.get("title") ?? editing.title),
        client: String(formData.get("client") ?? editing.client),
        category: (formData.get("category") as ProjectCategory) ?? editing.category,
        year: String(formData.get("year") ?? editing.year),
        role: String(formData.get("role") ?? editing.role),
        tags: tags.length > 0 ? tags : editing.tags,
        overview: String(formData.get("overview") ?? editing.overview),
        challenge: String(formData.get("challenge") ?? editing.challenge),
        research: String(formData.get("research") ?? editing.research),
        solution: String(formData.get("solution") ?? editing.solution),
        pdfFiles: pdfFilesDraft,
        heroImage: heroImageDraft[0] ?? null,
        galleryImages: galleryImagesDraft,
      });
      setSaved(true);
      router.refresh();
    });
  }

  function handleDelete(project: Project) {
    startTransition(async () => {
      if (editing?.slug === project.slug) setEditing(null);
      await deleteProject(project.slug);
      router.refresh();
    });
  }

  return (
    <>
      <DataTable
        caption="All projects"
        columns={columns}
        rows={projects}
        getRowId={(p) => p.slug}
        getRowLabel={(p) => p.title}
        selectable
        rowActions={[
          {
            label: "View",
            onSelect: (project) =>
              window.open(`/portfolio/${project.slug}`, "_blank", "noopener,noreferrer"),
          },
          { label: "Edit", onSelect: openEditor },
          { label: "Review link", onSelect: (project) => setReviewLinkFor(project) },
          { label: "Delete", onSelect: handleDelete, destructive: true },
        ]}
      />

      {reviewLinkFor ? (
        <ReviewLinkPanel
          slug={reviewLinkFor.slug}
          title={reviewLinkFor.title}
          onClose={() => setReviewLinkFor(null)}
        />
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close project editor"
            onClick={() => setEditing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editing.title}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-border bg-surface-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-xl font-semibold text-foreground">Edit project</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close project editor"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {saved ? (
              <p role="status" className="mt-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm text-foreground">
                Changes saved.
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
              <UploadZone
                label="Hero image"
                helpText="The primary image for this project. Up to 10MB."
                accept="image/*"
                acceptLabel="Image"
                multiple={false}
                maxFiles={1}
                folder="f-studio/projects/hero"
                previewKind="thumbnail"
                value={heroImageDraft}
                onChange={setHeroImageDraft}
              />

              <UploadZone
                label="Gallery images"
                helpText="Logos, identity assets, and application mockups. Up to 10MB each."
                accept="image/*"
                acceptLabel="Image"
                multiple
                folder="f-studio/projects/gallery"
                previewKind="thumbnail"
                value={galleryImagesDraft}
                onChange={setGalleryImagesDraft}
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input id="editor-title" name="title" label="Title" defaultValue={editing.title} required />
                <Input id="editor-client" name="client" label="Client" defaultValue={editing.client} required />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select
                  id="editor-category"
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  defaultValue={editing.category}
                  required
                />
                <Input id="editor-year" name="year" label="Year" defaultValue={editing.year} required />
              </div>

              <Input id="editor-role" name="role" label="Role" defaultValue={editing.role} required />
              <Input id="editor-tags" name="tags" label="Technology tags" defaultValue={editing.tags.join(", ")} hint="Comma-separated" />

              <Textarea id="editor-overview" name="overview" label="Overview" defaultValue={editing.overview} rows={3} />
              <Textarea id="editor-challenge" name="challenge" label="Challenge" defaultValue={editing.challenge} rows={3} />
              <Textarea id="editor-research" name="research" label="Research & direction" defaultValue={editing.research} rows={3} />
              <Textarea id="editor-solution" name="solution" label="Solution" defaultValue={editing.solution} rows={3} />

              <UploadZone
                label="PDF resources"
                helpText="Case study PDFs, guidelines, or supporting documents. Up to 10MB per file."
                accept="application/pdf"
                acceptLabel="PDF"
                multiple
                folder="f-studio/projects/pdfs"
                previewKind="icon"
                value={pdfFilesDraft}
                onChange={setPdfFilesDraft}
              />

              <div className="mt-2 flex items-center gap-3">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
