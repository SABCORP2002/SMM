import type { Metadata } from "next";
import { getCatalog } from "@/db/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { formatMoney, computeCharge } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Comment fonctionne la tarification JAL SMM : un prix pour 1 000 unités, en francs CFA, sans frais cachés. Grille complète et exemple de calcul.",
};

export default async function TarifsPage() {
  const catalog = await getCatalog();

  const example = catalog
    .flatMap((c) => c.services)
    .find((s) => s.rate <= 2000);

  return (
    <>
      <PageHeader
        eyebrow="Transparence"
        title="Tarifs"
        description="Chaque service a un prix pour 1 000 unités, affiché en francs CFA. Tu paies exactement au prorata de la quantité commandée."
      />

      <section className="container-page py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard title="Prix pour 1 000">
            Le tarif de référence. Pour 500 unités, tu paies la moitié ; pour
            2 000, le double.
          </InfoCard>
          <InfoCard title="Débité sur ton solde">
            Aucune carte à ressaisir : le montant est retiré de ton portefeuille,
            que tu recharges par Mobile Money.
          </InfoCard>
          <InfoCard title="Remboursement">
            Une commande qui ne démarre pas est recréditée sur ton solde. Voir la
            politique de remboursement.
          </InfoCard>
        </div>

        {example && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Exemple de calcul
            </h2>
            <p className="mt-2 text-sm text-ink-700">
              <span className="font-medium">{example.name}</span> à{" "}
              {formatMoney(example.rate)} pour 1 000 → une commande de{" "}
              <span className="font-medium">1 500</span> unités coûte{" "}
              <span className="font-semibold text-brand-700">
                {formatMoney(computeCharge(example.rate, 1500))}
              </span>
              .
            </p>
          </div>
        )}

        <div className="mt-10 space-y-8">
          {catalog.map((cat) => (
            <div key={cat.id}>
              <h2 className="text-lg font-bold text-ink-900">{cat.name}</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-4 font-medium">Service</th>
                      <th className="py-2 pr-4 font-medium">Prix / 1 000</th>
                      <th className="py-2 font-medium">Min – Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.services.map((s) => (
                      <tr key={s.id} className="border-b border-border/60">
                        <td className="py-2.5 pr-4 text-ink-800">{s.name}</td>
                        <td className="py-2.5 pr-4 font-semibold text-brand-700">
                          {formatMoney(s.rate)}
                        </td>
                        <td className="py-2.5 text-muted">
                          {s.minQuantity.toLocaleString("fr-FR")} –{" "}
                          {s.maxQuantity.toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <ButtonLink href="/inscription" size="lg">
            Créer mon compte gratuit
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
    </div>
  );
}
