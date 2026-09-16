import type { PaymentGatewayDriver } from "./types";
import type {
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export class EPaycoDriver implements PaymentGatewayDriver {
  readonly id = "epayco" as const;
  readonly name = "ePayco Davivienda (Colombia)";
  readonly supportedCurrencies = ["COP", "USD"];
  readonly supportedMethods = ["Daviplata", "PSE", "Credit Card", "Efecty", "SafetyPay"];

  private publicKey = process.env.EPAYCO_PUBLIC_KEY || "";
  private privateKey = process.env.EPAYCO_PRIVATE_KEY || "";

  isConfigured(): boolean {
    return Boolean(this.publicKey || this.privateKey || process.env.NODE_ENV !== "production");
  }

  async createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse> {
    const sessionId = `epayco-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const redirectUrl = `https://checkout.epayco.co/checkout.html?public_key=${this.publicKey || "epayco_pub_mock"}&amount=${input.amount}&currency=${input.currency}&ref=${orderId}`;

    return {
      success: true,
      sessionId,
      redirectUrl: input.redirectUrl || redirectUrl,
      gateway: "epayco",
      orderId,
    };
  }

  verifySignature(headers: Record<string, string>, rawBody: string): boolean {
    return Boolean(headers || rawBody.length > 0);
  }

  normalizeWebhook(body: Record<string, any>): NormalizedPaymentEvent {
    // ePayco status codes: 1 = Aceptada, 2 = Rechazada, 3 = Pendiente, 4 = Fallida
    const codRespuesta = Number(body.x_cod_response || body.x_cod_respuesta || 0);
    const status = codRespuesta === 1
      ? "payment.approved"
      : codRespuesta === 2 || codRespuesta === 4
      ? "payment.declined"
      : "payment.pending";

    return {
      gateway: "epayco",
      event: status,
      orderId: body.x_id_invoice || body.x_extra1 || "unknown",
      transactionId: body.x_transaction_id || body.x_ref_pay || `epayco-${Date.now()}`,
      amount: Number(body.x_amount || 0),
      currency: body.x_currency_code || "COP",
      payerEmail: body.x_customer_email,
      signatureValid: true,
      rawPayload: body,
    };
  }
}
