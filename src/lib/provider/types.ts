/**
 * Contrat commun aux fournisseurs SMM en amont.
 * Calqué sur l'API standard du secteur (« Perfect Panel ») :
 *   POST form-urlencoded { key, action, ... }
 */

export type ProviderOrderStatus =
  | "pending"
  | "in_progress"
  | "processing"
  | "completed"
  | "partial"
  | "canceled"
  | "error";

export interface ProviderAddResult {
  providerOrderId: string;
}

export interface ProviderStatusResult {
  status: ProviderOrderStatus;
  startCount: number | null;
  remains: number | null;
  charge: number | null;
  currency: string | null;
}

export interface ProviderBalance {
  balance: number;
  currency: string;
}

export interface ProviderClient {
  readonly kind: "mock" | "perfect-panel";
  addOrder(input: {
    providerServiceId: string;
    link: string;
    quantity: number;
    runs?: number;
    interval?: number;
  }): Promise<ProviderAddResult>;
  orderStatus(providerOrderId: string): Promise<ProviderStatusResult>;
  balance(): Promise<ProviderBalance>;
}

export interface ProviderConfig {
  apiUrl: string;
  apiKey: string;
}

/** Correspondance statut fournisseur → statut interne JAL SMM. */
export function mapProviderStatus(raw: string): ProviderOrderStatus {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");
  switch (s) {
    case "pending":
    case "awaiting":
      return "pending";
    case "in_progress":
    case "processing":
      return "in_progress";
    case "completed":
    case "complete":
      return "completed";
    case "partial":
      return "partial";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "fail":
    case "failed":
    case "error":
      return "error";
    default:
      return "processing";
  }
}
