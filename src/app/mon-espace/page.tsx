import type { Metadata } from "next";
import Link from "next/link";
import { getUserDashboard } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { syncActiveOrders } from "@/lib/orders";
import { formatMoney, timeAgo } from "@/lib/utils";
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
