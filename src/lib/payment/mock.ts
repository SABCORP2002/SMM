import type { InitiateInput, PaymentGateway, VerifyResult } from "./types";

/**
 * Passerelle Mobile Money de démonstration — aucune requête réseau.
 * Simule le délai réel d'une confirmation Orange/MTN/Moov/Wave : la
 * référence encode l'heure de création, complétée automatiquement après
 * quelques secondes (comme le fournisseur SMM bac à sable).
 */
const CONFIRM_AFTER_MS = 8_000;

export function createMockGateway(): PaymentGateway {
  return {
    kind: "mock",

    async initiate(input: InitiateInput) {
      return {
        externalReference: `MOCK-PAY-${Date.now()}-${input.amount}`,
        redirectUrl: null,
      };
    },

    async verify(externalReference: string): Promise<VerifyResult> {
      const [, , createdAtRaw, amountRaw] = externalReference.split("-");
      const createdAt = Number(createdAtRaw) || Date.now();
      const amount = Number(amountRaw) || 0;
      const elapsed = Date.now() - createdAt;

      if (elapsed < CONFIRM_AFTER_MS) {
        return { status: "pending", amount: null };
      }
      return { status: "completed", amount };
    },
  };
}
