"""
Anomaly detection service for CityMind.

Identifies bins at risk of overflow that have not been collected recently,
producing actionable alerts for the PCMC operations dashboard.
"""

from datetime import datetime
from typing import Any


def detect_anomalies(bins: list[dict[str, Any]], alerts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Detect bins with fill_level > 85% and no recent collection.

    Bins that already have an open alert are excluded to avoid duplicates.
    A bin qualifies as anomalous when its fill level exceeds 85% AND it
    has not been collected within the last 4 hours.

    Returns a list of anomaly dicts with bin metadata, alert type, and severity.
    """
    existing_bin_ids: set[str] = {
        a["bin_id"] for a in alerts if a["status"] == "Open"
    }
    anomalies: list[dict[str, Any]] = []
    now = datetime.now()

    for b in bins:
        if b["fill_level"] > 85 and b["bin_id"] not in existing_bin_ids:
            last_collected = datetime.fromisoformat(b["last_collected"])
            hours_since = (now - last_collected).total_seconds() / 3600

            if hours_since > 4:  # Not collected in the last 4 hours
                fill = b["fill_level"]

                if fill > 95:
                    alert_type = "overflow_risk"
                    severity = "Critical"
                elif fill > 90:
                    alert_type = "overflow_risk"
                    severity = "Warning"
                else:
                    alert_type = "high_fill"
                    severity = "Info"

                anomalies.append({
                    "bin_id": b["bin_id"],
                    "ward": b["ward"],
                    "fill_level": fill,
                    "alert_type": alert_type,
                    "severity": severity,
                    "hours_since_collection": round(hours_since, 1),
                })

    return anomalies
