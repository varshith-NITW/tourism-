import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models.ranking_model import compute_pytorch_ranking_scores
from app.chains.langchain_agent import (
    extract_constraints_with_langchain,
    generate_langchain_itinerary_rationale
)

app = FastAPI(
    title="TourMatch AI Microservice",
    description="FastAPI + PyTorch + LangChain + OpenAI API stay recommendation and check-in ranking engine",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class UserQueryRequest(BaseModel):
    query: str
    openai_api_key: Optional[str] = None

class HotelItem(BaseModel):
    id: str
    name: str
    checkin_count: int
    weekly_checkins: int
    footfall_rank: int
    price_per_night: float

class PyTorchRankRequest(BaseModel):
    hotels: List[HotelItem]
    distance_kms: List[float]

class EndToEndRecommendRequest(BaseModel):
    user_prompt: str
    landmark_name: str
    hotels: List[Dict[str, Any]]
    distance_kms: List[float]
    openai_api_key: Optional[str] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service-fastapi",
        "frameworks": ["FastAPI", "PyTorch", "LangChain", "OpenAI API"]
    }

@app.post("/ai/parse-query")
def parse_query_endpoint(request: UserQueryRequest):
    """
    LangChain + OpenAI API: Extracts structured trip constraints from natural language prompt.
    """
    constraints = extract_constraints_with_langchain(
        query=request.query,
        openai_api_key=request.openai_api_key
    )
    return {
        "success": True,
        "extracted_constraints": constraints
    }

@app.post("/ai/rank-hotels")
def rank_hotels_pytorch_endpoint(request: PyTorchRankRequest):
    """
    PyTorch Neural Tensor Scoring:
    Evaluates check-in volume, weekly velocity, distance, and footfall rank.
    Star ratings are strictly excluded.
    """
    hotel_dicts = [h.dict() for h in request.hotels]
    tensor_scores = compute_pytorch_ranking_scores(hotel_dicts, request.distance_kms)
    
    ranked_results = []
    for hotel, dist, score in zip(hotel_dicts, request.distance_kms, tensor_scores):
        ranked_results.append({
            "hotel_id": hotel["id"],
            "name": hotel["name"],
            "distance_km": dist,
            "checkin_count": hotel["checkin_count"],
            "footfall_rank": hotel["footfall_rank"],
            "pytorch_ranking_score": round(score, 4)
        })
        
    ranked_results.sort(key=lambda x: x["pytorch_ranking_score"], reverse=True)
    
    return {
        "success": True,
        "scoring_engine": "PyTorch CheckinRankingNet",
        "ranked_hotels": ranked_results
    }

@app.post("/ai/recommend")
def end_to_end_recommendation_endpoint(request: EndToEndRecommendRequest):
    """
    End-to-End Pipeline:
    1. LangChain extracts constraints from user prompt.
    2. PyTorch scores and ranks candidate hotels.
    3. LangChain synthesizes personalized check-in footfall rationales.
    """
    # 1. LangChain extraction
    constraints = extract_constraints_with_langchain(
        query=request.user_prompt,
        openai_api_key=request.openai_api_key
    )
    
    # 2. PyTorch tensor scoring
    tensor_scores = compute_pytorch_ranking_scores(request.hotels, request.distance_kms)
    
    # 3. Combine and generate rationales
    recommendations = []
    for hotel, dist, score in zip(request.hotels, request.distance_kms, tensor_scores):
        rationale = generate_langchain_itinerary_rationale(
            hotel_name=hotel.get("name", "Hotel"),
            landmark_name=request.landmark_name,
            checkin_count=hotel.get("checkin_count", 2500),
            distance_km=dist,
            guide_name=hotel.get("in_house_guide_name")
        )
        recommendations.append({
            "hotel": hotel,
            "distance_km": dist,
            "pytorch_tensor_score": round(score, 4),
            "checkin_rationale": rationale
        })
        
    recommendations.sort(key=lambda x: x["pytorch_tensor_score"], reverse=True)
    
    return {
        "success": True,
        "query_parsed": constraints,
        "recommendations": recommendations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
