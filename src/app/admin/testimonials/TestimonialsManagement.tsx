"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { Button } from "@/components/ui/Button";
import type { Testimonial, TestimonialStatus } from "@/lib/mock-data";
import { updateTestimonialStatus } from "@/lib/actions/testimonials";

type TestimonialsManagementProps = {
  testimonials: Testimonial[];
};

function statusIndicator(status: TestimonialStatus | undefined) {
  const tone = status === "Approved" ? "bg-primary" : status === "Hidden" ? "bg-foreground/30" : "bg-foreground/60";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${tone}`} />
      {status ?? "Pending"}
    </span>
  );
}

const columns: DataTableColumn<Testimonial>[] = [
  {
    key: "author",
    header: "Author",
    sortable: true,
    sortValue: (t) => t.author,
    render: (t) => (
      <div>
        <p className="font-medium text-foreground">{t.author}</p>
        <p className="text-xs text-foreground/60">{t.role}</p>
      </div>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    sortable: true,
    sortValue: (t) => t.rating,
    render: (t) => <span className="numeral-ltr text-foreground">{t.rating.toFixed(1)} / 5</span>,
  },
  { key: "status", header: "Status", sortable: true, sortValue: (t) => t.status ?? "", render: (t) => statusIndicator(t.status) },
  {
    key: "submittedAt",
    header: "Submitted",
    sortable: true,
    align: "end",
    sortValue: (t) => t.submittedAt ?? "",
    render: (t) => <span className="numeral-ltr text-foreground/70">{t.submittedAt}</span>,
  },
];

/**
 * Testimonials Management (Page_Structure.md §15). The Moderation Table is
 * the DataTable below; "Review" opens the Review Panel drawer with
 * Approve/Hide moderation actions. These call the real
 * updateTestimonialStatus Server Action (src/lib/actions/testimonials.ts);
 * router.refresh() re-reads the database afterward so the table reflects
 * the change.
 */
export function TestimonialsManagement({ testimonials }: TestimonialsManagementProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState<Testimonial | null>(null);
  const [localStatus, setLocalStatus] = useState<TestimonialStatus | undefined>(undefined);

  function openReview(testimonial: Testimonial) {
    setReviewing(testimonial);
    setLocalStatus(testimonial.status);
  }

  function applyStatus(testimonial: Testimonial, status: TestimonialStatus) {
    setLocalStatus(status);
    startTransition(async () => {
      await updateTestimonialStatus(testimonial.id, status);
      router.refresh();
    });
  }

  return (
    <>
      <DataTable
        caption="All testimonials"
        columns={columns}
        rows={testimonials}
        getRowId={(t) => t.id}
        getRowLabel={(t) => `testimonial from ${t.author}`}
        rowActions={[
          { label: "Review", onSelect: openReview },
          { label: "Hide", onSelect: (t) => applyStatus(t, "Hidden"), destructive: true },
        ]}
      />

      {reviewing ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close review panel"
            onClick={() => setReviewing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Review testimonial from ${reviewing.author}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-border bg-surface-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-xl font-semibold text-foreground">Review testimonial</h2>
              <button
                type="button"
                onClick={() => setReviewing(null)}
                aria-label="Close review panel"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <blockquote className="mt-6 text-lg leading-relaxed text-foreground">&ldquo;{reviewing.quote}&rdquo;</blockquote>
            <p className="mt-4 text-sm font-medium text-foreground">{reviewing.author}</p>
            <p className="text-sm text-foreground/60">{reviewing.role}</p>
            <p className="numeral-ltr mt-1 text-sm text-foreground/70">{reviewing.rating.toFixed(1)} / 5</p>

            <div className="mt-4">Current status: {statusIndicator(localStatus)}</div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="button" onClick={() => applyStatus(reviewing, "Approved")}>
                Approve
              </Button>
              <Button type="button" variant="secondary" onClick={() => applyStatus(reviewing, "Pending")}>
                Mark pending
              </Button>
              <Button type="button" variant="ghost" onClick={() => applyStatus(reviewing, "Hidden")}>
                Hide
              </Button>
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              Moderation actions save immediately.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
