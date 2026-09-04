import type { Metadata } from "next";
import { getUserOrders } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { syncActiveOrders } from "@/lib/orders";
import { formatMoney, timeAgo } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { DashHeading, EmptyState, Panel, StatusBadge } from "@/components/dashboard/ui";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { syncMyOrdersAction } from "@/actions/orders";

export const metadata: Metadata = { title: "Mes commandes" };

export default async function OrdersPage() {
  const user = await requireUser();

  // Rafraîchit les statuts actifs de l'utilisateur avant d'afficher la liste.
  await syncActiveOrders({ userId: user.id, limit: 30 });
  const list = await getUserOrders(user.id);

  return (
    <>
      <DashHeading
        title="Mes commandes"
        action={
          <div className="flex gap-2">
            <RefreshButton action={syncMyOrdersAction} />
            <ButtonLink href="/mon-espace/nouvelle-commande" size="sm">
              Nouvelle commande
            </ButtonLink>
          </div>
        }
      />

      <Panel>
        {list.length === 0 ? (
          <EmptyState
            title="Tu n'as pas encore passé de commande."
            cta={{ label: "Créer ma première commande →", href: "/mon-espace/nouvelle-commande" }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">Service</th>
                  <th className="py-2 pr-4 font-medium">Quantité</th>
                  <th className="py-2 pr-4 font-medium">Reste</th>
                  <th className="py-2 pr-4 font-medium">Prix</th>
                  <th className="py-2 pr-4 font-medium">Statut</th>
                  <th className="py-2 font-medium">Créée</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 align-top">
                    <td className="max-w-[220px] py-3 pr-4">
                      <p className="truncate font-medium text-ink-900">{o.serviceName}</p>
                      <p className="truncate text-xs text-muted">{o.link}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink-800">
                      {o.quantity.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3 pr-4 text-ink-800">
                      {o.remains != null ? o.remains.toLocaleString("fr-FR") : "—"}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-brand-700">
                      {formatMoney(o.charge, user.currency)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 text-xs text-muted">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-3 text-center text-xs text-muted">
        Les statuts se mettent à jour automatiquement à chaque visite de cette page.
      </p>
    </>
  );
}
