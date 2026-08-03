import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
  hint?: string;
};

/**
 * Form Input primitive (Component_List PART D "Forms").
 * Label above the field, blur/submit validation surface via `error`,
 * error text associated + announced through aria-describedby (UI_Guidelines §15.5 / global form rules).
 */
export function Input({ label, id, error, hint, required, className = "", ...rest }: InputProps) {
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
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-[44px] rounded-[var(--radius-lg)] border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
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
