import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = {
  title: fr.apiPage.title,
  description: fr.apiPage.description,
};

export default function ApiPage() {
  const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <>
      <PageHeader
        eyebrow="Revendeurs"
        title={fr.apiPage.title}
        description={fr.apiPage.description}
      />

      <section className="container-page py-12">
        <div className="rounded-2xl border border-gold-500/30 bg-gold-400/10 p-5 text-sm text-ink-700">
          {fr.apiPage.soon}
        </div>

        <h2 className="mt-10 text-lg font-bold text-ink-900">
          Points d&apos;accès prévus
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Méthode</th>
                <th className="py-2 pr-4 font-medium">Chemin</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {fr.apiPage.endpoints.map((e) => (
                <tr key={e.path} className="border-b border-border/60">
                  <td className="py-2.5 pr-4">
                    <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-ink-700">
                      {e.method}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink-800">
                    {e.path}
                  </td>
                  <td className="py-2.5 text-muted">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <ButtonLink href={wa} target="_blank" rel="noopener noreferrer">
            {fr.common.contactWhatsapp}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
