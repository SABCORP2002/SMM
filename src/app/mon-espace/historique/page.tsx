import type { Metadata } from "next";
import { SoonPanel } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Historique" };

export default function HistoryPage() {
  return (
    <SoonPanel
      title="Historique des paiements"
      phase="Phase 5"
      description="Le relevé de tes recharges et de tous les mouvements de ton portefeuille (crédits, débits de commande, remboursements) sera visible ici avec le module paiements."
    />
  );
}
