/** Contrat commun aux passerelles de paiement (Mobile Money / carte). */

export type PaymentStatus = "pending" | "completed" | "failed" | "canceled";

export interface InitiateInput {
  reference: string;
  amount: number;
  currency: string;
  phone: string;
  operator: string;
  description: string;
}

export interface InitiateResult {
  /** Référence côté passerelle. */
  externalReference: string;
  /** URL de paiement à ouvrir (redirection ou USSD-push selon la passerelle). */
  redirectUrl: string | null;
}

export interface VerifyResult {
  status: PaymentStatus;
  amount: number | null;
}

export interface PaymentGateway {
  readonly kind: "mock" | "fedapay";
  initiate(input: InitiateInput): Promise<InitiateResult>;
  verify(externalReference: string): Promise<VerifyResult>;
}
