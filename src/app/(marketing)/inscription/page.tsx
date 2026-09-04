import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = { title: fr.auth.signUpTitle };

export default async function InscriptionPage({
  searchParams,
}: PageProps<"/inscription">) {
  if (await getCurrentUser()) redirect("/mon-espace");

  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : undefined;

  return (
    <section className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-ink-900">
          {fr.auth.signUpTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Gratuit, en 2 minutes. Aucune carte bancaire demandée.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-white p-6">
          <SignupForm referralCode={ref} />
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          En créant un compte, tu acceptes nos{" "}
          <Link href="/conditions" className="underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
