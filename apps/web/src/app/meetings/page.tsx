"use client";

import React, { useEffect, useState } from "react";
import {
  Video,
  Play,
  Pause,
  Clock,
  Sparkles,
  CheckCircle2,
  ListTodo,
  FileText,
  Volume2,
  Calendar,
  Layers,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [mom, setMom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "mom">("transcript");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(12000);
  const [promoteStatus, setPromoteStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const res = await fetchApi<any[]>("/meetings");
        setMeetings(res);
        if (res.length > 0) {
          setSelectedMeeting(res[0]);
        }
      } catch (err) {
        console.error("Error loading meetings:", err);
      }
    }
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!selectedMeeting) return;
    async function loadDetails() {
      try {
        const [trnRes, momRes] = await Promise.all([
          fetchApi<any>(`/transcripts/meeting/${selectedMeeting.id}`).catch(() => null),
          fetchApi<any>(`/moms/meeting/${selectedMeeting.id}`).catch(() => null),
        ]);
        setTranscript(trnRes);
        setMom(momRes);
      } catch (err) {
        console.error("Error loading meeting details:", err);
      }
    }
    loadDetails();
  }, [selectedMeeting]);

  const handleSeek = (ms: number) => {
    setCurrentTimeMs(ms);
    setIsPlaying(true);
  };

  const handlePromoteActionItem = async (actionItemId: string) => {
    try {
      await fetchApi(`/moms/action-items/${actionItemId}/promote`, { method: "POST" });
      setPromoteStatus("Promoted action item to Kanban task!");
      setTimeout(() => setPromoteStatus(null), 2500);
    } catch (err: any) {
      setPromoteStatus(`Error: ${err.message}`);
    }
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-400" />
            Meeting Intelligence Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deepgram Nova-2 diarized transcripts, audio scrubbing, and Laya reflex categorization.
          </p>
        </div>

        {selectedMeeting && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-mono">
              {selectedMeeting.meetingType}
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              {selectedMeeting.status}
            </span>
          </div>
        )}
      </div>

      {promoteStatus && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{promoteStatus}</span>
        </div>
      )}

      {/* Main Grid: Meeting Details & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meeting Metadata & Audio Player */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-white">
              {selectedMeeting?.title || "Architecture & Roadmap Sync"}
            </h2>
            <p className="text-xs text-zinc-400">
              {selectedMeeting?.description || "Sprint architecture review and PostgreSQL 18 migration discussion."}
            </p>

            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> Date</span>
                <span className="text-zinc-200">Today, 10:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-500" /> Duration</span>
                <span className="text-zinc-200">60 mins (78s sample)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-zinc-500" /> Provider</span>
                <span className="text-amber-400 font-mono text-[11px]">Deepgram Nova-3 (Multilingual)</span>
              </div>
            </div>

            {/* Audio Waveform Player Widget */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <span className="text-xs font-mono text-zinc-300">{formatMs(currentTimeMs)} / 01:20</span>
                </div>
                <Volume2 className="w-4 h-4 text-zinc-400" />
              </div>

              {/* Scrubber bar */}
              <input
                type="range"
                min="0"
                max="80000"
                step="1000"
                value={currentTimeMs}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="text-[10px] text-zinc-500 text-center">
                Click any utterance turn below to jump audio to that exact moment
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabbed Viewer (Transcript / MOM) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex items-center border-b border-zinc-800 bg-zinc-950/50 px-4">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition ${
                activeTab === "transcript"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diarized Transcript ({transcript?.utterances?.length || 4} turns)</span>
            </button>
            <button
              onClick={() => setActiveTab("mom")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition ${
                activeTab === "mom"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive MOM & Decisions</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto max-h-[580px]">
            {activeTab === "transcript" ? (
              <div className="space-y-4">
                {(transcript?.utterances || [
                  {
                    id: "1",
                    speakerName: "Alex Rivera",
                    speakerLabel: "SPEAKER_00",
                    startMs: 12000,
                    text: "Welcome everyone. Let us review the roadmap. Sarah, what is the status of the new database migration?",
                    type: "QUESTION",
                  },
                  {
                    id: "2",
                    speakerName: "Sarah Chen",
                    speakerLabel: "SPEAKER_01",
                    startMs: 26000,
                    text: "The PostgreSQL 18 migration with pgvector is ready. It completely eliminates all our database locking issues.",
                    type: "INFORMATION",
                  },
                  {
                    id: "3",
                    speakerName: "Alex Rivera",
                    speakerLabel: "SPEAKER_00",
                    startMs: 46000,
                    text: "Decision made: We will standardize on PostgreSQL 18 for both development and production.",
                    type: "DECISION",
                  },
                  {
                    id: "4",
                    speakerName: "Sarah Chen",
                    speakerLabel: "SPEAKER_01",
                    startMs: 63000,
                    text: "I will deploy the new NestJS backend API services by tomorrow morning.",
                    type: "ACTION_ITEM",
                  },
                ]).map((u: any) => {
                  const isCurrent = currentTimeMs >= u.startMs && currentTimeMs <= (u.endMs || u.startMs + 15000);
                  const typeColors: Record<string, string> = {
                    ACTION_ITEM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    DECISION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    QUESTION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    INFORMATION: "bg-zinc-800 text-zinc-400 border-zinc-700",
                  };

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSeek(u.startMs)}
                      className={`p-3.5 rounded-lg border transition cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-950/30 border-indigo-500/60 shadow-sm"
                          : "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-200">
                            {u.speakerName || u.speakerLabel}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatMs(u.startMs)}
                          </span>
                        </div>
                        <span className={`text-[10px] border px-2 py-0.5 rounded font-mono ${typeColors[u.type] || typeColors.INFORMATION}`}>
                          {u.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{u.text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-zinc-300 bg-zinc-950 p-4 rounded-lg border border-zinc-800 leading-relaxed">
                    {mom?.executiveSummary ||
                      "The engineering team confirmed the successful standardization on PostgreSQL 18 with MVCC concurrency and Deepgram Nova-2 speech diarization. Zero database locks observed during multi-worker BullMQ load."}
                  </p>
                </div>

                {/* Key Decisions */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Key Decisions Finalized
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white">Standardize on PostgreSQL 18 and Deepgram Nova-2</span>
                        <p className="text-zinc-500 text-[11px] mt-0.5">Confirmed at 00:46 by Alex Rivera</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Action Items & Deliverables
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-white">Deploy NestJS backend API services</div>
                        <div className="text-[11px] text-zinc-500">
                          Assignee: Sarah Chen &middot; Audio timestamp: 01:03
                        </div>
                      </div>
                      <button
                        onClick={() => handlePromoteActionItem("act_sample_seed")}
                        className="flex items-center gap-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>Promote to Kanban Task</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
