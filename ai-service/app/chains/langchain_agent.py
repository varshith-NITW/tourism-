import os
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI

# 1. Pydantic Output Model for Structured LLM Extraction
class ExtractedTripConstraints(BaseModel):
    target_landmark: str = Field(description="The primary historical monument or tourist spot (e.g. Charminar, Golconda Fort)")
    max_budget_per_night: int = Field(description="Maximum room budget per night in INR. Default 5000 if unspecified")
    needs_guide: bool = Field(description="True if the user requests or implies needing a local guide, historian, or tour escort")
    preferred_language: str = Field(description="Preferred guide spoken language (e.g. English, Hindi, Telugu, Urdu)")
    travel_vibe: str = Field(description="Vibe of travel: family, couple, foodie, photography, budget, luxury, or cultural")

# Setup LangChain Output Parser
parser = PydanticOutputParser(pydantic_object=ExtractedTripConstraints)

EXTRACTION_PROMPT_TEMPLATE = """
You are an expert travel AI agent for TourMatch. Your job is to extract traveler constraints from a natural language query with zero hallucination.

Format Instructions:
{format_instructions}

User Query:
"{query}"

Extracted JSON:
"""

prompt = PromptTemplate(
    template=EXTRACTION_PROMPT_TEMPLATE,
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

def extract_constraints_with_langchain(query: str, openai_api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes LangChain chain with OpenAI API to parse user constraints.
    Falls back gracefully to intelligent pattern matching if OpenAI API key is omitted.
    """
    api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
    
    if api_key and len(api_key.strip()) > 10:
        try:
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.1,
                openai_api_key=api_key
            )
            chain = prompt | llm | parser
            result: ExtractedTripConstraints = chain.invoke({"query": query})
            return result.dict()
        except Exception as e:
            print(f"OpenAI LangChain parsing fallback due to: {e}")
    
    # Deterministic pattern matching fallback
    lower = query.lower()
    
    landmark = "Charminar"
    if "golconda" in lower or "fort" in lower:
        landmark = "Golconda Fort"
    elif "chowmahalla" in lower or "palace" in lower:
        landmark = "Chowmahalla Palace"
    elif "salar jung" in lower or "museum" in lower:
        landmark = "Salar Jung Museum"
        
    budget = 5000
    budget_match = re.search(r'(?:under|below|budget|max|upto|₹|rs\.?)\s*(\d{3,6})', lower)
    if budget_match:
        budget = int(budget_match.group(1))
        
    needs_guide = any(w in lower for w in ["guide", "tour", "walk", "curator", "historian", "escort"])
    
    language = "English"
    if "hindi" in lower: language = "Hindi"
    elif "telugu" in lower: language = "Telugu"
    elif "urdu" in lower: language = "Urdu"
    elif "french" in lower: language = "French"
    
    vibe = "cultural"
    if "family" in lower: vibe = "family"
    elif "couple" in lower or "romantic" in lower: vibe = "couple"
    elif "food" in lower or "biryani" in lower: vibe = "foodie"
    elif "photo" in lower or "camera" in lower: vibe = "photography"
    elif "budget" in lower or "cheap" in lower: vibe = "budget"
    elif "luxury" in lower: vibe = "luxury"
    
    return {
        "target_landmark": landmark,
        "max_budget_per_night": budget,
        "needs_guide": needs_guide,
        "preferred_language": language,
        "travel_vibe": vibe
    }

def generate_langchain_itinerary_rationale(
    hotel_name: str,
    landmark_name: str,
    checkin_count: int,
    distance_km: float,
    guide_name: Optional[str] = None
) -> str:
    """
    Synthesizes contextual rationale explicitly explaining recommendation based on Google Maps check-in density.
    """
    checkin_formatted = f"{checkin_count:,}"
    rationale = (
        f"Recommended based on {checkin_formatted} verified Google Maps check-ins, giving it the top footfall buzz near {landmark_name}. "
        f"Positioned just {int(distance_km * 1000)}m away, ensuring morning entry queues are reachable on foot without traffic delays. "
    )
    if guide_name:
        rationale += f"Pre-configured to seamlessly bundle with certified local guide {guide_name}."
    return rationale
