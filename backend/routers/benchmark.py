from fastapi import APIRouter, Query
from services.benchmark_service import run_benchmark

router = APIRouter(tags=["benchmark"])

@router.get("/benchmark")
async def benchmark(rows: int = Query(1_000_000, description="Number of rows")):
    return run_benchmark(rows)
