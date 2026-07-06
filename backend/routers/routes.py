from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from services.data_service import DataService
from services.route_optimizer import optimize_routes

router = APIRouter(tags=["routes"])

class OptimizeRequest(BaseModel):
    ward_id: str

@router.get("/routes")
async def get_routes(ward: str = Query(..., description="Ward name")):
    bins = DataService.get_bins(ward=ward)
    trucks = DataService.get_trucks()
    if not bins:
        raise HTTPException(status_code=404, detail=f"No bins found for ward: {ward}")
    return optimize_routes(ward, bins, trucks)

@router.post("/optimize-routes")
async def run_optimization(request: OptimizeRequest):
    bins = DataService.get_bins(ward=request.ward_id)
    trucks = DataService.get_trucks()
    if not bins:
        raise HTTPException(status_code=404, detail=f"No bins found for ward: {request.ward_id}")
    return optimize_routes(request.ward_id, bins, trucks)
