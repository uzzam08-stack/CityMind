"""
Natural-language query service for CityMind.

Provides a demo-mode NL→SQL→Answer pipeline that matches user questions
against curated demo responses, keyword-based generic responses, or a
plausible city-operations fallback.
"""

import random
import time
from typing import Any

DEMO_RESPONSES: dict[str, dict[str, Any]] = {
    "bins not collected yesterday in pimpri": {
        "answer": (
            "Yesterday, 23 out of 187 bins in Pimpri ward were not collected on schedule. "
            "This represents a 12.3% miss rate, up from the 7-day average of 9.1%. "
            "The main cluster of missed bins is in Sector 12-14, suggesting a truck availability issue in that zone."
        ),
        "sql": (
            "SELECT COUNT(*) as missed_bins, \n"
            "       COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pcmc_smart_city.bins WHERE ward = 'Pimpri') as miss_rate\n"
            "FROM pcmc_smart_city.bins \n"
            "WHERE ward = 'Pimpri' \n"
            "  AND last_collected < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)"
        ),
        "data": [
            {"ward": "Pimpri - Sector 12", "missed": 8},
            {"ward": "Pimpri - Sector 13", "missed": 7},
            {"ward": "Pimpri - Sector 14", "missed": 5},
            {"ward": "Pimpri - Other", "missed": 3},
        ],
        "chart_type": "bar",
    },
    "ward has the most grievances": {
        "answer": (
            "Nigdi ward leads with 47 open grievances this week, followed by Akurdi (38) and Chinchwad (34). "
            "Road maintenance complaints account for 61% of Nigdi's open tickets, with an average age of 4.2 days."
        ),
        "sql": (
            "SELECT ward, COUNT(*) as open_grievances\n"
            "FROM pcmc_smart_city.grievances\n"
            "WHERE status != 'Resolved'\n"
            "  AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)\n"
            "GROUP BY ward\n"
            "ORDER BY open_grievances DESC\n"
            "LIMIT 10"
        ),
        "data": [
            {"ward": "Nigdi", "count": 47},
            {"ward": "Akurdi", "count": 38},
            {"ward": "Chinchwad", "count": 34},
            {"ward": "Bhosari", "count": 29},
            {"ward": "Pimpri", "count": 27},
            {"ward": "Sangvi", "count": 24},
            {"ward": "Wakad", "count": 22},
            {"ward": "Thergaon", "count": 19},
        ],
        "chart_type": "bar",
    },
    "truck utilization": {
        "answer": (
            "Over the past 7 days, truck utilization across PCMC has averaged 73.2%. "
            "Of 47 trucks: 28 are currently Active (59.6%), 7 are En Route (14.9%), "
            "5 are Idle (10.6%), 4 are under Maintenance (8.5%), and 3 are Returning (6.4%). "
            "Peak utilization occurs between 6 AM and 11 AM."
        ),
        "sql": (
            "SELECT status, COUNT(*) as count, \n"
            "       ROUND(COUNT(*) * 100.0 / 47, 1) as percentage\n"
            "FROM pcmc_smart_city.trucks\n"
            "GROUP BY status\n"
            "ORDER BY count DESC"
        ),
        "data": [
            {"status": "Active", "count": 28, "percentage": 59.6},
            {"status": "En Route", "count": 7, "percentage": 14.9},
            {"status": "Idle", "count": 5, "percentage": 10.6},
            {"status": "Maintenance", "count": 4, "percentage": 8.5},
            {"status": "Returning", "count": 3, "percentage": 6.4},
        ],
        "chart_type": "pie",
    },
    "predicted waste volume": {
        "answer": (
            "Based on historical trends and seasonal patterns, the predicted total waste volume "
            "for next Monday is approximately 847 tonnes across all PCMC wards. This is 3.2% higher "
            "than last Monday (821 tonnes), likely due to the upcoming festival season. Nigdi and "
            "Pimpri wards are expected to generate the highest volumes at 62 and 58 tonnes respectively."
        ),
        "sql": (
            "SELECT DATE_TRUNC(collection_date, DAY) as date,\n"
            "       SUM(waste_tonnes) as total_tonnes\n"
            "FROM pcmc_smart_city.collections\n"
            "WHERE collection_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)\n"
            "GROUP BY date\n"
            "ORDER BY date"
        ),
        "data": [
            {"date": "Mon W-4", "tonnes": 798},
            {"date": "Mon W-3", "tonnes": 812},
            {"date": "Mon W-2", "tonnes": 805},
            {"date": "Mon W-1", "tonnes": 821},
            {"date": "Next Mon", "tonnes": 847},
        ],
        "chart_type": "line",
    },
}

# Keyword-based generic responses for broader coverage
GENERIC_RESPONSES: list[dict[str, Any]] = [
    {
        "keywords": ["fill", "level", "bin"],
        "answer": (
            "Currently, the average bin fill level across PCMC is 54.3%. "
            "{count} bins are above 80% capacity and require immediate attention. "
            "The highest concentration of full bins is in Nigdi and Bhosari wards."
        ),
        "chart_type": "bar",
    },
    {
        "keywords": ["collection", "rate", "efficiency"],
        "answer": (
            "The overall collection efficiency for PCMC this week is 91.7%, an improvement "
            "from last week's 89.3%. Wakad ward leads with 97.2% efficiency while Moshi ward "
            "needs improvement at 84.1%."
        ),
        "chart_type": "bar",
    },
    {
        "keywords": ["fuel", "cost", "expense"],
        "answer": (
            "Total fuel expenditure this month is ₹4,82,300 across the fleet of 47 trucks. "
            "AI-optimized routing has saved an estimated ₹67,400 (12.3%) compared to traditional "
            "routes. Average fuel cost per truck per day is ₹684."
        ),
        "chart_type": "line",
    },
    {
        "keywords": ["complaint", "grievance", "issue"],
        "answer": (
            "There are currently 840 open grievances across PCMC. The top categories are "
            "Roads (252), Water (210), and Sanitation (210). Average resolution time is "
            "3.4 days, with 127 grievances breaching SLA."
        ),
        "chart_type": "bar",
    },
    {
        "keywords": ["driver", "truck", "fleet"],
        "answer": (
            "The PCMC fleet consists of 47 waste collection trucks. Current fleet utilization "
            "is 74.5% with 35 trucks actively operating. Average daily distance per truck is "
            "34.2 km. 4 trucks are under scheduled maintenance."
        ),
        "chart_type": "bar",
    },
]


def process_nl_query(query: str) -> dict[str, Any]:
    """Process a natural language query and return a response."""
    start = time.time()
    query_lower = query.lower().strip()

    # Check exact demo responses
    for key, response in DEMO_RESPONSES.items():
        if key in query_lower:
            latency = round((time.time() - start) * 1000 + random.uniform(200, 800), 1)
            return {**response, "latency_ms": latency}

    # Check generic keyword responses
    for generic in GENERIC_RESPONSES:
        if any(kw in query_lower for kw in generic["keywords"]):
            latency = round((time.time() - start) * 1000 + random.uniform(300, 900), 1)
            return {
                "answer": generic["answer"].format(count=random.randint(150, 200)),
                "sql": (
                    f"-- AI-generated query for: {query}\n"
                    "SELECT * FROM pcmc_smart_city.bins\n"
                    "WHERE fill_level > 80\n"
                    "ORDER BY fill_level DESC"
                ),
                "data": [
                    {"category": f"Result {i + 1}", "value": random.randint(10, 100)}
                    for i in range(5)
                ],
                "chart_type": generic["chart_type"],
                "latency_ms": latency,
            }

    # Fallback: generate a plausible city operations answer
    latency = round((time.time() - start) * 1000 + random.uniform(400, 1200), 1)
    return {
        "answer": (
            f'Based on analysis of PCMC operational data, regarding your query "{query}": '
            "The system shows normal operational metrics across most wards. Current city-wide "
            "waste collection efficiency is at 91.7%, with 35 of 47 trucks actively operating. "
            "There are 89 open anomaly alerts requiring attention, primarily in Nigdi, Bhosari, "
            "and Chinchwad wards. I recommend checking the Analytics dashboard for detailed "
            "ward-wise breakdowns."
        ),
        "sql": (
            f"-- AI-generated query for: {query}\n"
            "SELECT ward, COUNT(*) as count,\n"
            "       AVG(fill_level) as avg_fill\n"
            "FROM pcmc_smart_city.bins\n"
            "GROUP BY ward\n"
            "ORDER BY avg_fill DESC"
        ),
        "data": [
            {"ward": "Nigdi", "value": random.randint(30, 60)},
            {"ward": "Bhosari", "value": random.randint(25, 50)},
            {"ward": "Chinchwad", "value": random.randint(20, 45)},
            {"ward": "Pimpri", "value": random.randint(20, 40)},
            {"ward": "Akurdi", "value": random.randint(15, 35)},
        ],
        "chart_type": "bar",
        "latency_ms": latency,
    }
