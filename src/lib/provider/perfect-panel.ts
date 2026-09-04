import {
  mapProviderStatus,
  type ProviderClient,
  type ProviderConfig,
} from "./types";

/**
 * Client pour l'API standard « Perfect Panel » (v2).
 * Toutes les requêtes : POST application/x-www-form-urlencoded.
 */
export function createPerfectPanelClient(cfg: ProviderConfig): ProviderClient {
  async function call(params: Record<string, string | number>) {
    const body = new URLSearchParams();
    body.set("key", cfg.apiKey);
    for (const [k, v] of Object.entries(params)) body.set(k, String(v));

    const res = await fetch(cfg.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      // Pas de cache : ce sont des opérations.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Fournisseur : HTTP ${res.status}`);
    }
    const data = (await res.json()) as Record<string, unknown>;
    if (data.error) {
      throw new Error(`Fournisseur : ${String(data.error)}`);
    }
    return data;
  }

  return {
    kind: "perfect-panel",

    async addOrder({ providerServiceId, link, quantity, runs, interval }) {
      const params: Record<string, string | number> = {
        action: "add",
        service: providerServiceId,
        link,
        quantity,
      };
      if (runs && interval) {
        params.runs = runs;
        params.interval = interval;
      }
      const data = await call(params);
      const id = data.order ?? data.id;
      if (id == null) throw new Error("Fournisseur : réponse sans numéro de commande");
      return { providerOrderId: String(id) };
    },

    async orderStatus(providerOrderId) {
      const data = await call({ action: "status", order: providerOrderId });
      const num = (v: unknown) =>
        v == null || v === "" ? null : Number(String(v).replace(/[^\d.-]/g, ""));
      return {
        status: mapProviderStatus(String(data.status ?? "processing")),
        startCount: num(data.start_count),
        remains: num(data.remains),
        charge: num(data.charge),
        currency: (data.currency as string) ?? null,
      };
    },

    async balance() {
      const data = await call({ action: "balance" });
      return {
        balance: Number(data.balance ?? 0),
        currency: (data.currency as string) ?? "USD",
      };
    },
  };
}
