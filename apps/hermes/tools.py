"""
Hermes-Agent Execution Tools
"""
import os
import httpx

API_BASE = os.getenv("API_BASE_URL", "http://astrobranding:3000")

async def get_system_health() -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            res = await client.get(f"{API_BASE}/health")
            return res.json()
        except Exception as e:
            return {"error": str(e)}

async def calculate_natal_chart(client_id: str, ayanamsha: str = "tropical") -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.post(
                f"{API_BASE}/api/astrology/chart",
                json={"clientId": client_id, "ayanamsha": ayanamsha, "houseSystem": "placidus"}
            )
            return res.json()
        except Exception as e:
            return {"error": str(e)}

async def send_whatsapp_otp(phone: str, client_name: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.post(
                f"{API_BASE}/api/whatsapp/otp",
                json={"phoneNumber": phone, "clientName": client_name, "template": "otp_verification"}
            )
            return res.json()
        except Exception as e:
            return {"error": str(e)}
