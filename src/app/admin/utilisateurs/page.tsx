import type { Metadata } from "next";
import { getAllUsersAdmin } from "@/db/admin-queries";
import { toggleUserStatusAction } from "@/actions/admin";
import { formatMoney, timeAgo } from "@/lib/utils";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import { BalanceAdjustForm } from "@/components/admin/balance-adjust-form";

export const metadata: Metadata = { title: "Admin — Utilisateurs" };

export default async function AdminUsersPage() {
  const users = await getAllUsersAdmin();

  return (
    <>
      <DashHeading title="Utilisateurs" description={`${users.length} compte(s).`} />

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Nom</th>
                <th className="py-2 pr-4 font-medium">Rôle</th>
                <th className="py-2 pr-4 font-medium">Solde</th>
                <th className="py-2 pr-4 font-medium">Inscrit</th>
                <th className="py-2 pr-4 font-medium">Statut</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-ink-900">{u.name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-semibold text-brand-700">
                    {formatMoney(u.balance, u.currency)}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-muted">{timeAgo(u.createdAt)}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                        u.status === "active" ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {u.status === "active" ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-col gap-1.5">
                      <BalanceAdjustForm userId={u.id} />
                      {u.role !== "admin" && (
                        <form action={toggleUserStatusAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input
                            type="hidden"
                            name="next"
                            value={u.status === "active" ? "suspended" : "active"}
                          />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-ink-500 hover:underline"
                          >
                            {u.status === "active" ? "Suspendre" : "Réactiver"}
                          </button>
                        </form>
                      )}
                    </div>
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
