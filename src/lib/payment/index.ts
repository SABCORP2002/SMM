import { createFedapayGateway } from "./fedapay";
import { createMockGateway } from "./mock";
import type { PaymentGateway } from "./types";

/**
 * Bascule automatique sur le bac à sable tant qu'aucune vraie clé FedaPay
 * n'est renseignée. Même logique que le driver fournisseur SMM.
 */
export function getPaymentGateway(): PaymentGateway {
  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  if (!secretKey) return createMockGateway();

  return createFedapayGateway({
    secretKey,
    environment:
      process.env.FEDAPAY_ENVIRONMENT === "live" ? "live" : "sandbox",
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/mon-espace/recharger`,
  });
}

export * from "./types";
