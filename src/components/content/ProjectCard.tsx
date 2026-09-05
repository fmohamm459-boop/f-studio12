import Link from "next/link";
import { MonoChip } from "@/components/content/MonoChip";

type ProjectCardProps = {
  slug: string;
  title: string;
  category: string;
  client?: string;
  description: string;
  tags: string[];
  /** 16:9 by default; logo-only showcases use 1:1 (Component_List §13.2). */
  ratio?: "16:9" | "1:1";
  viewProjectText?: string;
};

const VISIBLE_TAG_LIMIT = 4;

/**
 * Project Card (Component_List §13.1). Fixed anatomy: media → category badge →
 * title → optional client → short description → tags → "View project" affordance.
 * Uniform padding/radius/hover across every instance; do not mix ratios in one grid.
 */
export function ProjectCard({
  slug,
  title,
  category,
  client,
  description,
  tags,
  ratio = "16:9",
  viewProjectText = "View project",
}: ProjectCardProps) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_LIMIT);
  const overflow = tags.length - visibleTags.length;

  return (
    <Link
      href={`/portfolio/${slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-elevated transition-colors duration-150 hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div
        className={`${
          ratio === "1:1" ? "aspect-square" : "aspect-video"
        } w-full bg-surface`}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <MonoChip className="self-start">{category}</MonoChip>
        <div>
          <h3 className="font-sans text-base font-semibold text-foreground">{title}</h3>
          {client ? <p className="mt-0.5 text-xs text-foreground/60">{client}</p> : null}
        </div>
        <p className="text-pretty text-sm leading-relaxed text-foreground/70">{description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {visibleTags.map((tag) => (
            <MonoChip key={tag}>{tag}</MonoChip>
          ))}
          {overflow > 0 ? <MonoChip>{`+${overflow}`}</MonoChip> : null}
        </div>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {viewProjectText}
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform duration-150 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          >
            <path
              d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
