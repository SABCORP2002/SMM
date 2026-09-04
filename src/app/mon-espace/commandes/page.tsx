import type { Metadata } from "next";
import { SoonPanel } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Mes commandes" };

export default function OrdersPage() {
  return (
    <SoonPanel
      title="Mes commandes"
      phase="Phase 4"
      description="La liste de tes commandes avec leur statut en temps réel (en attente, en cours, terminée, partielle) sera disponible une fois le module de commande en place."
    />
  );
}
