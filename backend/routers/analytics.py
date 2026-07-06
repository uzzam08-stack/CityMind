from fastapi import APIRouter, Query
from services.data_service import DataService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("")
async def get_analytics(date_range: int = Query(7, description="Number of days")):
    return DataService.get_analytics(date_range=date_range)
