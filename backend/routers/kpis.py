from fastapi import APIRouter
from services.data_service import DataService

router = APIRouter(prefix="/kpis", tags=["kpis"])

@router.get("")
async def get_kpis():
    return DataService.get_kpis()
