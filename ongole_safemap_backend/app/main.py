from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ping_database

from app.routers import (
    admin_auth,
    admin_reports,
    admin_incidents,
    admin_content,
    admin_analytics,
    admin_scraper,
    public,
    websocket,
    assistant,
)

app = FastAPI(
    title="Ongole SafeMap API",
    description="Backend for the Ongole tourist safety crime-mapping platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Ongole SafeMap API is running",
        "environment": settings.environment,
    }


@app.get("/health")
async def health_check():
    db_ok = await ping_database()

    return {
        "status": "ok" if db_ok else "degraded",
        "database_connected": db_ok,
    }


app.include_router(admin_auth.router)
app.include_router(admin_reports.router)
app.include_router(admin_incidents.router)
app.include_router(admin_content.router)
app.include_router(admin_analytics.router)
app.include_router(admin_scraper.router)
app.include_router(public.router)
app.include_router(websocket.router)
app.include_router(assistant.router)