"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { logoutAction } from "@/actions/auth";
import { DASHBOARD_NAV } from "./nav";
import { cn } from "@/lib/utils";

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const active =
          item.href === "/mon-espace"
            ? pathname === "/mon-espace"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-600 text-white"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
            )}
          >
            {item.label}
            {item.soon && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  active ? "bg-white/20 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                bientôt
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900",
          className,
        )}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            d="M15 17l5-5-5-5M20 12H9M12 19H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Déconnexion
      </button>
    </form>
  );
}

export function DashboardChrome({
  user,
  children,
}: {
  user: { name: string; balance: string; role: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-ink-50 lg:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <Logo tagline={false} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="text-right leading-tight">
              <p className="hidden text-[11px] uppercase tracking-wide text-muted sm:block">
                Solde
              </p>
              <p className="text-xs font-bold text-brand-700 sm:text-sm">
                {user.balance}
              </p>
            </div>
            <Link
              href="/mon-espace/recharger"
              aria-label="Recharger mon compte"
              className="flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 text-xs font-semibold text-white hover:bg-brand-700 sm:px-3"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Recharger</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-2xl border border-border bg-white p-3">
            <p className="truncate px-3 pb-2 text-sm font-semibold text-ink-900">
              {user.name}
            </p>
            <NavLinks pathname={pathname} />
            <div className="mt-2 border-t border-border pt-2">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Logo tagline={false} className="min-w-0" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-ink-50"
                  aria-label="Fermer"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              <div className="mt-auto border-t border-border pt-2">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
