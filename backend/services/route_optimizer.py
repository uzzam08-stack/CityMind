"""
Route optimization service for CityMind.

Implements a nearest-neighbor TSP heuristic to optimize waste collection
routes across PCMC wards, comparing against random (current) routing.
"""

import math
import random
from typing import Optional


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance between two points on Earth (km)."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


def nearest_neighbor_tsp(points: list[tuple[float, float, str]]) -> tuple[list[int], float]:
    """Nearest-neighbor TSP heuristic. Points are list of (lat, lng, bin_id)."""
    if not points:
        return [], 0.0

    unvisited = list(range(len(points)))
    current = 0
    route = [current]
    unvisited.remove(current)
    total_dist = 0.0

    while unvisited:
        nearest = min(
            unvisited,
            key=lambda j: haversine(
                points[current][0], points[current][1],
                points[j][0], points[j][1],
            ),
        )
        total_dist += haversine(
            points[current][0], points[current][1],
            points[nearest][0], points[nearest][1],
        )
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    return route, total_dist


def optimize_routes(ward: str, bins: list[dict], trucks: list[dict]) -> dict:
    """Optimize collection routes for a ward."""
    ward_bins = [b for b in bins if b["ward"] == ward and b["fill_level"] > 50]
    if not ward_bins:
        ward_bins = [b for b in bins if b["ward"] == ward][:10]

    ward_trucks = [t for t in trucks if t["ward"] == ward]
    depot: dict = ward_trucks[0] if ward_trucks else {"lat": 18.6298, "lng": 73.7997}

    points: list[tuple[float, float, str]] = [
        (b["lat"], b["lng"], b["bin_id"]) for b in ward_bins
    ]

    # ── Current routes: random order ──────────────────────────────────────
    random.seed(hash(ward))
    current_order = list(range(len(points)))
    random.shuffle(current_order)
    current_dist = (
        sum(
            haversine(
                points[current_order[i]][0], points[current_order[i]][1],
                points[current_order[i + 1]][0], points[current_order[i + 1]][1],
            )
            for i in range(len(current_order) - 1)
        )
        if len(current_order) > 1
        else 0
    )
    # Add depot-to-first and last-to-depot legs
    if points:
        current_dist += haversine(
            depot["lat"], depot["lng"],
            points[current_order[0]][0], points[current_order[0]][1],
        )
        current_dist += haversine(
            points[current_order[-1]][0], points[current_order[-1]][1],
            depot["lat"], depot["lng"],
        )

    # ── Optimized routes: nearest-neighbor TSP ────────────────────────────
    optimized_order, optimized_dist = nearest_neighbor_tsp(points)
    if points:
        optimized_dist += haversine(
            depot["lat"], depot["lng"],
            points[optimized_order[0]][0], points[optimized_order[0]][1],
        )
        optimized_dist += haversine(
            points[optimized_order[-1]][0], points[optimized_order[-1]][1],
            depot["lat"], depot["lng"],
        )

    SPEED_KMH = 20
    COST_PER_KM = 12

    # Build route waypoint lists
    current_route: list[dict] = [{"lat": depot["lat"], "lng": depot["lng"], "bin_id": None}]
    current_route += [
        {"lat": points[i][0], "lng": points[i][1], "bin_id": points[i][2]}
        for i in current_order
    ]
    current_route.append({"lat": depot["lat"], "lng": depot["lng"], "bin_id": None})

    optimized_route: list[dict] = [{"lat": depot["lat"], "lng": depot["lng"], "bin_id": None}]
    optimized_route += [
        {"lat": points[i][0], "lng": points[i][1], "bin_id": points[i][2]}
        for i in optimized_order
    ]
    optimized_route.append({"lat": depot["lat"], "lng": depot["lng"], "bin_id": None})

    current_dist = round(current_dist, 2)
    optimized_dist = round(optimized_dist, 2)

    return {
        "current_routes": {
            "route": current_route,
            "total_distance_km": current_dist,
            "estimated_time_hours": round(current_dist / SPEED_KMH, 2),
            "fuel_cost": round(current_dist * COST_PER_KM, 0),
        },
        "optimized_routes": {
            "route": optimized_route,
            "total_distance_km": optimized_dist,
            "estimated_time_hours": round(optimized_dist / SPEED_KMH, 2),
            "fuel_cost": round(optimized_dist * COST_PER_KM, 0),
        },
        "savings": {
            "distance_saved_km": round(current_dist - optimized_dist, 2),
            "time_saved_hours": round((current_dist - optimized_dist) / SPEED_KMH, 2),
            "cost_saved": round((current_dist - optimized_dist) * COST_PER_KM, 0),
            "percentage_improvement": round(
                (1 - optimized_dist / max(current_dist, 0.01)) * 100, 1
            ),
        },
    }
