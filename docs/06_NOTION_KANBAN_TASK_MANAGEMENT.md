# 06. Notion-Style Kanban & Task Management

## 1. Overview
Kara seamlessly converts meeting discussions into actionable team workflows. When a meeting completes, Kara’s synthesis workflow automatically extracts Action Items with suggested assignees, priorities, and deadlines.

Users can view and manage tasks in Notion-style layouts:
- **Kanban Board**: Drag-and-drop workflow status (Backlog -> Todo -> In Progress -> Review -> Done).
- **List & Table View**: Dense operational table view with inline editing and fast keyboard navigation.
- **Side Document Sheet**: Markdown-enabled task detail view with full meeting context.

---

## 2. Bi-Directional Meeting & Task Linking
Every task maintains an explicit link back to the meeting MOM and transcript timestamp where the task was decided.
- Clicking a task shows:
  "Origin: Product Strategy Sync (Sep 24, 2026 at 14:32)"
- Users can click the audio timestamp to replay the exact seconds where the decision was made.

---

## 3. Conversational AI Task Management
Users can manage tasks directly through Kara’s chat interface without touching the board:

- *"Kara, create a high-priority task for Alex to update API documentation by Friday."*
  - The Mastra Agent calls `createTask({ title: "Update API documentation", assigneeId: "alex_id", priority: "HIGH", dueDate: "2026-09-29T18:00:00Z" })`.
- *"What tasks are currently blocked or due today?"*
  - The agent calls `listTasks({ dueBefore: "2026-09-24T23:59:59Z" })` and summarizes them in natural language.
