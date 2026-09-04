import type { Metadata } from "next";
import { SoonPanel } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Nouvelle commande" };

export default function NewOrderPage() {
  return (
    <SoonPanel
      title="Nouvelle commande"
      phase="Phase 4"
      description="Le formulaire de commande (choix du service, lien, quantité, calcul du prix et envoi au fournisseur) arrive à la prochaine étape du développement."
    />
  );
}
