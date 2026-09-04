import type { Metadata } from "next";
import { SoonPanel } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Recharger" };

export default function TopUpPage() {
  return (
    <SoonPanel
      title="Recharger mon compte"
      phase="Phase 5"
      description="Le rechargement par Mobile Money (Orange Money, MTN MoMo, Moov, Wave) via FedaPay / CinetPay arrive à la phase paiements. En attendant, écris-nous sur WhatsApp pour créditer ton solde manuellement."
    />
  );
}
