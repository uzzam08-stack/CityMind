"""
CityMind — Synthetic Seed Data Generator for PCMC Smart City.

Generates realistic data for 29 PCMC wards including bins, trucks,
grievances, alerts, and bin readings.
"""

from __future__ import annotations

import json
import math
import os
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# ── Constants ──────────────────────────────────────────────────────────────

RANDOM_SEED = 42
PCMC_CENTER_LAT = 18.6298
PCMC_CENTER_LNG = 73.7997

WARDS = [
    "Pimpri", "Chinchwad", "Nigdi", "Akurdi", "Bhosari",
    "Sangvi", "Thergaon", "Wakad", "Hinjewadi", "Pimple Saudagar",
    "Pimple Nilakh", "Pimple Gurav", "Ravet", "Talawade", "Moshi",
    "Charholi", "Chikhli", "Kudalwadi", "Kasarwadi", "Dapodi",
    "Kiwale", "Punawale", "Tathawade", "Mamurdi", "Dudulgaon",
    "Rupeenagar", "Sector 12", "Sector 15", "Sector 22",
]

# Realistic ward center offsets from PCMC center (lat_offset, lng_offset)
WARD_OFFSETS: dict[str, tuple[float, float]] = {
    "Pimpri":          (0.0000,  0.0000),
    "Chinchwad":       (-0.0150, -0.0200),
    "Nigdi":           (0.0250,  0.0050),
    "Akurdi":          (0.0180,  -0.0100),
    "Bhosari":         (0.0350,  0.0150),
    "Sangvi":          (-0.0050, 0.0250),
    "Thergaon":        (-0.0200, 0.0350),
    "Wakad":           (-0.0350, 0.0450),
    "Hinjewadi":       (-0.0550, 0.0600),
    "Pimple Saudagar": (-0.0250, 0.0300),
    "Pimple Nilakh":   (-0.0180, 0.0200),
    "Pimple Gurav":    (-0.0100, 0.0150),
    "Ravet":           (-0.0400, 0.0200),
    "Talawade":        (-0.0300, 0.0100),
    "Moshi":           (0.0500,  0.0050),
    "Charholi":        (0.0600,  0.0100),
    "Chikhli":         (0.0450,  -0.0050),
    "Kudalwadi":       (0.0100,  -0.0150),
    "Kasarwadi":       (0.0050,  -0.0200),
    "Dapodi":          (-0.0050, -0.0300),
    "Kiwale":          (-0.0500, 0.0500),
    "Punawale":        (-0.0450, 0.0350),
    "Tathawade":       (-0.0380, 0.0300),
    "Mamurdi":         (-0.0480, 0.0150),
    "Dudulgaon":       (-0.0550, 0.0100),
    "Rupeenagar":      (0.0150,  -0.0250),
    "Sector 12":       (0.0080,  0.0050),
    "Sector 15":       (0.0120,  0.0080),
    "Sector 22":       (0.0200,  0.0120),
}

ZONES = ["North", "South", "East", "West", "Central"]

TRUCK_STATUSES = ["Active", "En Route", "Idle", "Maintenance", "Returning"]
TRUCK_STATUS_WEIGHTS = [0.60, 0.15, 0.10, 0.10, 0.05]

GRIEVANCE_CATEGORIES = ["Roads", "Water", "Sanitation", "Noise", "Other"]
GRIEVANCE_CATEGORY_WEIGHTS = [0.30, 0.25, 0.25, 0.10, 0.10]

GRIEVANCE_STATUSES = ["Open", "In Progress", "Resolved"]
GRIEVANCE_STATUS_WEIGHTS = [0.35, 0.25, 0.40]

PRIORITIES = ["High", "Medium", "Low"]
PRIORITY_WEIGHTS = [0.20, 0.50, 0.30]
SLA_MAP = {"High": 24, "Medium": 48, "Low": 72}

ALERT_SEVERITIES = ["Critical", "Warning", "Info"]
ALERT_SEVERITY_WEIGHTS = [0.20, 0.50, 0.30]

FIRST_NAMES = [
    "Rajesh", "Sunil", "Manoj", "Amit", "Sachin", "Rahul", "Vijay",
    "Suresh", "Deepak", "Anil", "Pramod", "Sanjay", "Ashok", "Ravi",
    "Ganesh", "Nilesh", "Yogesh", "Mahesh", "Prakash", "Dinesh",
    "Pradeep", "Ramesh", "Santosh", "Vikas", "Ajay", "Tushar",
    "Rohan", "Nitin", "Vishal", "Sandip", "Kiran", "Atul",
    "Mangesh", "Shekhar", "Bhushan", "Omkar", "Vaibhav", "Akash",
    "Swapnil", "Vivek", "Hemant", "Paresh", "Jayant", "Milind",
    "Dhananjay", "Balaji", "Kedar", "Amol",
]

LAST_NAMES = [
    "Patil", "Jadhav", "Deshmukh", "Kulkarni", "Joshi",
    "Pawar", "More", "Shinde", "Gaikwad", "Bhosale",
    "Salunkhe", "Mane", "Kale", "Chavan", "Sonawane",
    "Nikam", "Thorat", "Wagh", "Deshpande", "Khare",
    "Kamble", "Suryawanshi", "Bhor", "Gholap", "Lokhande",
]

GRIEVANCE_DESCRIPTIONS = {
    "Roads": [
        "Pothole on main road causing traffic issues",
        "Road surface deteriorated near market area",
        "Missing road signage at intersection",
        "Speed breaker too high, damaging vehicles",
        "Road divider broken near school zone",
        "Waterlogging on road after rain",
        "Footpath tiles broken and dangerous",
        "Street light not working on main road",
    ],
    "Water": [
        "Low water pressure in residential area",
        "Water supply disruption for 3 days",
        "Leaking water pipeline on street",
        "Contaminated water supply reported",
        "Water meter showing incorrect readings",
        "No water supply in morning hours",
        "Sewage mixing with water supply",
        "Water tanker not arriving on schedule",
    ],
    "Sanitation": [
        "Garbage not collected for 3 days",
        "Overflowing garbage bin near park",
        "Open drain causing health hazard",
        "Stray animals spreading garbage",
        "Construction debris dumped on street",
        "Public toilet not maintained",
        "Drain blockage causing flooding",
        "Mosquito breeding in stagnant water",
    ],
    "Noise": [
        "Construction noise during night hours",
        "Loudspeaker exceeding permitted decibels",
        "Industrial noise affecting residents",
        "Traffic noise from highway nearby",
    ],
    "Other": [
        "Illegal encroachment on footpath",
        "Unauthorized construction in residential zone",
        "Tree fallen blocking road",
        "Stray dog menace in locality",
        "Unauthorized banner/hoarding on road",
        "Electric pole leaning dangerously",
    ],
}


# ── Generator Functions ───────────────────────────────────────────────────

def _ward_center(ward: str) -> tuple[float, float]:
    offset = WARD_OFFSETS.get(ward, (0.0, 0.0))
    return PCMC_CENTER_LAT + offset[0], PCMC_CENTER_LNG + offset[1]


def _jitter(center: float, spread: float = 0.008) -> float:
    return center + random.gauss(0, spread)


def _random_timestamp(start: datetime, end: datetime) -> str:
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return (start + timedelta(seconds=random_seconds)).isoformat()


def generate_bins(n: int = 1247) -> list[dict]:
    """Generate n bins distributed across PCMC wards."""
    bins_per_ward_base = n // len(WARDS)
    remainder = n % len(WARDS)
    bins = []
    bin_idx = 1

    now = datetime.now()
    six_months_ago = now - timedelta(days=180)

    for i, ward in enumerate(WARDS):
        count = bins_per_ward_base + (1 if i < remainder else 0)
        center_lat, center_lng = _ward_center(ward)
        zone = ZONES[i % len(ZONES)]

        for _ in range(count):
            # Fill level distribution: 60% low, 25% medium, 15% high
            r = random.random()
            if r < 0.60:
                fill = random.uniform(20, 60)
            elif r < 0.85:
                fill = random.uniform(60, 85)
            else:
                fill = random.uniform(85, 100)

            last_collected = _random_timestamp(now - timedelta(hours=random.randint(1, 48)), now)
            installed = _random_timestamp(six_months_ago, now - timedelta(days=30))

            bins.append({
                "bin_id": f"PCM-{bin_idx:04d}",
                "ward": ward,
                "lat": round(_jitter(center_lat), 6),
                "lng": round(_jitter(center_lng), 6),
                "fill_level": round(fill, 1),
                "capacity_litres": random.choice([240, 360, 660, 1100]),
                "last_collected": last_collected,
                "installed_date": installed[:10],
                "zone": zone,
            })
            bin_idx += 1

    return bins


def generate_trucks(n: int = 47) -> list[dict]:
    """Generate n trucks distributed across wards."""
    trucks = []
    now = datetime.now()

    for i in range(n):
        ward = WARDS[i % len(WARDS)]
        center_lat, center_lng = _ward_center(ward)
        status = random.choices(TRUCK_STATUSES, weights=TRUCK_STATUS_WEIGHTS, k=1)[0]
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)

        trucks.append({
            "truck_id": f"TK-{i + 1:03d}",
            "ward": ward,
            "driver_name": f"{first} {last}",
            "lat": round(_jitter(center_lat, 0.012), 6),
            "lng": round(_jitter(center_lng, 0.012), 6),
            "status": status,
            "capacity_tonnes": random.choice([3.0, 5.0, 7.0, 10.0]),
            "current_load_pct": round(random.uniform(0, 85) if status in ("Active", "En Route") else 0, 1),
            "last_updated": _random_timestamp(now - timedelta(minutes=30), now),
        })

    return trucks


def generate_grievances(n: int = 2400) -> list[dict]:
    """Generate n grievances spread over the past 90 days."""
    grievances = []
    now = datetime.now()
    ninety_days_ago = now - timedelta(days=90)

    for i in range(n):
        ward = random.choice(WARDS)
        category = random.choices(GRIEVANCE_CATEGORIES, weights=GRIEVANCE_CATEGORY_WEIGHTS, k=1)[0]
        status = random.choices(GRIEVANCE_STATUSES, weights=GRIEVANCE_STATUS_WEIGHTS, k=1)[0]
        priority = random.choices(PRIORITIES, weights=PRIORITY_WEIGHTS, k=1)[0]
        created_at = _random_timestamp(ninety_days_ago, now)
        description = random.choice(GRIEVANCE_DESCRIPTIONS[category])

        resolved_at = None
        if status == "Resolved":
            created_dt = datetime.fromisoformat(created_at)
            resolved_at = _random_timestamp(
                created_dt + timedelta(hours=2),
                min(created_dt + timedelta(hours=SLA_MAP[priority] * 2), now),
            )

        grievances.append({
            "grievance_id": f"GRV-{i + 1:05d}",
            "ward": ward,
            "category": category,
            "description": description,
            "status": status,
            "priority": priority,
            "created_at": created_at,
            "resolved_at": resolved_at,
            "sla_hours": SLA_MAP[priority],
        })

    return grievances


def generate_alerts(bins: list[dict], n: int = 89) -> list[dict]:
    """Generate n open alerts based on high-fill bins."""
    high_fill_bins = [b for b in bins if b["fill_level"] > 80]
    if len(high_fill_bins) < n:
        high_fill_bins = high_fill_bins + random.choices(bins, k=n - len(high_fill_bins))

    selected_bins = random.sample(high_fill_bins, min(n, len(high_fill_bins)))
    alerts = []
    now = datetime.now()

    for i, b in enumerate(selected_bins):
        severity = random.choices(ALERT_SEVERITIES, weights=ALERT_SEVERITY_WEIGHTS, k=1)[0]
        detected_at = _random_timestamp(now - timedelta(hours=random.randint(1, 12)), now)

        alerts.append({
            "alert_id": f"ALT-{i + 1:04d}",
            "bin_id": b["bin_id"],
            "ward": b["ward"],
            "fill_level": b["fill_level"],
            "alert_type": "overflow_risk" if b["fill_level"] > 90 else "high_fill",
            "severity": severity,
            "detected_at": detected_at,
            "status": "Open",
            "dispatched_truck_id": None,
            "resolved_at": None,
        })

    return alerts


def generate_bin_readings(bins: list[dict], hours: int = 24) -> list[dict]:
    """Generate hourly readings for every bin for the past `hours` hours."""
    readings = []
    now = datetime.now()
    reading_idx = 1

    for b in bins:
        base_fill = max(5, b["fill_level"] - random.uniform(15, 40))
        fill_increment = (b["fill_level"] - base_fill) / max(hours, 1)

        for h in range(hours, 0, -1):
            ts = now - timedelta(hours=h)
            current_fill = min(100, base_fill + fill_increment * (hours - h) + random.gauss(0, 2))
            current_fill = max(0, round(current_fill, 1))

            readings.append({
                "reading_id": f"RD-{reading_idx:07d}",
                "bin_id": b["bin_id"],
                "fill_level": current_fill,
                "timestamp": ts.isoformat(),
                "temperature_c": round(random.gauss(32, 4), 1),
                "battery_pct": round(random.uniform(20, 100), 1),
            })
            reading_idx += 1

    return readings


def generate_all() -> dict[str, list[dict]]:
    """Generate all seed data and return as a dictionary."""
    random.seed(RANDOM_SEED)

    bins = generate_bins(1247)
    trucks = generate_trucks(47)
    grievances = generate_grievances(2400)
    alerts = generate_alerts(bins, 89)
    # For demo, generate readings only for the last 24 hours to keep manageable
    bin_readings = generate_bin_readings(bins, hours=24)

    return {
        "bins": bins,
        "trucks": trucks,
        "grievances": grievances,
        "alerts": alerts,
        "bin_readings": bin_readings,
    }


# ── CLI Entry Point ───────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🏙️  CityMind — Generating PCMC seed data...")
    data = generate_all()

    output_dir = Path(__file__).parent
    for name, records in data.items():
        filepath = output_dir / f"{name}.json"
        with open(filepath, "w") as f:
            json.dump(records, f, indent=2, default=str)
        print(f"  ✅ {name}: {len(records):,} records → {filepath.name}")

    print(f"\n📊 Summary:")
    print(f"   Bins:         {len(data['bins']):,}")
    print(f"   Trucks:       {len(data['trucks']):,}")
    print(f"   Grievances:   {len(data['grievances']):,}")
    print(f"   Alerts:       {len(data['alerts']):,}")
    print(f"   Bin Readings: {len(data['bin_readings']):,}")
    print(f"\n✨ Done! Seed data generated successfully.")
