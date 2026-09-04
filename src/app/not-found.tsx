import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>

      <main className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">
          Cette page n&apos;existe pas (encore)
        </h1>
        <p className="mt-2 max-w-md text-muted">
          Le lien est peut-être erroné, ou cette partie du site est en cours de
          construction. Reviens à l&apos;accueil ou écris-nous sur WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Voir les services
          </ButtonLink>
        </div>
        <Link
          href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`}
          className="mt-4 text-sm font-medium text-brand-700 hover:underline"
        >
          Contacter le support
        </Link>
      </main>
    </div>
  );
}
