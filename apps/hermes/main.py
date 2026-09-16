import os
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Nous Research Hermes-Agent Gateway", version="2.0.0")

@app.get("/health")
@app.get("/healthz")
def health():
    return {
        "status": "ok",
        "service": "hermes-agent",
        "model_endpoint": os.getenv("HERMES_MODEL_ENDPOINT", "http://bifrost:8080/v1"),
        "nats_url": os.getenv("ZCP_NATS_URL", "nats://nats:4222"),
    }

@app.get("/")
def root():
    return {
        "name": "Nous Research Hermes-Agent Sovereign Orchestrator",
        "status": "active",
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
