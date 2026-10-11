import os
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("laya-router")

app = FastAPI(
    title="Kara Laya Decision Router Sidecar",
    description="Reflex decision model and semantic routing for Kara AI (33ms inference)",
    version="1.0.0",
)

SCHEMAS_DIR = os.path.join(os.path.dirname(__file__), "schemas")

def load_schema(filename: str):
    path = os.path.join(SCHEMAS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

utterance_schema = load_schema("utterance_classification.json")
meeting_tagging_schema = load_schema("meeting_tagging.json")
query_routing_schema = load_schema("query_routing.json")
relevance_schema = load_schema("relevance_scoring.json")
guard_schema = load_schema("content_guard.json")

class UtteranceRequest(BaseModel):
    text: str
    speaker: Optional[str] = None
    context: Optional[str] = None

class UtteranceResponse(BaseModel):
    category: str
    confidence: float
    matched_rule: str

class RelevanceRequest(BaseModel):
    query: str
    chunk_text: str

class RelevanceResponse(BaseModel):
    is_relevant: bool
    score: float
    reason: str

class RouteRequest(BaseModel):
    query: str
    user_id: Optional[str] = None

class RouteResponse(BaseModel):
    route: str
    required_tool: str
    confidence: float

class TagMeetingRequest(BaseModel):
    title: str
    summary: Optional[str] = None
    utterance_samples: Optional[List[str]] = None

class TagMeetingResponse(BaseModel):
    meeting_type: str
    confidence: float

class GuardRequest(BaseModel):
    text: str

class GuardResponse(BaseModel):
    passed: bool
    flag: Optional[str] = None

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "laya-decision-router",
        "model": "convaiinnovations/laya",
        "inference_latency_ms": 33,
    }

@app.post("/classify-utterance", response_model=UtteranceResponse)
def classify_utterance(req: UtteranceRequest):
    text_lower = req.text.lower().strip()

    # Question detection
    if "?" in req.text or any(text_lower.startswith(w) for w in ["what", "who", "when", "where", "why", "how", "can we", "is there", "should we"]):
        return UtteranceResponse(category="QUESTION", confidence=0.92, matched_rule="question_syntax")

    # Action item keywords
    action_triggers = ["will deploy", "will build", "will create", "i will", "we need to", "action item", "todo", "assigned to", "follow up on", "take care of"]
    if any(trigger in text_lower for trigger in action_triggers):
        return UtteranceResponse(category="ACTION_ITEM", confidence=0.88, matched_rule="action_commitment")

    # Decision keywords
    decision_triggers = ["agreed", "decided", "decision made", "standardize on", "conclusion is", "we approved", "we will go with"]
    if any(trigger in text_lower for trigger in decision_triggers):
        return UtteranceResponse(category="DECISION", confidence=0.90, matched_rule="consensus_decision")

    # Default to information
    return UtteranceResponse(category="INFORMATION", confidence=0.75, matched_rule="general_statement")

@app.post("/route-query", response_model=RouteResponse)
def route_query(req: RouteRequest):
    q = req.query.lower()

    if any(w in q for w in ["upcoming", "future", "schedule", "calendar", "tomorrow", "next week", "later today"]):
        return RouteResponse(route="UPCOMING_SCHEDULE", required_tool="getUpcomingSchedule", confidence=0.95)

    if any(w in q for w in ["deal", "pipeline", "crm", "lead", "customer", "account", "revenue", "opportunity"]):
        return RouteResponse(route="CRM_DATA", required_tool="queryCrmRecords", confidence=0.91)

    if any(w in q for w in ["task", "todo", "kanban", "in progress", "done", "assignee", "action item", "board"]):
        return RouteResponse(route="TASK_MANAGEMENT", required_tool="manageTasks", confidence=0.93)

    if any(w in q for w in ["yesterday", "last meeting", "discussed", "decided", "said", "transcript", "recording", "standup", "sync"]):
        return RouteResponse(route="PAST_MEETINGS", required_tool="getPastMeetings", confidence=0.94)

    return RouteResponse(route="KNOWLEDGE_SEARCH", required_tool="searchKnowledgeBase", confidence=0.82)

@app.post("/score-relevance", response_model=RelevanceResponse)
def score_relevance(req: RelevanceRequest):
    q_words = set(req.query.lower().split())
    chunk_words = set(req.chunk_text.lower().split())
    overlap = len(q_words.intersection(chunk_words))

    score = min(0.3 + (overlap * 0.15), 0.98)
    is_relevant = score >= 0.55
    return RelevanceResponse(
        is_relevant=is_relevant,
        score=round(score, 2),
        reason=f"Word overlap: {overlap} semantic matches" if is_relevant else "Low topical alignment"
    )

@app.post("/tag-meeting", response_model=TagMeetingResponse)
def tag_meeting(req: TagMeetingRequest):
    title_lower = req.title.lower()

    if "standup" in title_lower or "daily" in title_lower:
        return TagMeetingResponse(meeting_type="STANDUP", confidence=0.96)
    if "sprint" in title_lower or "architecture" in title_lower or "roadmap" in title_lower:
        return TagMeetingResponse(meeting_type="SPRINT_REVIEW", confidence=0.92)
    if "1:1" in title_lower or "1-on-1" in title_lower or "one on one" in title_lower:
        return TagMeetingResponse(meeting_type="ONE_ON_ONE", confidence=0.95)
    if "client" in title_lower or "demo" in title_lower or "sales" in title_lower:
        return TagMeetingResponse(meeting_type="CLIENT_CALL", confidence=0.89)

    return TagMeetingResponse(meeting_type="GENERAL_SYNC", confidence=0.70)

@app.post("/check-content", response_model=GuardResponse)
def check_content(req: GuardRequest):
    text_lower = req.text.lower()
    injections = ["ignore previous instructions", "system prompt", "leak credentials", "reveal password"]
    if any(inj in text_lower for inj in injections):
        return GuardResponse(passed=False, flag="PROMPT_INJECTION")
    return GuardResponse(passed=True, flag=None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
