import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = {
  title: fr.faq.title,
  description: fr.faq.description,
};

export default function HelpPage() {
  const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title={fr.faq.title}
        description={fr.faq.description}
      />

      <section className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-3">
          {fr.faq.items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink-900">
                {item.q}
                <span
                  aria-hidden
                  className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-ink-gradient px-6 py-8 text-center text-white">
          <h2 className="text-lg font-bold">Tu n&apos;as pas trouvé ?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-200">
            Écris-nous directement, une vraie personne te répond.
          </p>
          <div className="mt-5">
            <ButtonLink
              href={wa}
              variant="gold"
              target="_blank"
              rel="noopener noreferrer"
            >
              {fr.common.contactWhatsapp}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
