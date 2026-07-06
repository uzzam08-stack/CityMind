from fastapi import APIRouter
from services.data_service import DataService

router = APIRouter(prefix="/trucks", tags=["trucks"])

@router.get("")
async def list_trucks():
    return DataService.get_trucks()
