import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  type OrderStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DashHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-white p-5", className)}>
      {title && (
        <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink-900">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        ORDER_STATUS_STYLES[s] ?? "bg-ink-100 text-ink-700",
      )}
    >
      {ORDER_STATUS_LABELS[s] ?? status}
    </span>
  );
}

/** Écran des sections d'espace client pas encore livrées (commandes, recharge…). */
export function SoonPanel({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`;
  return (
    <>
      <DashHeading title={title} />
      <Panel className="text-center">
        <span className="inline-flex rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-600">
          {phase}
        </span>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
          {description}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href={wa} target="_blank" rel="noopener noreferrer" size="sm">
            Passer par WhatsApp en attendant
          </ButtonLink>
          <ButtonLink href="/mon-espace" variant="outline" size="sm">
            Retour au tableau de bord
          </ButtonLink>
        </div>
      </Panel>
    </>
  );
}

export function EmptyState({
  title,
  cta,
}: {
  title: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center">
      <p className="text-sm text-muted">{title}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
