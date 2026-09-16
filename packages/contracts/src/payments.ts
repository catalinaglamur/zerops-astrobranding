import { z } from "zod";

export const PaymentGatewayIdSchema = z.enum(["dlocalgo", "wompi", "epayco", "stripe", "mercadopago"]);
export type PaymentGatewayId = z.infer<typeof PaymentGatewayIdSchema>;

export const ActiveGatewayInfoSchema = z.object({
  id: PaymentGatewayIdSchema,
  name: z.string(),
  currencies: z.array(z.string()),
  supportedMethods: z.array(z.string()),
  isDefault: z.boolean().default(false),
});

export type ActiveGatewayInfo = z.infer<typeof ActiveGatewayInfoSchema>;

export const ActiveGatewaysResponseSchema = z.object({
  gateways: z.array(ActiveGatewayInfoSchema),
  defaultGateway: PaymentGatewayIdSchema.optional(),
});

export type ActiveGatewaysResponse = z.infer<typeof ActiveGatewaysResponseSchema>;

export const CreatePaymentSessionSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  gateway: PaymentGatewayIdSchema,
  tier: z.enum(["basic_report", "order_bump_d10", "upsell_bazi_tikkun", "downsell_1on1"]).default("basic_report"),
  redirectUrl: z.string().url().optional(),
});

export type CreatePaymentSessionInput = z.infer<typeof CreatePaymentSessionSchema>;

export const PaymentSessionResponseSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  redirectUrl: z.string().url(),
  gateway: PaymentGatewayIdSchema,
  orderId: z.string().uuid(),
});

export type PaymentSessionResponse = z.infer<typeof PaymentSessionResponseSchema>;

export const NormalizedPaymentEventSchema = z.object({
  gateway: PaymentGatewayIdSchema,
  event: z.enum(["payment.approved", "payment.declined", "payment.pending"]),
  orderId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  currency: z.string(),
  payerEmail: z.string().email().optional(),
  signatureValid: z.boolean(),
  rawPayload: z.record(z.string(), z.any()),
});

export type NormalizedPaymentEvent = z.infer<typeof NormalizedPaymentEventSchema>;
