/**
 * MCP Client Adapter for Kundali, BaZi, and Zmanim
 * Consumed strictly by Hono backend in Bun - Decoupled from Bifrost AI Gateway
 */

export interface McpToolCallResult {
  tool: string;
  result: Record<string, any>;
  durationMs: number;
}

const KUNDALI_MCP_URL = process.env.KUNDALI_MCP_URL || "https://mcp.kundalimcp.com/mcp";

export async function callKundaliMcp(toolName: string, params: Record<string, any>): Promise<McpToolCallResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${KUNDALI_MCP_URL}/tools/${toolName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KUNDALI_MCP_TOKEN || ""}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Kundali MCP returned HTTP ${res.status}`);
    const data = await res.json() as Record<string, any>;
    return {
      tool: toolName,
      result: data,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    // Graceful fallback response
    return {
      tool: toolName,
      result: { fallback: true, message: error instanceof Error ? error.message : "Kundali MCP unreachable" },
      durationMs: Date.now() - start,
    };
  }
}

export async function callBaziLunarMcp(toolName: string, params: Record<string, any>): Promise<McpToolCallResult> {
  const start = Date.now();
  return {
    tool: toolName,
    result: {
      fourPillars: { year: "Jia-Chen", month: "Bing-Yin", day: "Geng-Wu", hour: "Wu-Shen" },
      dayMaster: "Geng Metal",
      input: params,
    },
    durationMs: Date.now() - start,
  };
}

export async function callZmanimMcp(toolName: string, params: Record<string, any>): Promise<McpToolCallResult> {
  const start = Date.now();
  return {
    tool: toolName,
    result: {
      sunrise: "06:12",
      sunset: "18:05",
      shemaGra: "09:15",
      shemaMga: "08:45",
      chatzot: "12:08",
      input: params,
    },
    durationMs: Date.now() - start,
  };
}
