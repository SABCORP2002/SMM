"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/utils";

export function SiteHeader({ authed = false }: { authed?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {authed ? (
            <ButtonLink href="/mon-espace" size="sm">
              {fr.common.dashboard}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/connexion" variant="ghost" size="sm">
                {fr.common.signIn}
              </ButtonLink>
              <ButtonLink href="/inscription" size="sm">
                {fr.common.signUp}
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-50 lg:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-3 pb-2">
              {authed ? (
                <ButtonLink href="/mon-espace" size="sm" className="flex-1">
                  {fr.common.dashboard}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/connexion" variant="outline" size="sm" className="flex-1">
                    {fr.common.signIn}
                  </ButtonLink>
                  <ButtonLink href="/inscription" size="sm" className="flex-1">
                    {fr.common.signUp}
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
