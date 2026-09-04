import type { Metadata } from "next";
import { getAllPaymentsAdmin } from "@/db/admin-queries";
import { formatMoney, timeAgo } from "@/lib/utils";
import { DashHeading, EmptyState, Panel, StatusBadge } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Admin — Paiements" };

export default async function AdminPaymentsPage() {
  const list = await getAllPaymentsAdmin(200);

  return (
    <>
      <DashHeading title="Paiements" description={`${list.length} paiement(s).`} />

      <Panel>
        {list.length === 0 ? (
          <EmptyState title="Aucun paiement pour l'instant." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Montant</th>
                  <th className="py-2 pr-4 font-medium">Passerelle</th>
                  <th className="py-2 pr-4 font-medium">Référence</th>
                  <th className="py-2 pr-4 font-medium">Statut</th>
                  <th className="py-2 font-medium">Créé</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-ink-900">{p.userName}</p>
                      <p className="text-xs text-muted">{p.userEmail}</p>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-brand-700">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-800">
                      {p.gateway}
                      {p.operator ? ` · ${p.operator}` : ""}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted">{p.reference}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={p.status} kind="payment" />
                    </td>
                    <td className="py-2.5 text-xs text-muted">{timeAgo(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
