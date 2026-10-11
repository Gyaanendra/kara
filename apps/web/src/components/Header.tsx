"use client";

import React, { useState } from "react";
import { Search, Plus, Bell, CheckCircle2 } from "lucide-react";
import { fetchApi } from "../lib/api";

export function Header({ onRefresh }: { onRefresh?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl || !title) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await fetchApi("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title,
          meetingUrl,
          platform: meetingUrl.includes("zoom") ? "ZOOM" : "GOOGLE_MEET",
        }),
      });
      setStatusMessage("Bot dispatched successfully! Joining meeting...");
      setTimeout(() => {
        setIsModalOpen(false);
        setTitle("");
        setMeetingUrl("");
        setStatusMessage(null);
        onRefresh?.();
      }, 1500);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Command search trigger */}
        <div className="flex items-center gap-2 w-96 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs hover:border-zinc-700 cursor-pointer transition">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span>Ask Kara AI or search transcripts, tasks, deals...</span>
          <kbd className="ml-auto bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-zinc-700">
            Ctrl K
          </kbd>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch Meeting Bot</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-semibold cursor-pointer">
            AR
          </div>
        </div>
      </header>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-semibold text-white">Dispatch Kara Meeting Bot</h2>
            <p className="text-xs text-zinc-400">
              The bot will join your call, stream audio directly to RustFS S3, and trigger Deepgram Nova-2 speech diarization.
            </p>

            <form onSubmit={handleDispatch} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Executive Strategy Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Meeting URL (Google Meet / Zoom)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {statusMessage && (
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

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
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                >
                  {isSubmitting ? "Dispatching..." : "Launch Bot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
