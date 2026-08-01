import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  id: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
};

/**
 * Form Select primitive (Component_List PART D "Forms").
 * Native <select> for maximum keyboard/AT support; same label/validation
 * pattern as Input/Textarea.
 */
export function Select({
  label,
  id,
  options,
  placeholder,
  error,
  hint,
  required,
  className = "",
  ...rest
}: SelectProps) {
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
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        defaultValue=""
        className={`min-h-[44px] rounded-[var(--radius-lg)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
