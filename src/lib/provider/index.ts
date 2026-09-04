import type { providers } from "@/db/schema";
import { createMockClient } from "./mock";
import { createPerfectPanelClient } from "./perfect-panel";
import type { ProviderClient } from "./types";

type ProviderRow = typeof providers.$inferSelect;

/**
 * Renvoie le client à utiliser pour un fournisseur.
 * Sans URL d'API (ou si SMM_PROVIDER_MODE=mock), on prend le bac à sable.
 */
export function getProviderClient(provider: Pick<ProviderRow, "apiUrl" | "apiKey">): ProviderClient {
  const forceMock = process.env.SMM_PROVIDER_MODE === "mock";
  if (forceMock || !provider.apiUrl || !provider.apiKey) {
    return createMockClient();
  }
  return createPerfectPanelClient({
    apiUrl: provider.apiUrl,
    apiKey: provider.apiKey,
  });
}

export * from "./types";
