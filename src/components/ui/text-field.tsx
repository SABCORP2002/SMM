import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function TextField({
  label,
  name,
  error,
  hint,
  className,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & ComponentProps<"input">) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn(
          "mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-muted/70",
          "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
          error ? "border-red-400" : "border-border",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
