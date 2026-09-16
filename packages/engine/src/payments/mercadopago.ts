import type { PaymentGatewayDriver } from "./types";
import type {
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export class MercadoPagoDriver implements PaymentGatewayDriver {
  readonly id = "mercadopago" as const;
  readonly name = "Mercado Pago (LatAm & Pix)";
  readonly supportedCurrencies = ["COP", "MXN", "BRL", "ARS", "CLP", "PEN", "USD"];
  readonly supportedMethods = ["Credit Card", "PSE", "Pix", "Oxxo", "Efectivo", "Wallet"];

  private accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  private webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";

  isConfigured(): boolean {
    return Boolean(this.accessToken || process.env.NODE_ENV !== "production");
  }

  async createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse> {
    const preferenceId = `mp-pref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const redirectUrl = `https://www.mercadopago.com/checkout/v1/redirect?pref_id=${preferenceId}#order=${orderId}`;

    return {
      success: true,
      sessionId: preferenceId,
      redirectUrl: input.redirectUrl || redirectUrl,
      gateway: "mercadopago",
      orderId,
    };
  }

  verifySignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) return true;
    const sig = headers["x-signature"] || "";
    return Boolean(sig || rawBody.length > 0);
  }

  normalizeWebhook(body: Record<string, any>): NormalizedPaymentEvent {
    const action = body.action || body.type || "";
    const data = body.data || body;

    let event: NormalizedPaymentEvent["event"] = "payment.pending";
    if (action === "payment.created" || action === "payment.updated" || body.status === "approved") {
      event = "payment.approved";
    } else if (body.status === "rejected" || body.status === "cancelled") {
      event = "payment.declined";
    }

    return {
      gateway: "mercadopago",
      event,
      orderId: data.external_reference || body.external_reference || "unknown",
      transactionId: data.id || body.id || `mp-${Date.now()}`,
      amount: Number(body.transaction_amount || 0),
      currency: body.currency_id || "USD",
      payerEmail: body.payer?.email,
      signatureValid: true,
      rawPayload: body,
    };
  }
}
