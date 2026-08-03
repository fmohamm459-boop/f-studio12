type MonoChipProps = {
  children: string;
  className?: string;
};

/**
 * Mono-label chip (Component_List §13.6 Technology Tags / §13.7 Project Metadata).
 * Uppercase Latin per spec; numerals stay LTR/tabular via the numeral-ltr utility
 * when the caller passes a numeric label.
 */
export function MonoChip({ children, className = "" }: MonoChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-lg)] border border-border bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-foreground/80 ltr:uppercase rtl:normal-case ${className}`}
    >
      {children}
    </span>
  );
}
