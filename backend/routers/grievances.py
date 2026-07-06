from fastapi import APIRouter, Query
from typing import Optional
from services.data_service import DataService

router = APIRouter(prefix="/grievances", tags=["grievances"])

@router.get("")
async def list_grievances(
    ward: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    return DataService.get_grievances(ward=ward, category=category, status=status)
