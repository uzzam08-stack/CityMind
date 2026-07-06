from fastapi import APIRouter
from pydantic import BaseModel
from services.nl_query_service import process_nl_query

router = APIRouter(tags=["nl-query"])

class QueryRequest(BaseModel):
    query: str

@router.post("/nl-query")
async def nl_query(request: QueryRequest):
    return process_nl_query(request.query)
