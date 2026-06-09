"""
SakhiSign AI evaluation service (FastAPI).

Stateless HTTP wrapper around the engine. The frontend (or the Node/Express
backend) sends the *already-selected* sign + the user's captured landmark
frames; the service returns a similarity score and feedback. It performs no
classification - the sign is always provided by the caller.

Run:
    pip install -r requirements.txt
    uvicorn service.app:app --reload --port 8000

Endpoints:
    GET  /health
    GET  /signs              -> list of available signs (+ metadata)
    GET  /signs/{name}       -> one sign's metadata
    POST /evaluate           -> { sign, frames:[...] } -> score + feedback
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine.config import list_signs, get_sign
from engine.evaluate import evaluate

app = FastAPI(title="SakhiSign AI Service", version="1.0.0")

# Allow the Next.js dev frontend / Node backend to call us directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Frame(BaseModel):
    # Each hand is 21 [x, y, z] points, or null when not detected.
    left_hand: Optional[List[List[float]]] = None
    right_hand: Optional[List[List[float]]] = None


class EvaluateRequest(BaseModel):
    sign: str = Field(..., description="canonical sign id, e.g. 'help'")
    frames: List[Frame] = Field(..., description="raw landmark frames of the attempt")


class EvaluateSignRequest(BaseModel):
    # Product-contract shape used by the Node/Express backend.
    signId: str = Field(..., description="canonical sign id / slug")
    landmarks: List[Frame] = Field(..., description="landmark frames of the attempt")


@app.get("/")
def root():
    return {
        "service": "SakhiSign AI",
        "status": "running",
        "endpoints": ["/health", "/signs", "/signs/{name}", "/evaluate", "/evaluate_sign", "/docs"],
        "note": "This is an API, not a website. Open /docs to explore it.",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/signs")
def signs():
    return {"signs": list_signs()}


@app.get("/signs/{name}")
def sign_detail(name: str):
    try:
        return get_sign(name).to_public_dict()
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown sign '{name}'")


@app.post("/evaluate")
def evaluate_attempt(req: EvaluateRequest):
    frames = [f.model_dump() for f in req.frames]
    try:
        return evaluate(req.sign, frames)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown sign '{req.sign}'")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/evaluate_sign")
def evaluate_sign(req: EvaluateSignRequest):
    """
    Product-contract endpoint the Node/Express backend calls. Returns exactly
    overallAccuracy / componentScores / feedbackMessages (plus extras).
    """
    frames = [f.model_dump() for f in req.landmarks]
    try:
        result = evaluate(req.signId, frames)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown sign '{req.signId}'")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "overallAccuracy": result["overallAccuracy"],
        "componentScores": result["componentScores"],
        "feedbackMessages": result["feedbackMessages"],
        "verdict": result["verdict"],
        "mirrored": result["mirrored"],
    }
