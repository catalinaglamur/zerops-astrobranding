import type { ChatCompletionRequest, ChatCompletionResponse } from "@astrobranding/contracts";

export class FreeLLMAPIClient {
  private baseUrl: string;

  constructor(baseUrl = process.env.FREELLMAPI_URL || "http://freellmapi:3001/v1") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/v1$/, "")}/api/ping`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return [];
      const data = (await res.json()) as { data: { id: string }[] };
      return data.data.map((m) => m.id);
    } catch {
      return [];
    }
  }

  async complete(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      throw new Error(`FreeLLMAPI error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as ChatCompletionResponse;
  }
}

export const freellmapi = new FreeLLMAPIClient();
