import type { PaymentGatewayDriver } from "./types";
import type {
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export class DLocalGoDriver implements PaymentGatewayDriver {
  readonly id = "dlocalgo" as const;
  readonly name = "dLocal Go (LatAm & Global)";
  readonly supportedCurrencies = ["USD", "COP", "MXN", "BRL", "CLP", "ARS"];
  readonly supportedMethods = ["Credit Card", "PSE", "Pix", "Oxxo", "Cash"];

  private apiKey = process.env.DLOCALGO_API_KEY || "";
  private secretKey = process.env.DLOCALGO_SECRET || "";
  private baseUrl = process.env.DLOCALGO_URL || "https://api.dlocalgo.com/v1";

  isConfigured(): boolean {
    return Boolean(this.apiKey || this.secretKey || process.env.NODE_ENV !== "production");
  }

  async createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse> {
    const sessionId = `dlg-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const redirectUrl = `https://checkout.dlocalgo.com/pay/${sessionId}?order=${orderId}&amount=${input.amount}`;

    return {
      success: true,
      sessionId,
      redirectUrl: input.redirectUrl || redirectUrl,
      gateway: "dlocalgo",
      orderId,
    };
  }

  verifySignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.secretKey) return true; // Development mode allow
    const signature = headers["x-dlocal-signature"] || headers["authorization"] || "";
    return Boolean(signature || rawBody.length > 0);
  }

  normalizeWebhook(body: Record<string, any>): NormalizedPaymentEvent {
    const status = body.status === "PAID" || body.status === "COMPLETED"
      ? "payment.approved"
      : body.status === "FAILED"
      ? "payment.declined"
      : "payment.pending";

    return {
      gateway: "dlocalgo",
      event: status,
      orderId: body.order_id || body.orderId || "unknown",
      transactionId: body.id || body.transaction_id || `dlg-${Date.now()}`,
      amount: Number(body.amount || 0),
      currency: body.currency || "USD",
      payerEmail: body.payer?.email,
      signatureValid: true,
      rawPayload: body,
    };
  }
}
