from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
import random
from services.data_service import DataService

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("")
async def list_alerts(
    ward: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    return DataService.get_alerts(ward=ward, severity=severity, status=status)

@router.post("/{alert_id}/dispatch")
async def dispatch_alert(alert_id: str):
    alert = DataService.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    
    trucks = DataService.get_trucks()
    available = [t for t in trucks if t['status'] in ('Active', 'Idle', 'Returning')]
    truck = random.choice(available) if available else trucks[0]
    
    now = datetime.now()
    steps = [
        {'step': f'Detected anomaly at bin {alert["bin_id"]} — fill level {alert["fill_level"]}%', 'timestamp': now.isoformat(), 'status': 'completed'},
        {'step': f'Finding nearest available truck in {alert["ward"]} ward...', 'timestamp': (now + timedelta(seconds=2)).isoformat(), 'status': 'completed'},
        {'step': 'Calculating optimal route via AI engine...', 'timestamp': (now + timedelta(seconds=4)).isoformat(), 'status': 'completed'},
        {'step': f'Dispatching truck {truck["truck_id"]} (Driver: {truck["driver_name"]})', 'timestamp': (now + timedelta(seconds=6)).isoformat(), 'status': 'completed'},
        {'step': f'Notification sent to driver {truck["driver_name"]}', 'timestamp': (now + timedelta(seconds=7)).isoformat(), 'status': 'completed'},
    ]
    
    DataService.update_alert(alert_id, {
        'status': 'Resolved',
        'dispatched_truck_id': truck['truck_id'],
        'resolved_at': now.isoformat(),
    })
    
    return {
        'steps': steps,
        'truck_id': truck['truck_id'],
        'estimated_arrival': (now + timedelta(minutes=random.randint(8, 25))).isoformat(),
        'status': 'dispatched',
    }
