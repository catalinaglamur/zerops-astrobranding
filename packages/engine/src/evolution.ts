import type { WhatsAppSendOtpInput } from "@astrobranding/contracts";

export class EvolutionWhatsAppClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl = process.env.EVOLUTION_GATEWAY_URL || "http://evolution:8085", apiKey = process.env.EVOLUTION_API_KEY || "astrobranding-secret") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/server/ok`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async sendOtp(input: WhatsAppSendOtpInput): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/message/sendText/astrobranding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: input.phoneNumber,
          text: `Hola ${input.clientName || "Emprendedor"}, tu código de verificación para tu Dossier AstroBranding es: ${Math.floor(100000 + Math.random() * 900000)}`,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return { success: false, error: `Status ${res.status}` };
      }

      const data = (await res.json()) as { key?: { id?: string } };
      return { success: true, messageId: data?.key?.id };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}

export const evolution = new EvolutionWhatsAppClient();
