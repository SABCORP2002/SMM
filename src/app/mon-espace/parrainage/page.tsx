import type { Metadata } from "next";
import { getReferralInfo } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/utils";
import { DashHeading, EmptyState, Panel, StatCard } from "@/components/dashboard/ui";
import { CopyField } from "@/components/dashboard/copy-field";

export const metadata: Metadata = { title: "Parrainage" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

const STEPS = [
  { title: "Partage ton lien", body: "Sur WhatsApp, TikTok, Facebook — là où sont déjà tes contacts." },
  { title: "Il crée son compte", body: "Le lien l'associe à toi, définitivement, dès son inscription." },
  { title: "Il recharge", body: "À chaque recharge de son compte, ta commission part automatiquement." },
  { title: "Tu es crédité", body: "Directement sur ton solde JAL SMM, utilisable tout de suite." },
];

export default async function ReferralPage() {
  const user = await requireUser();
  const info = await getReferralInfo(user.id);
  const link = `${siteConfig.url}/inscription?ref=${info.referralCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(link)}`;

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

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
        <Panel title="Ton lien d'invitation">
          <CopyField value={link} />
          <p className="mt-2 text-xs text-muted">
            Partage ce lien sur WhatsApp, TikTok ou Facebook. Toute personne qui
            crée un compte via ce lien devient ton filleul, à vie.
          </p>
        </Panel>
        <Panel title="Ou fais scanner" className="flex flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- image externe (générateur de QR), non pertinent pour next/image */}
          <img src={qrUrl} alt="QR code du lien de parrainage" width={140} height={140} className="rounded-lg" />
          <p className="mt-2 text-xs text-muted">Pratique en tête-à-tête ou sur un flyer.</p>
        </Panel>
      </div>

      <Panel title="Comment ça marche" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-ink-900">{s.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Conditions, en clair" className="mt-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Taux de commission</span>
            <span className="font-semibold text-ink-900">{info.commissionPercent}% des recharges</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Seuil minimum pour toucher</span>
            <span className="font-semibold text-ink-900">Aucun</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Durée du lien</span>
            <span className="font-semibold text-ink-900">À vie</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Créditée sur</span>
            <span className="font-semibold text-ink-900">Ton solde, utilisable tout de suite</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Contrairement à beaucoup de programmes, il n&apos;y a pas de seuil à
          atteindre avant de pouvoir utiliser tes gains : ils s&apos;ajoutent à
          ton solde dès la recharge de ton filleul. Auto-parrainage et faux
          comptes ne sont pas autorisés.
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
