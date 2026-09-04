import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo JAL SMM — pastille « J » + mot-symbole. Pas d'image : net et léger. */
export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="JAL SMM — accueil"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white shadow-sm">
        J
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-extrabold tracking-tight",
            onDark ? "text-white" : "text-ink-900",
          )}
        >
          JAL<span className="text-brand-500"> SMM</span>
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]",
            onDark ? "text-ink-300" : "text-muted",
          )}
        >
          Afrique francophone
        </span>
      </span>
    </Link>
  );
}
