import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/db/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { PlatformIcon } from "@/components/brand/platform-icon";
import { PLATFORMS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Catalogue complet JAL SMM : abonnés, vues, likes et engagement pour TikTok, Instagram, Facebook, WhatsApp, YouTube et Telegram. Prix en francs CFA, affichés au grand jour.",
};

export default async function ServicesPage({
  searchParams,
}: PageProps<"/services">) {
  const params = await searchParams;
  const platform =
    typeof params.plateforme === "string" ? params.plateforme : undefined;

  const catalog = await getCatalog(platform);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Nos services"
        description="Choisis une plateforme, compare les prix pour 1 000 unités, puis crée ton compte pour commander. Aucun prix caché."
      >
        <PlatformFilter active={platform} />
      </PageHeader>

      <section className="container-page py-12">
        {catalog.length === 0 ? (
          <p className="text-muted">
            Aucun service pour cette plateforme pour le moment.
          </p>
        ) : (
          <div className="space-y-10">
            {catalog.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-xl font-bold text-ink-900">{cat.name}</h2>
                  <span className="text-xs text-muted">
                    {cat.services.length} service
                    {cat.services.length > 1 ? "s" : ""}
                  </span>
                </div>
                {cat.description && (
                  <p className="mt-1 text-sm text-muted">{cat.description}</p>
                )}

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-1 font-medium">Service</th>
                        <th className="px-4 py-1 font-medium">Prix / 1 000</th>
                        <th className="px-4 py-1 font-medium">Min – Max</th>
                        <th className="px-4 py-1 font-medium">Délai moyen</th>
                        <th className="px-4 py-1 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.services.map((s) => (
                        <tr key={s.id} className="bg-white">
                          <td className="rounded-l-xl border border-r-0 border-border px-4 py-3">
                            <p className="font-medium text-ink-900">{s.name}</p>
                            {s.description && (
                              <p className="mt-0.5 text-xs text-muted">
                                {s.description}
                              </p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {s.refill && <Tag>Recharge</Tag>}
                              {s.dripfeed && <Tag>Progressif</Tag>}
                              {s.cancelable && <Tag>Annulable</Tag>}
                            </div>
                          </td>
                          <td className="border-y border-border px-4 py-3 font-semibold text-brand-700">
                            {formatMoney(s.rate)}
                          </td>
                          <td className="border-y border-border px-4 py-3 text-muted">
                            {s.minQuantity.toLocaleString("fr-FR")} –{" "}
                            {s.maxQuantity.toLocaleString("fr-FR")}
                          </td>
                          <td className="border-y border-border px-4 py-3 text-muted">
                            {s.averageTime ?? "—"}
                          </td>
                          <td className="rounded-r-xl border border-l-0 border-border px-4 py-3 text-right">
                            <ButtonLink
                              href={`/mon-espace/nouvelle-commande?service=${s.id}`}
                              size="sm"
                              variant="outline"
                            >
                              Commander
                            </ButtonLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-ink-gradient px-6 py-10 text-center text-white">
          <h2 className="text-xl font-bold">Une question sur un service ?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-200">
            On t&apos;aide à choisir ce qui convient à ton objectif. Réponse
            rapide sur WhatsApp.
          </p>
          <div className="mt-5">
            <ButtonLink href="/inscription" variant="gold">
              Créer mon compte
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">
      {children}
    </span>
  );
}

function PlatformFilter({ active }: { active?: string }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/services"
        className={`${base} ${
          !active
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-border bg-white text-ink-600 hover:border-brand-300"
        }`}
      >
        Tout
      </Link>
      {PLATFORMS.map((p) => (
        <Link
          key={p.key}
          href={`/services?plateforme=${p.key}`}
          className={`${base} ${
            active === p.key
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-border bg-white text-ink-600 hover:border-brand-300"
          }`}
        >
          <PlatformIcon
            platform={p}
            size={16}
            className={active === p.key ? "brightness-0 invert" : ""}
          />
          {p.label}
        </Link>
      ))}
    </div>
  );
}
