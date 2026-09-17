"""
Hermes-Agent Execution Tools
Sovereign Integration Mesh: Connects Hermes-Agent to the Hono/Bun AstroBranding Central Engine.
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

async def get_client_gold_feeds(client_id: str) -> dict:
    """Fetch the 17 XML Gold Feeds (<1.5 KB each) for a given client from PostgreSQL 18"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.get(f"{API_BASE}/api/v1/feeds/{client_id}")
            return res.json()
        except Exception as e:
            return {"error": str(e)}

async def trigger_universal_extraction(birth_data: dict, dry_run: bool = True) -> dict:
    """Trigger the 15-Shard Universal Extraction across all federated astrology engines"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.post(
                f"{API_BASE}/api/v1/extract?dryRun={'true' if dry_run else 'false'}",
                json=birth_data
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
