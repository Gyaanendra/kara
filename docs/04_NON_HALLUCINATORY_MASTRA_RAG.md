# 04. Non-Hallucinatory Mastra.ai RAG System

## 1. Why the Previous System Hallucinated Future Meetings
In the previous prototype (`meera-meeting-bot`):
1. Upcoming calendar events were stored in the same table as completed meetings without temporal status segregation.
2. In `tool_schemas.py`:
   ```python
   class ListRecentMeetingsInput(BaseModel):
       include_past: bool = False  # <-- Bug: defaulted to FALSE!
   ```
   When a user asked "What was discussed in recent meetings?", the LLM was fed upcoming meetings scheduled next week, and fabricated past discussions.
3. Vector search lacked strict metadata filters (`status == COMPLETED` and `timestamp <= NOW()`).
4. Dual-database drift: relational state updated in one database while an external vector store kept stale or unverified embeddings.

---

## 2. Kara Mastra AI Implementation

Kara uses `@mastra/nestjs` and `@mastra/core` to build a deterministic, non-hallucinatory agent.

### A. Strict Tool Segregation
We provide two completely separated tools with runtime Zod validation:

1. **`getPastMeetings`**:
   - Query: `WHERE status = 'COMPLETED' AND ended_at <= NOW()`
   - Used for queries like: *"What did John say about Q3 milestones?"*
2. **`getUpcomingSchedule`**:
   - Query: `WHERE status = 'SCHEDULED' AND start_at > NOW()`
   - Used for queries like: *"When is my next client call?"*

---

## 3. Temporal Vector Indexing & Hybrid Search with pgvector

Kara stores high-dimensional vector embeddings directly in **PostgreSQL 18** using the native **`pgvector`** extension (`vector_documents` table).

### A. Schema & Index Definition
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_documents (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
  utterance_id TEXT REFERENCES utterances(id) ON DELETE SET NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  token_count INTEGER,
  meeting_timestamp_ms BIGINT NOT NULL,
  meeting_status TEXT NOT NULL,
  speaker TEXT,
  embedding vector(1536), -- e.g. text-embedding-3-small or custom dimensions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast approximate nearest neighbor search via HNSW index
CREATE INDEX vector_documents_hnsw_idx 
ON vector_documents 
USING hnsw (embedding vector_cosine_ops);

-- Composite B-tree index for temporal guardrail filtering
CREATE INDEX vector_documents_status_ts_idx 
ON vector_documents (meeting_status, meeting_timestamp_ms);
```

### B. Unified Temporal Guardrail Query
Because vectors live directly inside PostgreSQL 18, vector similarity and relational temporal filters execute in a single atomic query plan:

```sql
SELECT 
  id,
  meeting_id,
  chunk_text,
  speaker,
  meeting_timestamp_ms,
  1 - (embedding <=> $queryVector) AS similarity
FROM vector_documents
WHERE org_id = $orgId
  AND meeting_status = 'COMPLETED'
  AND meeting_timestamp_ms <= $nowMs
ORDER BY embedding <=> $queryVector
LIMIT 5;
```

**Guardrail Guarantees:**
- Upcoming meetings (`meeting_status = 'SCHEDULED'`) and in-progress meetings (`meeting_status = 'RECORDING'`) are structurally excluded at the SQL index level.
- Even if a meeting was erroneously marked completed in the future, `meeting_timestamp_ms <= NOW()` guarantees it cannot be retrieved as past history.

---

## 4. Citation Enforcement

The Mastra agent system prompt strictly enforces verified citations:
```
You are Kara, an accurate AI Chief of Staff.
- Never speculate about future meetings. Only answer questions about discussions using verified past transcripts.
- Every claim must cite the meeting: [Meeting: "<Title>", Date: "<Date>", Timestamp: "<MM:SS>"].
- If no past meeting matches the query, explicitly state: "No past meeting discussions found for this topic."
```

In the Next.js UI, citations render as interactive pills that link directly to the audio player at the exact timestamp.
