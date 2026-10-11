"use client";

import React, { useEffect, useState } from "react";
import {
  KanbanSquare,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function TasksPage() {
  const [board, setBoard] = useState<any>(null);
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
      const boards = await fetchApi<any[]>("/kanban/boards");
      if (boards.length > 0) {
        setBoard(boards[0]);
      }
    } catch (err) {
      console.error("Failed to load kanban boards:", err);
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
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const todoCol = board?.columns?.find((c: any) => c.statusMapping === "TODO");
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
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const columns = board?.columns || [
    {
      id: "col_todo",
      title: "To Do",
      statusMapping: "TODO",
      colorHex: "#3B82F6",
      tasks: [
        {
          id: "t1",
          title: "Deploy NestJS backend API services",
          description: "Extracted automatically from Roadmap Sync at 01:03",
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-amber-400" />
            Notion-Style Task OS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tasks extracted automatically from meeting decisions with audio timestamp citations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((column: any) => {
          const tasks = column.tasks || [];
          return (
            <div key={column.id} className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: column.colorHex || "#6366F1" }}
                  />
                  <span className="text-xs font-semibold text-zinc-200">{column.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800/60 px-1.5 py-0.5 rounded">
                    {tasks.length}
                  </span>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-zinc-500" />
              </div>

              {/* Task Cards */}
              <div className="space-y-3 min-h-[160px]">
                {tasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-zinc-800/80 rounded-lg flex items-center justify-center text-xs text-zinc-600">
                    No tasks in {column.title}
                  </div>
                ) : (
                  tasks.map((task: any) => {
                    const priorityStyles: Record<string, string> = {
                      HIGH: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                      MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      LOW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    };

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700/80 transition space-y-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-white leading-snug">
                            {task.title}
                          </span>
                          <span
                            className={`text-[9px] border px-1.5 py-0.5 rounded font-mono shrink-0 ${
                              priorityStyles[task.priority] || priorityStyles.MEDIUM
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {task.sourceAudioDeepLinkMs && (
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-800/30 px-2 py-1 rounded font-mono">
                            <Play className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                            <span>Audio Deep Link @ {Math.round(task.sourceAudioDeepLinkMs / 1000)}s</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-300 font-semibold">
                              {(task.assignee?.name || "SC").slice(0, 2).toUpperCase()}
                            </div>
                            <span>{task.assignee?.name || "Sarah Chen"}</span>
                          </div>

                          {/* Quick Move Action */}
                          {column.statusMapping === "TODO" && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition cursor-pointer"
                            >
                              <span>Start</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {column.statusMapping === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, "DONE")}
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-semibold text-white">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Implement WebRTC audio streamer"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Description</label>
                <textarea
                  placeholder="Task details and deliverables..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
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
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
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
