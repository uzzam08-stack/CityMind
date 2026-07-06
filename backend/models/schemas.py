"""Pydantic models for CityMind API."""

from __future__ import annotations

from datetime import datetime, date
from typing import Optional, Any

from pydantic import BaseModel, Field


# ── Entity Models ──────────────────────────────────────────────────────────

class Bin(BaseModel):
    bin_id: str
    ward: str
    lat: float
    lng: float
    fill_level: float = Field(ge=0, le=100)
    capacity_litres: int
    last_collected: str
    installed_date: str
    zone: str


class BinReading(BaseModel):
    reading_id: str
    bin_id: str
    fill_level: float
    timestamp: str
    temperature_c: float
    battery_pct: float


class Truck(BaseModel):
    truck_id: str
    ward: str
    driver_name: str
    lat: float
    lng: float
    status: str
    capacity_tonnes: float
    current_load_pct: float
    last_updated: str


class Grievance(BaseModel):
    grievance_id: str
    ward: str
    category: str
    description: str
    status: str
    priority: str
    created_at: str
    resolved_at: Optional[str] = None
    sla_hours: int


class Alert(BaseModel):
    alert_id: str
    bin_id: str
    ward: str
    fill_level: float
    alert_type: str
    severity: str
    detected_at: str
    status: str
    dispatched_truck_id: Optional[str] = None
    resolved_at: Optional[str] = None


# ── KPI / Summary Models ──────────────────────────────────────────────────

class KPISummary(BaseModel):
    total_bins: int
    bins_requiring_collection: int
    active_trucks: int
    open_grievances: int
    sla_breaches: int


# ── Request / Response Models ─────────────────────────────────────────────

class NLQueryRequest(BaseModel):
    query: str


class NLQueryResponse(BaseModel):
    answer: str
    sql: str
    data: list[dict[str, Any]]
    chart_type: str
    latency_ms: float


class RouteOptimizationRequest(BaseModel):
    ward_id: str


class RoutePoint(BaseModel):
    lat: float
    lng: float
    bin_id: Optional[str] = None


class RouteData(BaseModel):
    route: list[RoutePoint]
    total_distance_km: float
    estimated_time_hours: float
    fuel_cost: float


class RouteOptimizationResponse(BaseModel):
    current_routes: RouteData
    optimized_routes: RouteData
    savings: dict[str, float]


class BenchmarkResponse(BaseModel):
    pandas_ms: float
    rapids_ms: float
    speedup: float
    operation: str
    row_count: int
    note: str


class DispatchStep(BaseModel):
    step: str
    timestamp: str
    status: str


class DispatchResponse(BaseModel):
    steps: list[DispatchStep]
    truck_id: str
    estimated_arrival: str
    status: str


class WardPerformance(BaseModel):
    ward: str
    bins: int
    avg_fill_pct: float
    collection_rate: float
    open_grievances: int
    score: float


class AnalyticsData(BaseModel):
    daily_waste: list[dict[str, Any]]
    grievance_categories: list[dict[str, Any]]
    truck_utilization: list[dict[str, Any]]
    ward_performance: list[dict[str, Any]]
