import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PlatformIcon } from "@/components/brand/platform-icon";
import { PLATFORMS } from "@/lib/constants";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = {
  description: fr.home.heroSubtitle,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <Platforms />
      <HowItWorks />
      <WhyUs />
      <Honesty />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-ink-gradient text-white">
      <div className="container-page grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            <span className="size-1.5 rounded-full bg-brand-400" />
            {fr.home.heroBadge}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            {fr.home.heroTitle}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-ink-200 sm:text-lg">
            {fr.home.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/inscription" size="lg" variant="gold">
              {fr.home.heroPrimaryCta}
            </ButtonLink>
            <ButtonLink
              href="/tarifs"
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              {fr.home.heroSecondaryCta}
            </ButtonLink>
          </div>

          <ul className="mt-8 grid gap-2 text-sm text-ink-100 sm:grid-cols-3">
            {fr.home.heroPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <OrderPreviewCard />
      </div>
    </section>
  );
}

/** Faux aperçu du formulaire de commande — donne à voir le produit. */
function OrderPreviewCard() {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white p-5 text-ink-900 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Nouvelle commande</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          Solde : 12 500 F
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Service">
          <span className="font-medium">TikTok — Abonnés africains 🌍</span>
        </Field>
        <Field label="Lien">
          <span className="text-muted">https://tiktok.com/@moncompte</span>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité">
            <span className="font-medium">1 000</span>
          </Field>
          <Field label="Prix">
            <span className="font-semibold text-brand-700">1 500 F</span>
          </Field>
        </div>
      </div>

      <div className="mt-4 h-11 rounded-xl bg-brand-600 text-center text-sm font-semibold leading-[2.75rem] text-white">
        Lancer la commande
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Démarrage en quelques minutes · Suivi en temps réel
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
        {children}
      </div>
    </div>
  );
}

function StatsBand() {
  return (
    <section className="border-b border-border bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {fr.home.stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="font-display text-3xl font-extrabold text-brand-700">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Platforms() {
  return (
    <section className="container-page py-16 lg:py-20">
      <SectionHeading
        title={fr.home.servicesTitle}
        subtitle={fr.home.servicesSubtitle}
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PLATFORMS.map((p) => (
          <Link
            key={p.key}
            href={`/services?plateforme=${p.key}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-surface">
              <PlatformIcon platform={p} size={22} />
            </span>
            <span className="font-semibold text-ink-900">{p.label}</span>
          </Link>
        ))}
        <Link
          href="/services"
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 p-4 text-sm font-semibold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          Voir tout le catalogue →
        </Link>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="container-page py-16 lg:py-20">
        <SectionHeading title={fr.home.howTitle} />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {fr.home.howSteps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <ButtonLink href="/comment-ca-marche" variant="outline">
            {fr.common.learnMore}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="container-page py-16 lg:py-20">
      <SectionHeading title={fr.home.whyTitle} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fr.home.why.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-white p-6"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <CheckIcon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-ink-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Honesty() {
  return (
    <section className="bg-surface">
      <div className="container-page py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold-500/30 bg-gold-400/10 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <span aria-hidden>⚠️</span> {fr.home.honestyTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-700">
            {fr.home.honestyBody}
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-page py-16 lg:py-20">
      <div className="bg-ink-gradient overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">
          {fr.home.finalCtaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-200">
          {fr.home.finalCtaBody}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/inscription" size="lg" variant="gold">
            {fr.common.getStarted}
          </ButtonLink>
          <ButtonLink
            href="/services"
            size="lg"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            {fr.nav.services}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
