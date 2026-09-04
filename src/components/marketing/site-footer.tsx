import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PlatformIcon } from "@/components/brand/platform-icon";
import { siteConfig } from "@/config/site";
import { fr } from "@/i18n/fr";
import { PLATFORMS } from "@/lib/constants";

const FOOTER_PLATFORM_KEYS = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
  "whatsapp",
] as const;

const serviceLinks = FOOTER_PLATFORM_KEYS.map((key) => {
  const platform = PLATFORMS.find((p) => p.key === key)!;
  return {
    label: platform.label,
    href: `/services?plateforme=${platform.key}`,
    platform,
  };
});

const companyLinks = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Tutoriels", href: "/tutoriels" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Centre d'aide", href: "/aide" },
  { label: "API revendeur", href: "/api" },
];

const legalLinks = [
  { label: fr.footer.legalTerms, href: "/conditions" },
  { label: fr.footer.legalPrivacy, href: "/confidentialite" },
  { label: fr.footer.legalRefund, href: "/remboursement" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-muted">{fr.footer.about}</p>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`}
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            {siteConfig.contact.whatsapp}
          </a>
        </div>

        <FooterColumn title={fr.footer.columnsServices} links={serviceLinks} />
        <FooterColumn title={fr.footer.columnsCompany} links={companyLinks} />
        <FooterColumn title={fr.footer.columnsLegal} links={legalLinks} />
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.name}. {fr.footer.rights}
          </p>
          <p className="max-w-xl md:text-right">{fr.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
    platform?: (typeof PLATFORMS)[number];
  }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink-900"
            >
              {l.platform && <PlatformIcon platform={l.platform} size={15} />}
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
