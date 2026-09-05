"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Project, ProjectCategory, ProjectStatus } from "@/lib/mock-data";
import { createProject, deleteProject, updateProject } from "@/lib/actions/projects";
import { useTranslation } from "@/i18n/client";
import { ReviewLinkPanel } from "./ReviewLinkPanel";
import { UploadZone } from "./PdfUploadZone";

type ProjectsManagementProps = {
  projects: Project[];
};

export function ProjectsManagement({ projects }: ProjectsManagementProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewLinkFor, setReviewLinkFor] = useState<Project | null>(null);
  const [pdfFilesDraft, setPdfFilesDraft] = useState<string[]>([]);
  const [heroImageDraft, setHeroImageDraft] = useState<string[]>([]);
  const [galleryImagesDraft, setGalleryImagesDraft] = useState<string[]>([]);

  const categoryOptions = useMemo(
    () => [
      { value: "Branding" as ProjectCategory, label: t.projectsCMS.categoryBranding },
      { value: "Web Development" as ProjectCategory, label: t.projectsCMS.categoryWebDev },
      { value: "Data Analysis" as ProjectCategory, label: t.projectsCMS.categoryData },
      { value: "AI" as ProjectCategory, label: t.projectsCMS.categoryAI },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "Draft" as ProjectStatus, label: t.projectsCMS.statusDraft },
      { value: "Published" as ProjectStatus, label: t.projectsCMS.statusPublished },
    ],
    [t],
  );

  const columns = useMemo<DataTableColumn<Project>[]>(
    () => [
      {
        key: "title",
        header: t.projectsCMS.projectCol,
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
      {
        key: "category",
        header: t.projectsCMS.categoryCol,
        sortable: true,
        sortValue: (p) => p.category,
        render: (p) => {
          let label = p.category;
          if (p.category === "Branding" || p.category === "Branding & Visual Identity") {
            label = t.projectsCMS.categoryBranding;
          } else if (p.category === "Web Development" || p.category === "Website Development") {
            label = t.projectsCMS.categoryWebDev;
          } else if (p.category === "Data Analysis" || p.category === "Data Architecture") {
            label = t.projectsCMS.categoryData;
          } else if (p.category === "AI" || p.category === "AI Integration") {
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
    ],
    [t],
  );

  function openCreateProject() {
    setIsCreating(true);
    setSaved(false);
    setPdfFilesDraft([]);
    setHeroImageDraft([]);
    setGalleryImagesDraft([]);

    setEditing({
      slug: "",
      title: "",
      client: "",
      category: "Branding",
      year: "",
      role: "",
      summary: "",
      description: "",
      tags: [],
      overview: "",
      challenge: "",
      research: "",
      solution: "",
      resultStats: [],
      pdfFiles: [],
      heroImage: "",
      galleryImages: [],
    });
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openEditor(project: Project) {
    setIsCreating(false);
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
      const title = String(formData.get("title") ?? editing.title);
      const status = (formData.get("status") as ProjectStatus) ?? editing.status ?? "Draft";

      const projectData = {
        slug: isCreating ? generateSlug(title) : editing.slug,
        title,
        client: String(formData.get("client") ?? editing.client),
        category: (formData.get("category") as ProjectCategory) ?? editing.category,
        year: String(formData.get("year") ?? editing.year),
        status,
        role: String(formData.get("role") ?? editing.role),
        tags: tags.length > 0 ? tags : editing.tags,
        summary: String(formData.get("summary") ?? editing.summary),
        description: String(formData.get("description") ?? editing.description),
        overview: String(formData.get("overview") ?? editing.overview),
        challenge: String(formData.get("challenge") ?? editing.challenge),
        research: String(formData.get("research") ?? editing.research),
        solution: String(formData.get("solution") ?? editing.solution),
        resultStats: editing.resultStats ?? [],
        pdfFiles: pdfFilesDraft,
        heroImage: heroImageDraft[0] ?? null,
        galleryImages: galleryImagesDraft,
        liveLink: String(formData.get("liveLink") ?? editing.liveLink ?? "").trim(),
      };

      if (isCreating) {
        await createProject(projectData);
      } else {
        await updateProject(editing.slug, projectData);
      }

      setSaved(true);
      setIsCreating(false);
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
      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={openCreateProject}>
          {t.projectsCMS.addNew}
        </Button>
      </div>
      <DataTable
        caption={t.projectsCMS.allProjects}
        columns={columns}
        rows={projects}
        getRowId={(p) => p.slug}
        getRowLabel={(p) => p.title}
        selectable
        rowActions={[
          {
            label: t.projectsCMS.viewAction,
            onSelect: (project) =>
              window.open(`/portfolio/${project.slug}`, "_blank", "noopener,noreferrer"),
          },
          { label: t.projectsCMS.editAction, onSelect: openEditor },
          { label: t.projectsCMS.reviewLinkAction, onSelect: (project) => setReviewLinkFor(project) },
          { label: t.projectsCMS.deleteAction, onSelect: handleDelete, destructive: true },
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
            aria-label={t.projectsCMS.closeProjectEditor}
            onClick={() => setEditing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isCreating ? t.projectsCMS.addNew : `${t.projectsCMS.editProject} ${editing.title}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-border bg-surface-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-xl font-semibold text-foreground">
                {isCreating ? t.projectsCMS.addNew : t.projectsCMS.editProject}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label={t.projectsCMS.closeProjectEditor}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {saved ? (
              <p role="status" className="mt-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm text-foreground">
                {t.projectsCMS.changesSaved}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
              <UploadZone
                label={t.projectsCMS.heroImage}
                helpText={t.projectsCMS.heroImageHelp}
                accept="image/*"
                acceptLabel={t.uploadZone.imageFallback}
                multiple={false}
                maxFiles={1}
                folder="f-studio/projects/hero"
                previewKind="thumbnail"
                value={heroImageDraft}
                onChange={setHeroImageDraft}
              />

              <UploadZone
                label={t.projectsCMS.galleryImages}
                helpText={t.projectsCMS.galleryImagesHelp}
                accept="image/*"
                acceptLabel={t.uploadZone.imageFallback}
                multiple
                folder="f-studio/projects/gallery"
                previewKind="thumbnail"
                value={galleryImagesDraft}
                onChange={setGalleryImagesDraft}
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input id="editor-title" name="title" label={t.projectsCMS.projectTitle} defaultValue={editing.title} required />
                <Input id="editor-client" name="client" label={t.projectsCMS.client} defaultValue={editing.client} required />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select
                  id="editor-category"
                  name="category"
                  label={t.projectsCMS.category}
                  options={categoryOptions}
                  defaultValue={editing.category}
                  required
                />
                <Select
                  id="editor-status"
                  name="status"
                  label={t.projectsCMS.status}
                  options={statusOptions}
                  defaultValue={editing.status ?? "Draft"}
                  required
                />
                <Input id="editor-year" name="year" label={t.projectsCMS.year} defaultValue={editing.year} required />
              </div>

              <Input id="editor-role" name="role" label={t.projectsCMS.role} defaultValue={editing.role} required />
              <Textarea
                id="editor-summary"
                name="summary"
                label={t.projectsCMS.summary}
                defaultValue={editing.summary}
                rows={3}
              />
              <Textarea
                id="editor-description"
                name="description"
                label={t.projectsCMS.description}
                defaultValue={editing.description}
                rows={4}
              />
              <Input
                id="editor-live-link"
                name="liveLink"
                label={t.projectsCMS.liveLink}
                defaultValue={editing.liveLink ?? ""}
                type="url"
                placeholder={t.projectsCMS.liveLinkPlaceholder}
              />
              <Input
                id="editor-tags"
                name="tags"
                label={t.projectsCMS.techTags}
                defaultValue={editing.tags.join(", ")}
                hint={t.projectsCMS.tagsHint}
              />

              <Textarea id="editor-overview" name="overview" label={t.projectsCMS.overview} defaultValue={editing.overview} rows={3} />
              <Textarea id="editor-challenge" name="challenge" label={t.projectsCMS.challenge} defaultValue={editing.challenge} rows={3} />
              <Textarea id="editor-research" name="research" label={t.projectsCMS.research} defaultValue={editing.research} rows={3} />
              <Textarea id="editor-solution" name="solution" label={t.projectsCMS.solution} defaultValue={editing.solution} rows={3} />

              <UploadZone
                label={t.projectsCMS.pdfResources}
                helpText={t.projectsCMS.pdfResourcesHelp}
                accept="application/pdf"
                acceptLabel={t.uploadZone.pdfFallback}
                multiple
                folder="f-studio/projects/pdfs"
                previewKind="icon"
                value={pdfFilesDraft}
                onChange={setPdfFilesDraft}
              />

              <div className="mt-2 flex items-center gap-3">
                <Button type="submit">{t.projectsCMS.saveChanges}</Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  {t.projectsCMS.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
