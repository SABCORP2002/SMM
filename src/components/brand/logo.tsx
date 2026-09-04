import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo JAL SMM — pastille « J » + mot-symbole. Pas d'image : net et léger. */
export function Logo({
  className,
  onDark = false,
  tagline = true,
}: {
  className?: string;
  onDark?: boolean;
  /** Masque « Afrique francophone » — utile dans les en-têtes étroits (espace client). */
  tagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
      aria-label="JAL SMM — accueil"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white shadow-sm">
        J
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate font-display text-lg font-extrabold tracking-tight",
            onDark ? "text-white" : "text-ink-900",
          )}
        >
          JAL<span className="text-brand-500"> SMM</span>
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.18em]",
              onDark ? "text-ink-300" : "text-muted",
            )}
          >
            Afrique francophone
          </span>
        )}
      </span>
    </Link>
  );
}
