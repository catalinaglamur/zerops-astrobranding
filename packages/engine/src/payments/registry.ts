import type { PaymentGatewayDriver } from "./types";
import { DLocalGoDriver } from "./dlocalgo";
import { WompiDriver } from "./wompi";
import { EPaycoDriver } from "./epayco";
import { StripeDriver } from "./stripe";
import { MercadoPagoDriver } from "./mercadopago";
import type {
  PaymentGatewayId,
  ActiveGatewayInfo,
  ActiveGatewaysResponse,
  CreatePaymentSessionInput,
  PaymentSessionResponse,
  NormalizedPaymentEvent,
} from "@astrobranding/contracts";

export class PaymentGatewayRegistry {
  private drivers: Map<PaymentGatewayId, PaymentGatewayDriver> = new Map();

  constructor() {
    this.register(new DLocalGoDriver());
    this.register(new WompiDriver());
    this.register(new EPaycoDriver());
    this.register(new StripeDriver());
    this.register(new MercadoPagoDriver());
  }

  register(driver: PaymentGatewayDriver): void {
    this.drivers.set(driver.id, driver);
  }

  getDriver(id: PaymentGatewayId): PaymentGatewayDriver | undefined {
    return this.drivers.get(id);
  }

  /**
   * Returns list of configured/active gateways based on environment variables
   */
  getActiveGateways(): ActiveGatewaysResponse {
    const active: ActiveGatewayInfo[] = [];

    for (const [id, driver] of this.drivers.entries()) {
      if (driver.isConfigured()) {
        active.push({
          id,
          name: driver.name,
          currencies: driver.supportedCurrencies,
          supportedMethods: driver.supportedMethods,
          isDefault: id === "dlocalgo",
        });
      }
    }

    return {
      gateways: active,
      defaultGateway: active[0]?.id || "dlocalgo",
    };
  }

  async createSession(input: CreatePaymentSessionInput, orderId: string): Promise<PaymentSessionResponse> {
    const driver = this.getDriver(input.gateway);
    if (!driver) {
      throw new Error(`Payment gateway '${input.gateway}' is not supported`);
    }
    return driver.createSession(input, orderId);
  }

  verifyAndNormalizeWebhook(
    gatewayId: PaymentGatewayId,
    headers: Record<string, string>,
    body: Record<string, any>,
    rawBody: string
  ): NormalizedPaymentEvent {
    const driver = this.getDriver(gatewayId);
    if (!driver) {
      throw new Error(`Unknown gateway '${gatewayId}' in webhook processing`);
    }

    const isValid = driver.verifySignature(headers, rawBody);
    const event = driver.normalizeWebhook(body, headers);
    event.signatureValid = isValid;

    return event;
  }
}

export const paymentRegistry = new PaymentGatewayRegistry();
