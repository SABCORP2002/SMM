import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = { title: fr.auth.signInTitle };

export default async function ConnexionPage() {
  if (await getCurrentUser()) redirect("/mon-espace");

  return (
    <section className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-ink-900">
          {fr.auth.signInTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Accède à ton espace, tes commandes et ton portefeuille.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-white p-6">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
