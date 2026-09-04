import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { fr } from "@/i18n/fr";

/** Écran temporaire tant que l'espace client (phase 3) n'est pas livré. */
export function AuthPlaceholder({ heading }: { heading: string }) {
  const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <section className="container-page flex flex-col items-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 font-display text-2xl font-extrabold text-white">
        J
      </span>
      <h1 className="mt-6 text-2xl font-bold text-ink-900">{heading}</h1>
      <p className="mt-2 inline-flex rounded-full bg-gold-400/20 px-3 py-1 text-sm font-semibold text-gold-600">
        {fr.auth.soonTitle}
      </p>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted">
        {fr.auth.soonBody}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href={wa} target="_blank" rel="noopener noreferrer">
          {fr.common.contactWhatsapp}
        </ButtonLink>
        <ButtonLink href="/services" variant="outline">
          {fr.nav.services}
        </ButtonLink>
      </div>
    </section>
  );
}
