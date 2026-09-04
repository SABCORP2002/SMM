import type { Metadata } from "next";
import { getAdminStats, getAllOrdersAdmin, getAllPaymentsAdmin } from "@/db/admin-queries";
import { formatMoney, timeAgo } from "@/lib/utils";
import { DashHeading, Panel, StatCard, StatusBadge } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Admin — Tableau de bord" };

export default async function AdminHome() {
  const stats = await getAdminStats();
  const recentOrders = await getAllOrdersAdmin({ limit: 6 });
  const recentPayments = await getAllPaymentsAdmin(6);

  return (
    <>
      <DashHeading title="Tableau de bord admin" description="Vue d'ensemble du panel." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={String(stats.userCount)} sub={`+${stats.newUsers30d} sur 30 j`} />
        <StatCard label="Commandes" value={String(stats.orderCount)} sub={`${stats.pendingOrders} en attente`} />
        <StatCard label="Chiffre d'affaires" value={formatMoney(stats.revenue)} />
        <StatCard label="Solde total portefeuilles" value={formatMoney(stats.walletTotal)} sub={`${stats.pendingPayments} paiement(s) en attente`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Commandes récentes">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{o.serviceName}</p>
                    <p className="truncate text-xs text-muted">
                      {o.userName} · {formatMoney(o.charge)} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Paiements récents">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted">Aucun paiement.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{p.userName}</p>
                    <p className="truncate text-xs text-muted">
                      {p.operator ?? p.gateway} · {timeAgo(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-700">{formatMoney(p.amount, p.currency)}</p>
                    <StatusBadge status={p.status} kind="payment" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
