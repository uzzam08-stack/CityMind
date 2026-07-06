"""CityMind — Smart City Decision Intelligence Platform API."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from services.data_service import DataService
from routers import bins, trucks, alerts, grievances, kpis, analytics, routes, nl_query, benchmark, vision

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🏙️  CityMind API starting up...")
    DataService.initialize()
    print("✅ Seed data loaded successfully")
    demo_mode = os.getenv('DEMO_MODE', 'true').lower() == 'true'
    print(f"🔧 Demo Mode: {'ON' if demo_mode else 'OFF'}")
    yield
    # Shutdown
    print("👋 CityMind API shutting down")

app = FastAPI(
    title="CityMind API",
    description="AI-powered Smart City Decision Intelligence Platform for PCMC Pune",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS dynamically based on FRONTEND_URL
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000"
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers under /api prefix
app.include_router(bins.router, prefix="/api")
app.include_router(trucks.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(grievances.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(nl_query.router, prefix="/api")
app.include_router(benchmark.router, prefix="/api")
app.include_router(vision.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "CityMind API",
        "version": "1.0.0",
        "description": "Smart City Decision Intelligence Platform for PCMC Pune",
        "demo_mode": os.getenv('DEMO_MODE', 'true').lower() == 'true',
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
