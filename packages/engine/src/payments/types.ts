import type {
  PaymentGatewayId,
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export interface PaymentGatewayDriver {
  readonly id: PaymentGatewayId;
  readonly name: string;
  readonly supportedCurrencies: string[];
  readonly supportedMethods: string[];

  isConfigured(): boolean;

  createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse>;

  verifySignature(headers: Record<string, string>, rawBody: string): boolean;

  normalizeWebhook(body: Record<string, any>, headers?: Record<string, string>): NormalizedPaymentEvent;
}
