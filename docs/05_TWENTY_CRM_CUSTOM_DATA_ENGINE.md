# 05. Twenty CRM Customizable Data Engine

## 1. Concept: Dynamic Metadata & Custom Objects
Traditional CRMs lock teams into rigid tables (`Leads`, `Contacts`, `Deals`). Like Twenty CRM and Notion databases, Kara allows teams to define custom entities and fields dynamically without writing or executing manual database schema migrations.

---

## 2. Data Model Architecture

### A. `crm_objects` (Entity Definitions)
Defines dynamic tables (e.g., `Investor`, `Partner`, `Candidate`, `Deal`):
```json
{
  "id": "obj_deal",
  "name": "Deal",
  "singular": "Deal",
  "plural": "Deals",
  "description": "Sales opportunities pipeline"
}
```

### B. `crm_fields` (Column Definitions)
Defines custom fields attached to an object:
- `TEXT`: Single line or rich markdown text.
- `NUMBER`: Currency, integers, decimals (mapped to SQL `numeric`).
- `SELECT`: Single select tag with custom color hexes.
- `MULTI_SELECT`: Array of tags.
- `DATE`: Timestamp with timezone (`timestamptz`).
- `RELATION`: Bi-directional link to another CRM Object or Meeting.
- `BOOLEAN`: Native boolean.
- `URL`, `EMAIL`, `PHONE`: Validated strings.

### C. `crm_records` (Dynamic Data Store with PostgreSQL 18 JSONB)
Stored natively in PostgreSQL 18 using `jsonb` with GIN indexing for high-performance querying:
```sql
CREATE TABLE crm_records (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  object_id TEXT NOT NULL REFERENCES crm_objects(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast containment & key lookup queries
CREATE INDEX crm_records_data_gin_idx ON crm_records USING gin (data);
```

Sample record representation:
```json
{
  "id": "rec_78129",
  "object_id": "obj_deal",
  "data": {
    "title": "Enterprise License - Acme Corp",
    "value": 45000,
    "stage": "Negotiation",
    "close_date": "2026-10-15T00:00:00Z",
    "meeting_ref": "meet_12893"
  },
  "created_at": "2026-09-24T12:00:00Z"
}
```

---

## 3. UI Patterns (Twenty CRM Style)
1. **Interactive Table View**: Inline cell editing, resizable columns, reorderable columns, and sorting using `@tanstack/react-table`.
2. **Dynamic Filter Bar**: Add compound filters (`data->>'stage' = 'Negotiation' AND (data->>'value')::numeric > 10000`).
3. **Side-Sheet Record Detail**: Slide-out drawer displaying record fields, related meetings, and activity timeline.
