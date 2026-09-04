import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = {
  title: fr.howPage.title,
  description: fr.howPage.description,
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guide"
        title={fr.howPage.title}
        description={fr.howPage.description}
      />

      <section className="container-page py-12">
        <ol className="space-y-5">
          {fr.howPage.steps.map((step) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <h2 className="text-lg font-bold text-ink-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-gold-500/30 bg-gold-400/10 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-900">
            {fr.howPage.noteTitle}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {fr.howPage.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden className="text-gold-600">
                  •
                </span>
                {n}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/inscription" size="lg">
            {fr.common.signUp}
          </ButtonLink>
          <ButtonLink href="/services" size="lg" variant="outline">
            {fr.nav.services}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
