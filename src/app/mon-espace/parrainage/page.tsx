import type { Metadata } from "next";
import { getReferralInfo } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/utils";
import { DashHeading, EmptyState, Panel, StatCard } from "@/components/dashboard/ui";
import { CopyField } from "@/components/dashboard/copy-field";

export const metadata: Metadata = { title: "Parrainage" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default async function ReferralPage() {
  const user = await requireUser();
  const info = await getReferralInfo(user.id);
  const link = `${siteConfig.url}/inscription?ref=${info.referralCode}`;

  return (
    <>
      <DashHeading
        title="Parrainage"
        description="Invite ton entourage et touche une commission sur leurs recharges."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Filleuls" value={String(info.filleuls.length)} />
        <StatCard
          label="Gains cumulés"
          value={formatMoney(info.totalEarned, user.currency)}
        />
        <StatCard label="Ton code" value={info.referralCode} />
      </div>

      <Panel title="Ton lien d'invitation" className="mt-4">
        <CopyField value={link} />
        <p className="mt-2 text-xs text-muted">
          Partage ce lien sur WhatsApp, TikTok ou Facebook. Toute personne qui
          crée un compte via ce lien devient ton filleul.
        </p>
      </Panel>

      <Panel title="Mes filleuls" className="mt-4">
        {info.filleuls.length === 0 ? (
          <EmptyState title="Personne n'a encore rejoint avec ton lien." />
        ) : (
          <ul className="divide-y divide-border">
            {info.filleuls.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-ink-900">{f.name}</span>
                <span className="text-xs text-muted">
                  Inscrit le {dateFmt.format(f.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
