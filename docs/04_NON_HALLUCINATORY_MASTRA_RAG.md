# 04. Non-Hallucinatory Mastra.ai RAG System

## 1. Why the Previous System Hallucinated Future Meetings
In `meera-meeting-bot`:
1. Upcoming calendar events were stored in the same table as completed meetings without temporal status segregation.
2. In `tool_schemas.py`:
   ```python
   class ListRecentMeetingsInput(BaseModel):
       include_past: bool = False  # <-- Bug: defaulted to FALSE!
   ```
   When asked "What was discussed in recent meetings?", the LLM was fed upcoming meetings scheduled next week, and fabricated discussions.
3. Vector search lacked strict metadata filters (`status == COMPLETED` and `timestamp <= NOW()`).

---

## 2. Kara Mastra AI Implementation

Kara uses `@mastra/nestjs` and `@mastra/core` to build a deterministic, non-hallucinatory agent.

### A. Strict Tool Segregation
We provide two completely separated tools with runtime Zod validation:

1. **`getPastMeetings`**:
   - Query: `WHERE status = "COMPLETED" AND ended_at <= NOW()`
   - Used for queries like: *"What did John say about Q3 milestones?"*
2. **`getUpcomingSchedule`**:
   - Query: `WHERE status = "SCHEDULED" AND start_at > NOW()`
   - Used for queries like: *"When is my next client call?"*

---

## 3. Temporal Vector Indexing & Hybrid Search

Vectors stored in ChromaDB (or Qdrant) always contain structured metadata:

```json
{
  "chunk_id": "chunk_98234",
  "meeting_id": "meet_12893",
  "meeting_title": "Product Roadmap Sync",
  "meeting_timestamp": 1727184000000,
  "status": "COMPLETED",
  "speaker": "Sarah Connor",
  "text": "We will ship the custom fields feature by next Friday."
}
```

### Search Query Guardrail:
When searching the vector database, Kara enforces hard metadata filters:
```typescript
const searchResults = await vectorStore.query({
  queryVector,
  limit: 5,
  filter: {
    status: { $eq: "COMPLETED" },
    meeting_timestamp: { $lte: Date.now() },
  },
});
```

### Citation Enforcement:
The Mastra agent system prompt strictly enforces verified citations:
```
You are Kara, an accurate AI Chief of Staff.
- Never speculate about future meetings. Only answer questions about discussions using verified past transcripts.
- Every claim must cite the meeting: [Meeting: "<Title>", Date: "<Date>", Timestamp: "<MM:SS>"].
- If no past meeting matches the query, explicitly state: "No past meeting discussions found for this topic."
```

