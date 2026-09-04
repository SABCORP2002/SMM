"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { logoutAction } from "@/actions/auth";
import { ADMIN_NAV } from "./admin-nav";
import { cn } from "@/lib/utils";

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function FooterLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mt-2 space-y-1 border-t border-border pt-2">
      <Link
        href="/"
        onClick={onNavigate}
        className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
      >
        ← Voir le site public
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
        >
          Déconnexion
        </button>
      </form>
    </div>
  );
}

export function AdminChrome({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-ink-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-white hover:bg-white/10 lg:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <Logo tagline={false} onDark />
          </div>
          <span className="shrink-0 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-400">
            Mode admin
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-2xl border border-border bg-white p-3">
            <p className="truncate px-3 pb-2 text-sm font-semibold text-ink-900">{name}</p>
            <NavLinks pathname={pathname} />
            <FooterLinks />
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
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
              <div className="mt-auto">
                <FooterLinks onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
