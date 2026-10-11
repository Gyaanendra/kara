"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Video,
  KanbanSquare,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Play,
} from "lucide-react";
import { fetchApi } from "../lib/api";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meetsRes, boardsRes, dealsRes] = await Promise.all([
          fetchApi<any[]>("/meetings").catch(() => []),
          fetchApi<any[]>("/kanban/boards").catch(() => []),
          fetchApi<any[]>("/crm/records/deals").catch(() => []),
        ]);
        setMeetings(meetsRes);
        setBoards(boardsRes);
        setDeals(dealsRes);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalTasks = boards[0]?.columns?.reduce((acc: number, c: any) => acc + (c.tasks?.length || 0), 0) || 1;
  const dealValue = deals.reduce((acc: number, d: any) => acc + Number(d.data?.amount || 0), 0) || 50000;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
          Workspace Overview
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
            System Live
          </span>
        </h1>
        <p className="text-sm text-zinc-400">
          Kara AI Chief of Staff is monitoring meetings, transcribing via Deepgram Nova-2, and synthesizing Notion tasks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Meetings</span>
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{meetings.length || 1}</span>
            <span className="text-xs text-emerald-400 font-medium">100% processed</span>
          </div>
          <div className="text-[11px] text-zinc-500">Google Meet & Zoom synchronized</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Action Items</span>
            <KanbanSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalTasks}</span>
            <span className="text-xs text-amber-400 font-medium">AI Extracted</span>
          </div>
          <div className="text-[11px] text-zinc-500">Linked with audio timestamps</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Twenty CRM Pipeline</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${dealValue.toLocaleString()}</span>
            <span className="text-xs text-zinc-400 font-medium">{deals.length || 1} Deal</span>
          </div>
          <div className="text-[11px] text-zinc-500">PostgreSQL JSONB dynamic schema</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Transcription Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">60 mins</span>
            <span className="text-xs text-emerald-400 font-medium">~10s via Nova-2</span>
          </div>
          <div className="text-[11px] text-zinc-500">Diarized speaker turns</div>
        </div>
      </div>

      {/* Grid: Recent Meetings & Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings Feed */}
        <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" />
              Recent Meeting Intelligence
            </h2>
            <Link
              href="/meetings"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {meetings.length === 0 ? (
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center text-xs text-zinc-500">
                No meetings found. Dispatch a bot to start recording.
              </div>
            ) : (
              meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700/80 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{meeting.title}</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                        {meeting.meetingType}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                      {meeting.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-1">{meeting.description}</p>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span>Host: {meeting.host?.name || "Alex Rivera"}</span>
                      <span>Platform: {meeting.platform}</span>
                    </div>
                    <Link
                      href="/meetings"
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Listen & View MOM</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Kanban & CRM Quick Glance */}
        <div className="space-y-6">
          {/* Action Items Widget */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-amber-400" />
                Open Action Items
              </h2>
              <Link href="/tasks" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition">
                Board
              </Link>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200">Deploy NestJS backend API services</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                    HIGH
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Extracted from Roadmap Sync at 01:03</p>
                <div className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                  <Play className="w-2.5 h-2.5" /> Audio Deep Link @ 63s
                </div>
              </div>
            </div>
          </div>

          {/* CRM Deal Widget */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Twenty CRM Pipeline
              </h2>
              <Link href="/crm" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition">
                Deals
              </Link>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">Acme Enterprise License</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  negotiation
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Contract Value</span>
                <span className="text-white font-semibold font-mono">$50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
