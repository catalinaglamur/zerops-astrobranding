import type { ChatCompletionRequest, ChatCompletionResponse } from "@astrobranding/contracts";

export class BifrostClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl = process.env.BIFROST_GATEWAY_URL || "http://bifrost:8080/v1", apiKey = process.env.BIFROST_VIRTUAL_KEY || "vk-production-main") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/v1$/, "")}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async createChatCompletion(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`Bifrost AI Gateway error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as ChatCompletionResponse;
  }
}

export const bifrost = new BifrostClient();
