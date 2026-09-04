import type { Metadata } from "next";
import { getUserTransactions } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { syncPendingPayments } from "@/lib/payments";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { formatMoney, timeAgo } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { DashHeading, EmptyState, Panel } from "@/components/dashboard/ui";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { syncMyPaymentsAction } from "@/actions/payments";

export const metadata: Metadata = { title: "Historique" };

export default async function HistoryPage() {
  const user = await requireUser();
  await syncPendingPayments({ userId: user.id, limit: 20 });
  const list = await getUserTransactions(user.id);

  return (
    <>
      <DashHeading
        title="Historique du portefeuille"
        action={
          <div className="flex gap-2">
            <RefreshButton action={syncMyPaymentsAction} label="Vérifier mes paiements" />
            <ButtonLink href="/mon-espace/recharger" size="sm">
              Recharger
            </ButtonLink>
          </div>
        }
      />

      <Panel>
        {list.length === 0 ? (
          <EmptyState
            title="Aucun mouvement pour l'instant."
            cta={{ label: "Recharger mon compte →", href: "/mon-espace/recharger" }}
          />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((t) => {
              const positive = Number(t.amount) >= 0;
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">
                      {TRANSACTION_TYPE_LABELS[t.type as keyof typeof TRANSACTION_TYPE_LABELS] ?? t.type}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {t.description} · {timeAgo(t.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${positive ? "text-brand-700" : "text-red-600"}`}>
                      {positive ? "+" : ""}
                      {formatMoney(t.amount, user.currency)}
                    </p>
                    <p className="text-xs text-muted">
                      Solde : {formatMoney(t.balanceAfter, user.currency)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
