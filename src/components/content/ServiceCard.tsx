import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Service Showcase Card (Component_List §14.2). Identical anatomy across all
 * five services: icon → title (h3, one level below each page's single h1) →
 * description → benefits list → one primary CTA.
 */
export function ServiceCard({
  icon,
  title,
  description,
  benefits,
  ctaLabel,
  ctaHref,
}: ServiceCardProps) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-6">
      <span aria-hidden="true" className="text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/70">
        {description}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-foreground/80">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="mt-0.5 shrink-0 rtl:-scale-x-100"
            >
              <path
                d="M2.5 7.5L5.5 10.5L11.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-start">{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Button href={ctaHref} variant="secondary" className="w-full">
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
