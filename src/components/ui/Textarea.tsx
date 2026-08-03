import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  id: string;
  error?: string;
  hint?: string;
};

/**
 * Form Textarea primitive (Component_List PART D "Forms").
 * Same label/validation pattern as Input for consistency across the form set.
 */
export function Textarea({
  label,
  id,
  error,
  hint,
  required,
  rows = 5,
  className = "",
  ...rest
}: TextareaProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <span id={hintId} className="text-xs text-foreground/60">
          {hint}
        </span>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`rounded-[var(--radius-lg)] border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
