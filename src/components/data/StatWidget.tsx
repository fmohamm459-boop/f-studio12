type StatWidgetProps = {
  label: string;
  value: string;
  trend?: {
    direction: "up" | "down";
    text: string;
  };
};

/**
 * Statistics Widget (Component_List §15.3 / used publicly on About, Portfolio,
 * Project Details, Testimonials per Page_Structure). Value uses tabular-nums
 * and stays LTR; trend direction is shown with an icon AND text, never color alone.
 */
export function StatWidget({ label, value, trend }: StatWidgetProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-6">
      <p className="numeral-ltr text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-foreground/70">{label}</p>
      {trend ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-mono text-foreground/70">
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={trend.direction === "down" ? "rotate-180" : undefined}
          >
            <path
              d="M6 10V2M6 2L2.5 5.5M6 2L9.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{trend.text}</span>
        </p>
      ) : null}
    </div>
  );
}
