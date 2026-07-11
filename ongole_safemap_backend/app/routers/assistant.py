from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.assistant_service import ask_assistant

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AssistantQuestion(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


class ZoneSummary(BaseModel):
    zone_id: str
    name: str
    risk_label: str
    total_incidents: int
    latitude: float
    longitude: float


class AssistantResponse(BaseModel):
    answer: str
    mentioned_zones: list[ZoneSummary]
    safest_zones: list[ZoneSummary]


@router.post("/ask", response_model=AssistantResponse)
async def ask(payload: AssistantQuestion):
    try:
        result = await ask_assistant(payload.question)
        return result
    except RuntimeError as e:
        # Groq key not configured — a clear 503, not a confusing 500
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant failed to respond: {e}")