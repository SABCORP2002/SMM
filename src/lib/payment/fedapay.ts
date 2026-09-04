import type {
  InitiateInput,
  InitiateResult,
  PaymentGateway,
  VerifyResult,
} from "./types";

/**
 * Client FedaPay (Bénin, Côte d'Ivoire, Togo, Sénégal…).
 * Doc : https://docs.fedapay.com — v1, Bearer token.
 * Non testé en conditions réelles (aucune clé fournie) : à vérifier avec
 * les identifiants du client avant mise en production.
 */
export function createFedapayGateway(opts: {
  secretKey: string;
  environment: "sandbox" | "live";
  callbackUrl: string;
}): PaymentGateway {
  const base =
    opts.environment === "live"
      ? "https://api.fedapay.com/v1"
      : "https://sandbox-api.fedapay.com/v1";

  async function call(path: string, init: RequestInit) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.secretKey}`,
        ...init.headers,
      },
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `FedaPay : ${data?.message ?? `HTTP ${res.status}`}`,
      );
    }
    return data;
  }

  return {
    kind: "fedapay",

    async initiate(input: InitiateInput): Promise<InitiateResult> {
      const created = await call("/transactions", {
        method: "POST",
        body: JSON.stringify({
          description: input.description,
          amount: Math.round(input.amount),
          currency: { iso: input.currency },
          callback_url: opts.callbackUrl,
          custom_metadata: { reference: input.reference },
        }),
      });
      const transactionId = created?.["v1/transaction"]?.id ?? created?.id;
      if (!transactionId) throw new Error("FedaPay : transaction non créée");

      const tokenRes = await call(`/transactions/${transactionId}/token`, {
        method: "POST",
      });
      const url =
        tokenRes?.["v1/transaction_token"]?.url ?? tokenRes?.url ?? null;

      return {
        externalReference: String(transactionId),
        redirectUrl: url,
      };
    },

    async verify(externalReference: string): Promise<VerifyResult> {
      const data = await call(`/transactions/${externalReference}`, {
        method: "GET",
      });
      const tx = data?.["v1/transaction"] ?? data;
      const status = String(tx?.status ?? "pending");
      const mapped =
        status === "approved"
          ? "completed"
          : status === "declined" || status === "canceled"
            ? "failed"
            : "pending";
      return { status: mapped, amount: tx?.amount ?? null };
    },
  };
}
