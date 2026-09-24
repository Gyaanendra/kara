# 05. Twenty CRM Customizable Data Engine

## 1. Concept: Dynamic Metadata & Custom Objects
Traditional CRMs lock you into rigid tables (`Leads`, `Contacts`, `Deals`). Like Twenty CRM and Notion databases, Kara allows teams to define custom entities and fields dynamically without writing database migrations.

---

## 2. Data Model Architecture

### A. `crm_objects` (Entity Definitions)
Defines dynamic tables (e.g., `Investor`, `Partner`, `Candidate`, `Deal`).
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
- `NUMBER`: Currency, integers, decimals.
- `SELECT`: Single select tag with custom color hexes.
- `MULTI_SELECT`: Array of tags.
- `DATE`: Timestamp with optional time.
- `RELATION`: Bi-directional link to another CRM Object or Meeting.
- `BOOLEAN`: Toggle switch.

### C. `crm_records` (Dynamic Data Store)
Stored in SQLite / PostgreSQL with indexed JSON structures:
```json
{
  "id": "rec_78129",
  "object_id": "obj_deal",
  "data": {
    "title": "Enterprise License - Acme Corp",
    "value": 45000,
    "stage": "Negotiation",
    "close_date": "2026-10-15",
    "meeting_ref": "meet_12893"
  },
  "created_at": "2026-09-24T12:00:00Z"
}
```

---

## 3. UI Patterns (Twenty CRM Style)
1. **Interactive Table View**: Inline cell editing, resizable columns, reorderable columns, and sorting using `@tanstack/react-table`.
2. **Dynamic Filter Bar**: Add compound filters (`stage == "Negotiation" AND value > 10000`).
3. **Side-Sheet Record Detail**: Slide-out drawer displaying record fields, related meetings, and activity timeline.

