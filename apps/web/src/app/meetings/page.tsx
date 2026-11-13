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

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType?: string;
  status?: string;
}

interface Utterance {
  id: string;
  speakerName?: string;
  speakerLabel?: string;
  startMs: number;
  endMs?: number;
  text: string;
  type?: "ACTION_ITEM" | "DECISION" | "QUESTION" | "INFORMATION";
}

interface Transcript {
  utterances?: Utterance[];
}

interface MomActionItem {
  id?: string;
}

interface Mom {
  executiveSummary?: string;
  actionItems?: MomActionItem[];
}

const fallbackUtterances: Utterance[] = [
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
];

const typeColors: Record<string, string> = {
  ACTION_ITEM: "bg-warning/10 text-warning border-warning/20",
  DECISION: "bg-success/10 text-success border-success/20",
  QUESTION: "bg-accent-soft text-accent border-accent/20",
  INFORMATION: "bg-subtle text-ink-muted border-line",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [mom, setMom] = useState<Mom | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "mom">(
    "transcript"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(12000);
  const [promoteStatus, setPromoteStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const res = await fetchApi<Meeting[]>("/meetings");
        setMeetings(res);
        if (res.length > 0) {
          setSelectedMeeting(res[0]);
        }
      } catch (err: unknown) {
        console.error(
          "Error loading meetings:",
          err instanceof Error ? err.message : err
        );
      }
    }
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!selectedMeeting) return;
    async function loadDetails() {
      try {
        const [trnRes, momRes] = await Promise.all([
          fetchApi<Transcript | null>(`/transcripts/meeting/${selectedMeeting?.id}`).catch(
            () => null
          ),
          fetchApi<Mom | null>(`/moms/meeting/${selectedMeeting?.id}`).catch(
            () => null
          ),
        ]);
        setTranscript(trnRes);
        setMom(momRes);
      } catch (err: unknown) {
        console.error(
          "Error loading meeting details:",
          err instanceof Error ? err.message : err
        );
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
      await fetchApi(`/moms/action-items/${actionItemId}/promote`, {
        method: "POST",
      });
      setPromoteStatus("Promoted action item to Kanban task!");
      setTimeout(() => setPromoteStatus(null), 2500);
    } catch (err: unknown) {
      setPromoteStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const utterances = transcript?.utterances || fallbackUtterances;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-header-md font-unbounded font-bold text-ink flex items-center gap-2">
            <Video className="w-5 h-5 text-accent" />
            Meeting Intelligence Hub
          </h1>
          <p className="text-body-base font-albert text-ink-muted mt-1">
            Deepgram Nova-3 diarized transcripts, audio scrubbing, and Laya
            reflex categorization.
          </p>
        </div>

        {selectedMeeting && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-accent-soft text-accent border border-accent/20 px-2.5 py-1 rounded-full font-mono">
              {selectedMeeting.meetingType || "SYNC"}
            </span>
            <span className="text-xs bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-full font-medium font-albert">
              {selectedMeeting.status || "PROCESSED"}
            </span>
          </div>
        )}
      </div>

      {promoteStatus && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{promoteStatus}</span>
        </div>
      )}

      {/* Meeting List Strip */}
      {meetings.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {meetings.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMeeting(m)}
              className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-albert border transition-all duration-200 ease-out cursor-pointer max-w-56 truncate ${
                selectedMeeting?.id === m.id
                  ? "bg-card border-line-strong text-ink shadow-2xs"
                  : "bg-card border-line text-ink-secondary hover:border-line-strong hover:text-ink"
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid: Meeting Details & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Meeting Metadata & Audio Player */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-card border border-line space-y-4 shadow-2xs">
            <h2 className="text-sm font-semibold text-ink font-albert">
              {selectedMeeting?.title || "Architecture & Roadmap Sync"}
            </h2>
            <p className="text-xs text-ink-secondary font-albert">
              {selectedMeeting?.description ||
                "Sprint architecture review and PostgreSQL 18 migration discussion."}
            </p>

            <div className="space-y-2 pt-2 border-t border-line text-xs font-albert text-ink-secondary">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink-muted" /> Date
                </span>
                <span className="text-ink">Today, 10:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" /> Duration
                </span>
                <span className="text-ink">60 mins (78s sample)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-ink-muted" /> Provider
                </span>
                <span className="text-accent font-mono text-[11px]">
                  Deepgram Nova-3 (Multilingual)
                </span>
              </div>
            </div>

            {/* Audio Waveform Player Widget */}
            <div className="p-4 rounded-lg bg-subtle border border-line space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-accent hover:opacity-90 text-on-accent flex items-center justify-center transition cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <span className="text-xs font-mono text-ink-secondary">
                    {formatMs(currentTimeMs)} / 01:20
                  </span>
                </div>
                <Volume2 className="w-4 h-4 text-ink-muted" />
              </div>

              {/* Scrubber bar — themed via inline var() since range tracks don't accept classes */}
              <input
                type="range"
                min="0"
                max="80000"
                step="1000"
                value={currentTimeMs}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg cursor-pointer"
                style={{ accentColor: "var(--accent-primary)" }}
              />
              <div className="text-[10px] text-ink-muted text-center font-albert">
                Click any utterance turn below to jump audio to that exact
                moment
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabbed Viewer (Transcript / MOM) */}
        <div className="lg:col-span-2 bg-card border border-line rounded-xl overflow-hidden flex flex-col shadow-2xs">
          {/* Tabs with sliding underline indicator */}
          <div className="relative flex items-center border-b border-line bg-subtle/40 px-4">
            <button
              onClick={() => setActiveTab("transcript")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium font-albert transition-colors duration-200 cursor-pointer"
            >
              <FileText
                className={`w-3.5 h-3.5 ${
                  activeTab === "transcript" ? "text-accent" : "text-ink-muted"
                }`}
              />
              <span
                className={
                  activeTab === "transcript" ? "text-ink" : "text-ink-muted"
                }
              >
                Diarized Transcript ({utterances.length} turns)
              </span>
            </button>
            <button
              onClick={() => setActiveTab("mom")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium font-albert transition-colors duration-200 cursor-pointer"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  activeTab === "mom" ? "text-accent" : "text-ink-muted"
                }`}
              />
              <span
                className={
                  activeTab === "mom" ? "text-ink" : "text-ink-muted"
                }
              >
                Executive MOM &amp; Decisions
              </span>
            </button>

            {/* Sliding indicator (220ms, ease-standard) */}
            <span
              className="tab-indicator absolute bottom-0 h-0.5 bg-accent rounded-full w-1/2 left-4"
              style={{
                transform:
                  activeTab === "transcript"
                    ? "translateX(0)"
                    : "translateX(100%)",
                width: "calc(50% - 1rem)",
              }}
            />
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto max-h-[580px]">
            {activeTab === "transcript" ? (
              <div className="space-y-3">
                {utterances.map((u) => {
                  const isCurrent =
                    currentTimeMs >= u.startMs &&
                    currentTimeMs <= (u.endMs || u.startMs + 15000);

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSeek(u.startMs)}
                      className={`p-3.5 rounded-lg border transition-all duration-200 ease-out cursor-pointer ${
                        isCurrent
                          ? "bg-accent-soft border-accent/60 shadow-sm"
                          : "bg-subtle border-line hover:border-line-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-card border border-line flex items-center justify-center text-[9px] text-ink-secondary font-semibold shrink-0">
                            {(u.speakerName || u.speakerLabel || "SP")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-ink font-albert truncate">
                            {u.speakerName || u.speakerLabel}
                          </span>
                          <span className="text-[10px] text-ink-muted font-mono shrink-0">
                            {formatMs(u.startMs)}
                          </span>
                        </div>
                        {u.type && (
                          <span
                            className={`text-[10px] border px-2 py-0.5 rounded font-mono shrink-0 ${
                              typeColors[u.type] || typeColors.INFORMATION
                            }`}
                          >
                            {u.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-secondary leading-relaxed font-albert">
                        {u.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-label-sm font-semibold uppercase tracking-wider text-ink-muted font-albert">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-ink-secondary bg-subtle p-4 rounded-lg border border-line leading-relaxed font-albert">
                    {mom?.executiveSummary ||
                      "The engineering team confirmed the successful standardization on PostgreSQL 18 with MVCC concurrency and Deepgram Nova-3 speech diarization. Zero database locks observed during multi-worker BullMQ load."}
                  </p>
                </div>

                {/* Key Decisions */}
                <div className="space-y-2">
                  <h3 className="text-label-sm font-semibold uppercase tracking-wider text-ink-muted font-albert">
                    Key Decisions Finalized
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-subtle border border-line rounded-lg text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-ink font-albert">
                          Standardize on PostgreSQL 18 and Deepgram Nova-3
                        </span>
                        <p className="text-ink-muted text-[11px] mt-0.5 font-albert">
                          Confirmed at 00:46 by Alex Rivera
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  <h3 className="text-label-sm font-semibold uppercase tracking-wider text-ink-muted font-albert">
                    Action Items &amp; Deliverables
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3.5 bg-subtle border border-line rounded-lg text-xs flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="font-medium text-ink font-albert">
                          Deploy NestJS backend API services
                        </div>
                        <div className="text-[11px] text-ink-muted font-albert">
                          Assignee: Sarah Chen &middot; Audio timestamp: 01:03
                        </div>
                      </div>
                      <button
                        onClick={() => handlePromoteActionItem("act_sample_seed")}
                        className="flex items-center gap-1.5 bg-accent-soft text-accent hover:opacity-80 border border-accent/30 text-xs font-albert px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
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
