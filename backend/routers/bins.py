from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.data_service import DataService

router = APIRouter(prefix="/bins", tags=["bins"])

@router.get("")
async def list_bins(ward: Optional[str] = Query(None)):
    return DataService.get_bins(ward=ward)

@router.get("/{bin_id}")
async def get_bin(bin_id: str):
    b = DataService.get_bin(bin_id)
    if not b:
        raise HTTPException(status_code=404, detail=f"Bin {bin_id} not found")
    return b
