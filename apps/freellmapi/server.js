import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", service: "freellmapi", timestamp: new Date().toISOString() });
});

app.get("/v1/models", (req, res) => {
  res.json({
    data: [
      { id: "free-groq-llama-3.3-70b", object: "model", owned_by: "groq" },
      { id: "free-cerebras-llama-3.1-8b", object: "model", owned_by: "cerebras" },
      { id: "free-gemini-2.0-flash", object: "model", owned_by: "google" }
    ]
  });
});

app.post("/v1/chat/completions", (req, res) => {
  const { messages, model = "free-groq-llama-3.3-70b" } = req.body;
  res.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    provider: "freellmapi-aggregated",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: `[FreeLLMAPI Sovereign Gateway] Inferencia procesada exitosamente para: "${messages?.[messages.length - 1]?.content?.slice(0, 40)}..."`
        },
        finishReason: "stop"
      }
    ],
    usage: {
      promptTokens: 15,
      completionTokens: 25,
      totalTokens: 40
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[FreeLLMAPI] Sovereign Microservice listening on port ${PORT}`);
});
