import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/marketing/auth-placeholder";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = { title: fr.auth.signInTitle };

export default function ConnexionPage() {
  return <AuthPlaceholder heading={fr.auth.signInTitle} />;
}
