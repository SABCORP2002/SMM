import {
  type ProviderClient,
  type ProviderStatusResult,
} from "./types";

/**
 * Fournisseur de démonstration — aucune requête réseau.
 * Le cycle de vie d'une commande est déduit du temps écoulé depuis sa création,
 * encodé dans le numéro de commande : MOCK-<crééLe>-<quantité>-<alea>.
 *
 * Accéléré pour la démo :
 *   0–15 s  → en attente
 *   15–45 s → en cours (progression linéaire)
 *   ≥ 45 s  → terminée
 */
const PENDING_MS = 15_000;
const RUNNING_MS = 45_000;

export function createMockClient(): ProviderClient {
  return {
    kind: "mock",

    async addOrder({ quantity }) {
      const rand = Math.random().toString(36).slice(2, 8);
      return {
        providerOrderId: `MOCK-${Date.now()}-${quantity}-${rand}`,
      };
    },

    async orderStatus(providerOrderId): Promise<ProviderStatusResult> {
      const [, createdAtRaw, qtyRaw] = providerOrderId.split("-");
      const createdAt = Number(createdAtRaw) || Date.now();
      const quantity = Number(qtyRaw) || 0;
      const elapsed = Date.now() - createdAt;
      const startCount = 1000 + (createdAt % 5000);

      if (elapsed < PENDING_MS) {
        return {
          status: "pending",
          startCount: null,
          remains: quantity,
          charge: null,
          currency: "USD",
        };
      }
      if (elapsed < RUNNING_MS) {
        const progress = (elapsed - PENDING_MS) / (RUNNING_MS - PENDING_MS);
        return {
          status: "in_progress",
          startCount,
          remains: Math.max(0, Math.round(quantity * (1 - progress))),
          charge: null,
          currency: "USD",
        };
      }
      return {
        status: "completed",
        startCount,
        remains: 0,
        charge: null,
        currency: "USD",
      };
    },

    async balance() {
      return { balance: 100_000, currency: "USD" };
    },
  };
}
