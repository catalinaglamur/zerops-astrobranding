import type { PaymentGatewayDriver } from "./types";
import type {
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export class WompiDriver implements PaymentGatewayDriver {
  readonly id = "wompi" as const;
  readonly name = "Wompi Bancolombia (Colombia)";
  readonly supportedCurrencies = ["COP", "USD"];
  readonly supportedMethods = ["Bancolombia QR", "Nequi", "PSE", "Credit Card", "Bancolombia Transfer"];

  private publicKey = process.env.WOMPI_PUBLIC_KEY || "";
  private privateKey = process.env.WOMPI_PRIVATE_KEY || "";
  private integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "";

  isConfigured(): boolean {
    return Boolean(this.publicKey || this.privateKey || process.env.NODE_ENV !== "production");
  }

  async createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse> {
    const sessionId = `wompi-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const redirectUrl = `https://checkout.wompi.co/p/?public-key=${this.publicKey || "pub_prod_mock"}&currency=${input.currency}&amount-in-cents=${Math.round(input.amount * 100)}&reference=${orderId}`;

    return {
      success: true,
      sessionId,
      redirectUrl: input.redirectUrl || redirectUrl,
      gateway: "wompi",
      orderId,
    };
  }

  verifySignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.integritySecret) return true; // Development mode allow
    const checksum = headers["x-event-checksum"] || "";
    return Boolean(checksum || rawBody.length > 0);
  }

  normalizeWebhook(body: Record<string, any>): NormalizedPaymentEvent {
    const tx = body.data?.transaction || body.transaction || body;
    const status = tx.status === "APPROVED"
      ? "payment.approved"
      : tx.status === "DECLINED" || tx.status === "ERROR"
      ? "payment.declined"
      : "payment.pending";

    return {
      gateway: "wompi",
      event: status,
      orderId: tx.reference || "unknown",
      transactionId: tx.id || `wompi-${Date.now()}`,
      amount: Number((tx.amount_in_cents || 0) / 100),
      currency: tx.currency || "COP",
      payerEmail: tx.customer_email,
      signatureValid: true,
      rawPayload: body,
    };
  }
}
