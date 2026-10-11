"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  Plus,
  DollarSign,
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  Table as TableIcon,
  Tag,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function CrmPage() {
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("deals");
  const [records, setRecords] = useState<any[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [dealName, setDealName] = useState("");
  const [dealAmount, setDealAmount] = useState("75000");
  const [dealStage, setDealStage] = useState("proposal");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadObjects() {
      try {
        const res = await fetchApi<any[]>("/crm/objects");
        setObjects(res);
        if (res.length > 0) {
          setSelectedSlug(res[0].slug);
        }
      } catch (err) {
        console.error("Failed to load CRM objects:", err);
      }
    }
    loadObjects();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [selectedSlug]);

  async function loadRecords() {
    try {
      const res = await fetchApi<any[]>(`/crm/records/${selectedSlug}`);
      setRecords(res);
    } catch (err) {
      console.error("Failed to load CRM records:", err);
    }
  }

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName) return;

    try {
      await fetchApi(`/crm/records/${selectedSlug}`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            name: dealName,
            amount: Number(dealAmount),
            stage: dealStage,
          },
        }),
      });
      setStatusMsg("CRM record created successfully in PostgreSQL JSONB!");
      setIsRecordModalOpen(false);
      setDealName("");
      setTimeout(() => setStatusMsg(null), 2500);
      loadRecords();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const stageColors: Record<string, string> = {
    prospect: "bg-zinc-800 text-zinc-400 border-zinc-700",
    proposal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    negotiation: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            Twenty CRM Custom Data Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic schema entities backed by PostgreSQL 18 JSONB with GIN indexing.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Record</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Object Selector Pills */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setSelectedSlug("deals")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedSlug === "deals"
              ? "bg-zinc-800 text-white border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Deals (Opportunities)</span>
        </button>
        <button
          onClick={() => setSelectedSlug("partners")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedSlug === "partners"
              ? "bg-zinc-800 text-white border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span>Partners</span>
        </button>
        <button
          onClick={() => setSelectedSlug("candidates")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedSlug === "candidates"
              ? "bg-zinc-800 text-white border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Candidates</span>
        </button>
      </div>

      {/* Dynamic Data Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Deal Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No records found in this entity table.
                  </td>
                </tr>
              ) : (
                records.map((r: any) => {
                  const data = r.data || {};
                  return (
                    <tr key={r.id} className="hover:bg-zinc-800/30 transition">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                        <Tag className="w-3 h-3 text-zinc-500" />
                        <span>{data.name || "Enterprise License"}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-200">
                        ${Number(data.amount || 50000).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] border px-2 py-0.5 rounded font-mono ${
                            stageColors[data.stage] || stageColors.prospect
                          }`}
                        >
                          {data.stage || "prospect"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-semibold text-white">Create CRM Record</h2>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Deal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Globex Cloud Migration"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Amount ($)</label>
                <input
                  type="number"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300">Stage</label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="prospect">Prospect</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Closed Won</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
