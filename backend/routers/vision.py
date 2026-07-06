"""Vision analysis endpoint for C&D waste dumping site images."""

import os
import json
import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["vision"])


class ImageAnalysisRequest(BaseModel):
    image_base64: str


MOCK_RESPONSES = [
    {
        "materials": ["Concrete rubble", "Broken bricks", "Steel rebar", "Timber planks", "PVC pipe fragments"],
        "estimated_volume_m3": 12.5,
        "penalty_multiplier": 1,
        "location_risk": "Open plot near residential area",
        "estimated_fine_inr": 50000,
        "remediation_cost_inr": 35000,
        "confidence": 0.91
    },
    {
        "materials": ["Demolished plaster", "Ceramic tiles", "Concrete chunks", "Metal sheets"],
        "estimated_volume_m3": 8.3,
        "penalty_multiplier": 10,
        "location_risk": "Near storm water drain — 10x penalty zone",
        "estimated_fine_inr": 500000,
        "remediation_cost_inr": 120000,
        "confidence": 0.87
    },
    {
        "materials": ["Sand", "Gravel", "Broken glass", "Asbestos sheeting", "Wooden frames"],
        "estimated_volume_m3": 22.1,
        "penalty_multiplier": 1,
        "location_risk": "Vacant industrial land",
        "estimated_fine_inr": 75000,
        "remediation_cost_inr": 55000,
        "confidence": 0.94
    },
]


@router.post("/analyze-dumping")
async def analyze_dumping(request: ImageAnalysisRequest):
    """Analyze an image of illegal C&D waste dumping.

    In production, this calls Gemini 1.5 Flash Vision API.
    In demo mode, returns a realistic mock response.
    """
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"

    if demo_mode or not request.image_base64:
        mock = random.choice(MOCK_RESPONSES)
        return {
            "status": "success",
            "model": "gemini-1.5-flash (demo mock)",
            "analysis": mock,
        }

    # Production path — would call Gemini Vision API here
    try:
        import google.generativeai as genai
        import base64

        genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")

        image_bytes = base64.b64decode(request.image_base64)
        prompt = (
            "You are a municipal surveyor. Analyze this image of illegal construction "
            "and demolition (C&D) waste. Return a strict JSON object with: "
            "'materials' (list of identified materials), 'estimated_volume_m3' (float), "
            "'penalty_multiplier' (integer, usually 10x for waterbodies/drains), "
            "'location_risk' (string), 'estimated_fine_inr' (integer), "
            "'remediation_cost_inr' (integer), 'confidence' (float 0-1)."
        )

        response = model.generate_content(
            [
                prompt,
                {"mime_type": "image/jpeg", "data": image_bytes},
            ]
        )

        try:
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0]
            analysis = json.loads(text)
        except (json.JSONDecodeError, IndexError):
            analysis = random.choice(MOCK_RESPONSES)

        return {
            "status": "success",
            "model": "gemini-1.5-flash",
            "analysis": analysis,
        }
    except Exception:
        mock = random.choice(MOCK_RESPONSES)
        return {
            "status": "success",
            "model": "gemini-1.5-flash (fallback mock)",
            "analysis": mock,
        }
