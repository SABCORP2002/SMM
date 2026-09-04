import type { Metadata } from "next";
import Link from "next/link";
import { getUserDashboard } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { syncActiveOrders } from "@/lib/orders";
import { syncPendingPayments } from "@/lib/payments";
import { formatMoney, timeAgo } from "@/lib/utils";
import { getLoyaltyTier, getNextLoyaltyTier, LOYALTY_TIERS } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";
import {
  DashHeading,
  EmptyState,
  Panel,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardHome() {
  const user = await requireUser();
  await syncActiveOrders({ userId: user.id, limit: 10 });
  await syncPendingPayments({ userId: user.id, limit: 10 });
  const data = await getUserDashboard(user.id);

  return (
    <>
      <DashHeading
        title={`Bonjour, ${user.name.split(" ")[0]} 👋`}
        description="Voici l'état de ton compte JAL SMM."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Solde disponible"
          value={formatMoney(user.balance, user.currency)}
          sub="Rechargeable par Mobile Money"
        />
        <StatCard label="Commandes" value={String(data.ordersCount)} />
        <StatCard
          label="Total dépensé"
          value={formatMoney(data.totalSpent, user.currency)}
        />
      </div>

      <LoyaltyPanel totalSpent={data.totalSpent} currency={user.currency} />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Actions rapides" className="lg:col-span-1">
          <div className="flex flex-col gap-2">
            <ButtonLink href="/mon-espace/nouvelle-commande" size="sm">
              Nouvelle commande
            </ButtonLink>
            <ButtonLink
              href="/mon-espace/recharger"
              size="sm"
              variant="outline"
            >
              Recharger mon compte
            </ButtonLink>
            <ButtonLink
              href="/mon-espace/parrainage"
              size="sm"
              variant="ghost"
            >
              Inviter un ami
            </ButtonLink>
          </div>
        </Panel>

        <Panel title="Commandes récentes" className="lg:col-span-2">
          {data.recentOrders.length === 0 ? (
            <EmptyState
              title="Tu n'as pas encore passé de commande."
              cta={{
                label: "Créer ma première commande →",
                href: "/mon-espace/nouvelle-commande",
              }}
            />
          ) : (
            <ul className="divide-y divide-border">
              {data.recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">
                      {o.serviceName}
                    </p>
                    <p className="text-xs text-muted">
                      {o.quantity.toLocaleString("fr-FR")} ·{" "}
                      {formatMoney(o.charge, user.currency)} ·{" "}
                      {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Besoin d&apos;aide ?{" "}
        <Link href="/aide" className="font-medium text-brand-700 hover:underline">
          Consulter le centre d&apos;aide
        </Link>
      </p>
    </>
  );
}

/** Palier de fidélité — basé sur le total réellement dépensé, aucun chiffre inventé. */
function LoyaltyPanel({ totalSpent, currency }: { totalSpent: number; currency: string }) {
  const tier = getLoyaltyTier(totalSpent);
  const next = getNextLoyaltyTier(totalSpent);
  const progress = next
    ? Math.min(100, Math.round((totalSpent / next.minSpend) * 100))
    : 100;

  return (
    <Panel className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Ton palier</p>
          <p className="font-display text-xl font-extrabold text-ink-900">{tier.label}</p>
        </div>
        <div className="flex gap-1.5">
          {LOYALTY_TIERS.map((t) => (
            <span
              key={t.key}
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                t.key === tier.key
                  ? "bg-brand-600 text-white"
                  : totalSpent >= t.minSpend
                    ? "bg-brand-50 text-brand-700"
                    : "bg-ink-100 text-ink-400"
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {next
          ? `Encore ${formatMoney(next.minSpend - totalSpent, currency)} de commandes pour débloquer le palier ${next.label}.`
          : "Tu as atteint le palier le plus élevé."}
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700">
        {tier.perks.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-brand-600" />
            {p}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
