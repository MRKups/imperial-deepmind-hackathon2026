"use client";

import React, { useState, useMemo } from "react";
import { HealthDataset, DailyRecord } from "../lib/types";

interface TabularDataGridProps {
  dataset: HealthDataset;
}

type TabType = "all" | "wearables" | "spending" | "lifestyle" | "fitness" | "profile";

export default function TabularDataGrid({ dataset }: TabularDataGridProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);

  const records = dataset.records || [];

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          r.date.includes(term) ||
          (r.fitness?.gym_activity?.toLowerCase().includes(term) ?? false) ||
          (r.gym_activity?.toLowerCase().includes(term) ?? false)
        );
      })
      .sort((a, b) => {
        return sortOrder === "desc"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      });
  }, [records, searchTerm, sortOrder]);

  const handleExportCSV = () => {
    if (!filteredRecords.length) return;
    const headers = [
      "Date",
      "Calories In",
      "Calories Out",
      "Sleep Hours",
      "Screen Time (h)",
      "Resting HR (bpm)",
      "HRV (ms)",
      "Steps",
      "Stand Hours",
      "Gym Activity",
      "Gym Duration (min)",
      "Coffee Spend (£)",
      "Takeaway Spend (£)",
      "Groceries Spend (£)"
    ];

    const rows = filteredRecords.map((r) => [
      r.date,
      r.calories_in,
      r.calories_out,
      r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? "",
      r.lifestyle?.screen_time_hours ?? r.screen_time ?? "",
      r.wearables?.whoop?.resting_heart_rate ?? r.avg_heart_rate ?? "",
      r.wearables?.whoop?.hrv_ms ?? "",
      r.wearables?.apple_watch?.step_count ?? "",
      r.wearables?.apple_watch?.stand_hours ?? r.stand_hours ?? "",
      `"${r.fitness?.gym_activity ?? r.gym_activity ?? "Rest"}"`,
      r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0,
      r.spending?.coffee_shops ?? 0,
      r.spending?.deliveroo_takeaway ?? 0,
      r.spending?.groceries_and_food ?? 0
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Minimal Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        {/* Stream Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "wearables", label: "Wearables" },
            { id: "spending", label: "Spending" },
            { id: "lifestyle", label: "Lifestyle" },
            { id: "fitness", label: "Fitness" },
            { id: "profile", label: "Profile" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Sort, Export */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-36 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:border-gray-400"
          />

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
          >
            {sortOrder === "desc" ? "Newest ↓" : "Oldest ↑"}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Tab: Medical Profile & Travel */}
      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs space-y-3">
            <span className="font-semibold text-gray-900 block">Medical Profile</span>
            <dl className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <dt className="text-gray-400">User:</dt>
                <dd className="font-medium text-gray-900">{dataset.profile.name} (Age {dataset.profile.age})</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">BMR Baseline:</dt>
                <dd className="font-medium text-gray-900">{dataset.profile.baseline_bmr} kcal</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Conditions:</dt>
                <dd className="font-medium text-gray-900">{dataset.profile.medical_history?.conditions?.join(", ") || "None"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Prescriptions:</dt>
                <dd className="font-medium text-gray-900">{dataset.profile.medical_history?.medications?.join(", ") || "None"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Vaccinations:</dt>
                <dd className="font-medium text-gray-900">{dataset.profile.medical_history?.vaccinations?.join(", ") || "None"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs space-y-3">
            <span className="font-semibold text-gray-900 block">Travel Obligations</span>
            {dataset.travel_data?.upcoming_trips?.map((trip, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-gray-600">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>{trip.destination}</span>
                  <span className="text-emerald-700 uppercase text-[10px]">{trip.status}</span>
                </div>
                <p className="text-gray-500">{trip.start_date} → {trip.end_date} (Flight {trip.flight})</p>
                {trip.vaccination_alerts && (
                  <ul className="text-gray-600 list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                    {trip.vaccination_alerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            )) || <p className="text-gray-400">No trips on file.</p>}
          </div>
        </div>
      ) : (
        /* Minimal Clean Table */
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/75 text-gray-700 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  {(activeTab === "all" || activeTab === "wearables") && (
                    <>
                      <th className="py-2.5 px-3">Sleep (Total)</th>
                      <th className="py-2.5 px-3">Scores (Oura/Whoop)</th>
                      <th className="py-2.5 px-3">Resting HR / HRV</th>
                      <th className="py-2.5 px-3">Steps</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "lifestyle") && (
                    <>
                      <th className="py-2.5 px-3">Screen Time</th>
                      <th className="py-2.5 px-3">Doomscrolling</th>
                      <th className="py-2.5 px-3">Water</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "spending") && (
                    <>
                      <th className="py-2.5 px-3">Deliveroo</th>
                      <th className="py-2.5 px-3">Coffee</th>
                      <th className="py-2.5 px-3">Groceries</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "fitness") && (
                    <>
                      <th className="py-2.5 px-3">Gym Activity</th>
                      <th className="py-2.5 px-3">Gym Mins</th>
                      <th className="py-2.5 px-3">Cal In / Out</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right">JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono text-[11px]">
                {filteredRecords.map((r, idx) => (
                  <tr
                    key={r.date || idx}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-2 px-3 font-sans font-medium text-gray-900">{r.date}</td>

                    {(activeTab === "all" || activeTab === "wearables") && (
                      <>
                        <td className="py-2 px-3">
                          {r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? "-"}h
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {r.wearables?.oura_ring?.sleep_score ?? "-"}/100 · {r.wearables?.whoop?.recovery_score ?? "-"}%
                        </td>
                        <td className="py-2 px-3 text-gray-900 font-medium">
                          {r.wearables?.whoop?.resting_heart_rate ?? r.avg_heart_rate ?? "-"} bpm ({r.wearables?.whoop?.hrv_ms ?? "-"}ms)
                        </td>
                        <td className="py-2 px-3">
                          {(r.wearables?.apple_watch?.step_count ?? 0).toLocaleString()}
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "lifestyle") && (
                      <>
                        <td className="py-2 px-3 text-gray-900">
                          {r.lifestyle?.screen_time_hours ?? r.screen_time ?? "-"}h
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {r.lifestyle?.doomscrolling_mins ?? "-"} min
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {r.lifestyle?.water_intake_liters ?? "-"} L
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "spending") && (
                      <>
                        <td className="py-2 px-3 text-gray-900 font-medium">
                          £{(r.spending?.deliveroo_takeaway ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          £{(r.spending?.coffee_shops ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          £{(r.spending?.groceries_and_food ?? 0).toFixed(2)}
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "fitness") && (
                      <>
                        <td className="py-2 px-3 font-sans text-gray-900">
                          {r.fitness?.gym_activity ?? r.gym_activity ?? "Rest"}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0}m
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {r.calories_in} / {r.calories_out}
                        </td>
                      </>
                    )}

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="text-[10px] font-sans text-gray-400 hover:text-gray-900 underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Minimal JSON Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-gray-900 text-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <span className="font-semibold text-xs font-mono">{selectedRecord.date}.json</span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-black/50">
              <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                  alert("Copied JSON.");
                }}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md font-medium"
              >
                Copy
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-900 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
