"""
In-memory data service singleton for CityMind.

Provides centralized access to all seeded data (bins, trucks, alerts, grievances)
along with computed KPIs and analytics for the PCMC Smart City platform.
"""

import random
from datetime import datetime, timedelta
from typing import Any, Optional


class DataService:
    """Singleton data service that holds all in-memory city data."""

    _instance: Optional["DataService"] = None
    _data: dict[str, Any] = {}

    def __new__(cls) -> "DataService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def initialize(cls) -> None:
        """Initialize the data service by loading seed data."""
        from data.seed import generate_all

        cls._data = generate_all()

    # ── Bins ──────────────────────────────────────────────────────────────

    @classmethod
    def get_bins(cls, ward: Optional[str] = None) -> list[dict[str, Any]]:
        """Return all bins, optionally filtered by ward."""
        bins: list[dict[str, Any]] = cls._data.get("bins", [])
        if ward:
            return [b for b in bins if b["ward"] == ward]
        return bins

    @classmethod
    def get_bin(cls, bin_id: str) -> Optional[dict[str, Any]]:
        """Return a single bin by ID, or None if not found."""
        for b in cls._data.get("bins", []):
            if b["bin_id"] == bin_id:
                return b
        return None

    # ── Trucks ────────────────────────────────────────────────────────────

    @classmethod
    def get_trucks(cls) -> list[dict[str, Any]]:
        """Return all trucks."""
        return cls._data.get("trucks", [])

    @classmethod
    def get_truck(cls, truck_id: str) -> Optional[dict[str, Any]]:
        """Return a single truck by ID, or None if not found."""
        for t in cls._data.get("trucks", []):
            if t["truck_id"] == truck_id:
                return t
        return None

    # ── Alerts ────────────────────────────────────────────────────────────

    @classmethod
    def get_alerts(
        cls,
        ward: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Return alerts with optional ward / severity / status filters."""
        alerts: list[dict[str, Any]] = cls._data.get("alerts", [])
        if ward:
            alerts = [a for a in alerts if a["ward"] == ward]
        if severity:
            alerts = [a for a in alerts if a["severity"] == severity]
        if status:
            alerts = [a for a in alerts if a["status"] == status]
        return alerts

    @classmethod
    def get_alert(cls, alert_id: str) -> Optional[dict[str, Any]]:
        """Return a single alert by ID, or None if not found."""
        for a in cls._data.get("alerts", []):
            if a["alert_id"] == alert_id:
                return a
        return None

    @classmethod
    def update_alert(cls, alert_id: str, updates: dict[str, Any]) -> Optional[dict[str, Any]]:
        """Update alert fields in place and return the updated alert."""
        alert = cls.get_alert(alert_id)
        if alert is None:
            return None
        for key, value in updates.items():
            alert[key] = value
        return alert

    # ── Grievances ────────────────────────────────────────────────────────

    @classmethod
    def get_grievances(
        cls,
        ward: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Return grievances with optional ward / category / status filters."""
        grievances: list[dict[str, Any]] = cls._data.get("grievances", [])
        if ward:
            grievances = [g for g in grievances if g["ward"] == ward]
        if category:
            grievances = [g for g in grievances if g["category"] == category]
        if status:
            grievances = [g for g in grievances if g["status"] == status]
        return grievances

    # ── KPIs ──────────────────────────────────────────────────────────────

    @classmethod
    def get_kpis(cls) -> dict[str, Any]:
        """Compute and return a KPISummary dictionary."""
        bins = cls._data.get("bins", [])
        trucks = cls._data.get("trucks", [])
        grievances = cls._data.get("grievances", [])

        now = datetime.now()

        total_bins = len(bins)
        bins_requiring_collection = sum(1 for b in bins if b["fill_level"] > 80)
        active_trucks = sum(1 for t in trucks if t["status"] in ("Active", "En Route"))
        open_grievances = sum(1 for g in grievances if g["status"] != "Resolved")

        sla_breaches = 0
        for g in grievances:
            if g["status"] == "Open":
                created_at = datetime.fromisoformat(g["created_at"]) if isinstance(g["created_at"], str) else g["created_at"]
                sla_hours = g.get("sla_hours", 48)
                if (now - created_at).total_seconds() > sla_hours * 3600:
                    sla_breaches += 1

        return {
            "total_bins": total_bins,
            "bins_requiring_collection": bins_requiring_collection,
            "active_trucks": active_trucks,
            "open_grievances": open_grievances,
            "sla_breaches": sla_breaches,
        }

    # ── Analytics ─────────────────────────────────────────────────────────

    @classmethod
    def get_analytics(cls, date_range: int = 7) -> dict[str, Any]:
        """Return an AnalyticsData dictionary with aggregated insights."""
        bins = cls._data.get("bins", [])
        trucks = cls._data.get("trucks", [])
        grievances = cls._data.get("grievances", [])

        # Unique wards
        wards = sorted({b["ward"] for b in bins})

        # ── Daily waste: synthetic tonnes per ward over date_range days ──
        daily_waste: list[dict[str, Any]] = []
        random.seed(42)
        for day_offset in range(date_range):
            date = (datetime.now() - timedelta(days=date_range - 1 - day_offset)).strftime("%Y-%m-%d")
            for ward in wards:
                base_tonnes = random.uniform(35.0, 75.0)
                # Add slight daily variation
                tonnes = round(base_tonnes + random.uniform(-8.0, 8.0), 1)
                daily_waste.append({"date": date, "ward": ward, "tonnes": tonnes})

        # ── Grievance categories ─────────────────────────────────────────
        category_counts: dict[str, int] = {}
        for g in grievances:
            cat = g.get("category", "Other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        grievance_categories = [{"category": cat, "count": cnt} for cat, cnt in sorted(category_counts.items(), key=lambda x: -x[1])]

        # ── Truck utilization ────────────────────────────────────────────
        status_counts: dict[str, int] = {}
        for t in trucks:
            st = t.get("status", "Unknown")
            status_counts[st] = status_counts.get(st, 0) + 1
        truck_utilization = [{"status": st, "count": cnt} for st, cnt in sorted(status_counts.items(), key=lambda x: -x[1])]

        # ── Ward performance ─────────────────────────────────────────────
        random.seed(99)
        ward_performance: list[dict[str, Any]] = []
        for ward in wards:
            ward_bins = [b for b in bins if b["ward"] == ward]
            ward_grievances = [g for g in grievances if g["ward"] == ward]
            open_g = sum(1 for g in ward_grievances if g["status"] != "Resolved")

            bins_count = len(ward_bins)
            avg_fill = round(sum(b["fill_level"] for b in ward_bins) / max(bins_count, 1), 1)
            collection_rate = round(random.uniform(75.0, 98.0), 1)

            # Score: higher collection rate → higher score, more grievances → lower score
            grievance_penalty = min(open_g * 2, 30)  # cap penalty at 30
            score = round(max(0, min(100, collection_rate - grievance_penalty + random.uniform(-5, 5))), 1)

            ward_performance.append({
                "ward": ward,
                "bins_count": bins_count,
                "avg_fill_percent": avg_fill,
                "collection_rate": collection_rate,
                "open_grievances": open_g,
                "score": score,
            })

        return {
            "daily_waste": daily_waste,
            "grievance_categories": grievance_categories,
            "truck_utilization": truck_utilization,
            "ward_performance": ward_performance,
        }
