"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/content/ProjectCard";
import type { Project, ProjectCategory } from "@/lib/mock-data";
import { useTranslation } from "@/i18n/client";

type PortfolioBrowserProps = {
  projects: Project[];
};

export function PortfolioBrowser({ projects }: PortfolioBrowserProps) {
  const { dict } = useTranslation();
  const [category, setCategory] = useState<ProjectCategory | "All">("All");
  const [query, setQuery] = useState("");

  const categories: { key: ProjectCategory | "All"; label: string }[] = [
    { key: "All", label: dict.portfolio.filterAll },
    { key: "Branding", label: dict.portfolio.filterBranding },
    { key: "Web Development", label: dict.portfolio.filterWebDev },
    { key: "Data Analysis", label: dict.portfolio.filterDataAnalysis },
    { key: "AI", label: dict.portfolio.filterAi },
  ];

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = category === "All" || project.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        project.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query.trim().toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [projects, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute inset-y-0 my-auto ms-4 text-foreground/40"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <label htmlFor="portfolio-search" className="sr-only">
            {dict.portfolio.searchLabel}
          </label>
          <input
            id="portfolio-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.portfolio.searchPlaceholder}
            className="min-h-[44px] w-full rounded-[var(--radius-lg)] border border-border bg-surface-elevated ps-10 pe-4 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div role="tablist" aria-label={dict.portfolio.projectCategory} className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat.key === category;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat.key)}
                className={`min-h-[44px] rounded-[var(--radius-lg)] border px-4 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground/80 hover:bg-surface"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <p role="status" className="mt-4 text-sm text-foreground/60">
        <span className="numeral-ltr">
          {`${filtered.length} ${filtered.length === 1 ? dict.portfolio.countSingular : dict.portfolio.countPlural}`}
        </span>
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              title={project.title}
              category={project.category}
              client={project.client}
              description={project.summary}
              tags={project.tags}
              viewProjectText={dict.portfolio.viewProject}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-border p-12 text-center">
          <p className="text-sm text-foreground/70">{dict.portfolio.noProjectsMatch}</p>
          <button
            type="button"
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
            className="min-h-[44px] rounded-[var(--radius-lg)] border border-border px-5 text-sm font-medium text-foreground hover:bg-surface"
          >
            {dict.portfolio.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
}
