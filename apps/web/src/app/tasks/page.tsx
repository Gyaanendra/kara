"use client";

import React, { useEffect, useState } from "react";
import {
  KanbanSquare,
  Plus,
  Play,
  CheckCircle2,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

interface Assignee {
  name?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  assignee?: Assignee;
  sourceAudioDeepLinkMs?: number;
}

interface Column {
  id: string;
  title: string;
  statusMapping: "TODO" | "IN_PROGRESS" | "DONE";
  colorHex?: string;
  tasks?: Task[];
}

interface Board {
  id: string;
  title?: string;
  columns?: Column[];
}

const fallbackColumns: Column[] = [
  {
    id: "col_todo",
    title: "To Do",
    statusMapping: "TODO",
    colorHex: "#3B82F6",
    tasks: [
      {
        id: "t1",
        title: "Deploy NestJS backend API services",
        description:
          "Extracted automatically from Roadmap Sync at 01:03",
        priority: "HIGH",
        assignee: { name: "Sarah Chen" },
        sourceAudioDeepLinkMs: 63000,
      },
    ],
  },
  {
    id: "col_inprogress",
    title: "In Progress",
    statusMapping: "IN_PROGRESS",
    colorHex: "#F59E0B",
    tasks: [],
  },
  {
    id: "col_done",
    title: "Done",
    statusMapping: "DONE",
    colorHex: "#10B981",
    tasks: [],
  },
];

const priorityStyles: Record<string, string> = {
  HIGH: "bg-error/10 text-error border-error/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  LOW: "bg-accent-soft text-accent border-accent/20",
};

export default function TasksPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("HIGH");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    try {
      const boards = await fetchApi<Board[]>("/kanban/boards");
      if (boards.length > 0) {
        setBoard(boards[0]);
      }
    } catch (err: unknown) {
      console.error(
        "Failed to load kanban boards:",
        err instanceof Error ? err.message : err
      );
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetchApi(`/kanban/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setFeedback(`Task moved to ${newStatus}`);
      setTimeout(() => setFeedback(null), 2000);
      loadBoard();
    } catch (err: unknown) {
      setFeedback(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const todoCol = board?.columns?.find(
        (c) => c.statusMapping === "TODO"
      );
      await fetchApi("/kanban/tasks", {
        method: "POST",
        body: JSON.stringify({
          boardId: board?.id || "brd_default",
          columnId: todoCol?.id || "col_todo",
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          status: "TODO",
        }),
      });
      setFeedback("Task created successfully!");
      setIsModalOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setTimeout(() => setFeedback(null), 2000);
      loadBoard();
    } catch (err: unknown) {
      setFeedback(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const columns = board?.columns || fallbackColumns;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-header-md font-unbounded font-bold text-ink flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-accent" />
            Notion-Style Task OS
          </h1>
          <p className="text-body-base font-albert text-ink-muted mt-1">
            Tasks extracted automatically from meeting decisions with audio
            timestamp citations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-accent hover:opacity-90 text-on-accent text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((column) => {
          const tasks = column.tasks || [];
          return (
            <div
              key={column.id}
              className="bg-subtle border border-line rounded-xl p-4 space-y-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: column.colorHex || "var(--accent-primary)",
                    }}
                  />
                  <span className="text-xs font-semibold text-ink font-albert">
                    {column.title}
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono bg-card border border-line px-1.5 py-0.5 rounded">
                    {tasks.length}
                  </span>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-ink-muted" />
              </div>

              {/* Task Cards */}
              <div className="space-y-3 min-h-[160px]">
                {tasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-line-strong/50 rounded-lg flex items-center justify-center text-xs text-ink-muted font-albert">
                    No tasks in {column.title}
                  </div>
                ) : (
                  tasks.map((task) => {
                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-card border border-line hover:border-line-strong hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-ink font-albert leading-snug">
                            {task.title}
                          </span>
                          <span
                            className={`text-[9px] border px-1.5 py-0.5 rounded font-mono shrink-0 ${
                              priorityStyles[task.priority || "MEDIUM"]
                            }`}
                          >
                            {task.priority || "MEDIUM"}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed font-albert">
                            {task.description}
                          </p>
                        )}

                        {task.sourceAudioDeepLinkMs && (
                          <div className="flex items-center gap-1.5 text-[10px] text-accent bg-accent-soft border border-accent/20 px-2 py-1 rounded font-mono">
                            <Play className="w-2.5 h-2.5 shrink-0" />
                            <span>
                              Audio Deep Link @{" "}
                              {Math.round(task.sourceAudioDeepLinkMs / 1000)}s
                            </span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-ink-secondary text-[11px] font-albert min-w-0">
                            <div className="w-5 h-5 rounded-full bg-subtle border border-line flex items-center justify-center text-[9px] text-ink-secondary font-semibold shrink-0">
                              {(task.assignee?.name || "SC")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="truncate">
                              {task.assignee?.name || "Sarah Chen"}
                            </span>
                          </div>

                          {/* Quick Move Action */}
                          {column.statusMapping === "TODO" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(task.id, "IN_PROGRESS")
                              }
                              className="text-[11px] text-warning hover:opacity-80 flex items-center gap-1 font-medium transition cursor-pointer shrink-0"
                            >
                              <span>Start</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {column.statusMapping === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, "DONE")}
                              className="text-[11px] text-success hover:opacity-80 flex items-center gap-1 font-medium transition cursor-pointer shrink-0"
                            >
                              <span>Done</span>
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-line rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-semibold text-ink font-unbounded">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-ink-secondary font-albert">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement WebRTC audio streamer"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-subtle border border-line rounded-lg text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-secondary font-albert">
                  Description
                </label>
                <textarea
                  placeholder="Task details and deliverables..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-subtle border border-line rounded-lg text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-secondary font-albert">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-subtle border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:opacity-90 text-on-accent text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
