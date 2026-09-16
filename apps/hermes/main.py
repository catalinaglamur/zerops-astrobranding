import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .agent import HermesAgent
from .tools import get_system_health, calculate_natal_chart, send_whatsapp_otp

app = FastAPI(title="Nous Research Hermes-Agent Gateway", version="2.0.0")
agent = HermesAgent()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str

@app.get("/health")
@app.get("/healthz")
def health():
    return {
        "status": "ok",
        "service": "hermes-agent",
        "model_endpoint": os.getenv("HERMES_MODEL_ENDPOINT", "http://bifrost:8080/v1"),
        "nats_url": os.getenv("ZCP_NATS_URL", "nats://nats:4222"),
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        reply = await agent.run_turn(req.message)
        return ChatResponse(response=reply, status="success")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system-status")
async def system_status():
    return await get_system_health()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
