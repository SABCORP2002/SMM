import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrdersAdmin } from "@/db/admin-queries";
import { updateOrderStatusAction } from "@/actions/admin";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatMoney, timeAgo } from "@/lib/utils";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";

export const metadata: Metadata = { title: "Admin — Commandes" };

const STATUS_OPTIONS = ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }));

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/commandes">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const orders = await getAllOrdersAdmin({ status, limit: 150 });

  return (
    <>
      <DashHeading
        title="Commandes"
        description={`${orders.length} commande(s)${status ? ` — statut : ${ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status}` : ""}`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/commandes" className={`rounded-full border px-3 py-1.5 text-sm ${!status ? "border-ink-900 bg-ink-900 text-white" : "border-border bg-white text-ink-600"}`}>
          Toutes
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/commandes?status=${s}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${status === s ? "border-ink-900 bg-ink-900 text-white" : "border-border bg-white text-ink-600"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Client</th>
                <th className="py-2 pr-4 font-medium">Service</th>
                <th className="py-2 pr-4 font-medium">Qté</th>
                <th className="py-2 pr-4 font-medium">Prix</th>
                <th className="py-2 pr-4 font-medium">Créée</th>
                <th className="py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-ink-900">{o.userName}</p>
                    <p className="text-xs text-muted">{o.userEmail}</p>
                  </td>
                  <td className="max-w-[220px] truncate py-2.5 pr-4 text-ink-800">{o.serviceName}</td>
                  <td className="py-2.5 pr-4 text-ink-800">{o.quantity.toLocaleString("fr-FR")}</td>
                  <td className="py-2.5 pr-4 font-semibold text-brand-700">{formatMoney(o.charge)}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted">{timeAgo(o.createdAt)}</td>
                  <td className="py-2.5">
                    <form action={updateOrderStatusAction}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <AutoSubmitSelect
                        name="status"
                        defaultValue={o.status}
                        options={STATUS_OPTIONS}
                        className="h-9 rounded-lg border border-border bg-white px-2 text-xs"
                      />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
