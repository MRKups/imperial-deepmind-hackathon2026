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
    <div className="space-y-4 sm:space-y-5">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
        {/* Stream Filter Pills with Generous Touch Targets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Records" },
            { id: "wearables", label: "Wearables" },
            { id: "spending", label: "Spending" },
            { id: "lifestyle", label: "Lifestyle" },
            { id: "fitness", label: "Fitness" },
            { id: "profile", label: "Medical & Trips" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gray-950 text-white shadow-xs font-semibold"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
            placeholder="Search date, gym..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-44 text-sm bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-500"
          />

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-3 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            {sortOrder === "desc" ? "Newest ↓" : "Oldest ↑"}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Tab: Medical Profile & Travel */}
      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <span className="font-bold text-base text-gray-950 block border-b pb-2">
              Medical Profile
            </span>
            <dl className="space-y-2.5 text-gray-700 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">User:</dt>
                <dd className="font-semibold text-gray-950">{dataset.profile.name} (Age {dataset.profile.age})</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Daily BMR Baseline:</dt>
                <dd className="font-semibold text-gray-950">{dataset.profile.baseline_bmr} kcal</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Medical Conditions:</dt>
                <dd className="font-semibold text-gray-950">{dataset.profile.medical_history?.conditions?.join(", ") || "None"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Current Medications:</dt>
                <dd className="font-semibold text-gray-950">{dataset.profile.medical_history?.medications?.join(", ") || "None"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Vaccinations:</dt>
                <dd className="font-semibold text-gray-950">{dataset.profile.medical_history?.vaccinations?.join(", ") || "None"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <span className="font-bold text-base text-gray-950 block border-b pb-2">
              Upcoming Travel
            </span>
            {dataset.travel_data?.upcoming_trips?.map((trip, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-2 text-gray-700 border border-gray-200 text-sm">
                <div className="flex justify-between font-bold text-gray-950 text-base">
                  <span>{trip.destination}</span>
                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs uppercase font-bold">
                    {trip.status}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">
                  {trip.start_date} → {trip.end_date} (Flight {trip.flight})
                </p>
                {trip.vaccination_alerts && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-800 text-xs block mb-1">Health Advisories:</span>
                    <ul className="text-gray-700 list-disc list-inside space-y-1 text-xs sm:text-sm">
                      {trip.vaccination_alerts.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )) || <p className="text-gray-500">No travel scheduled.</p>}
          </div>
        </div>
      ) : (
        /* Legible Table with Comfortable Row Heights */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-gray-100/80 text-gray-900 font-bold border-b border-gray-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  {(activeTab === "all" || activeTab === "wearables") && (
                    <>
                      <th className="py-3.5 px-3.5">Sleep (Total)</th>
                      <th className="py-3.5 px-3.5">Scores (Oura/Whoop)</th>
                      <th className="py-3.5 px-3.5">Resting HR / HRV</th>
                      <th className="py-3.5 px-3.5">Steps</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "lifestyle") && (
                    <>
                      <th className="py-3.5 px-3.5">Screen Time</th>
                      <th className="py-3.5 px-3.5">Doomscrolling</th>
                      <th className="py-3.5 px-3.5">Water</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "spending") && (
                    <>
                      <th className="py-3.5 px-3.5">Deliveroo</th>
                      <th className="py-3.5 px-3.5">Coffee</th>
                      <th className="py-3.5 px-3.5">Groceries</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "fitness") && (
                    <>
                      <th className="py-3.5 px-3.5">Gym Activity</th>
                      <th className="py-3.5 px-3.5">Duration</th>
                      <th className="py-3.5 px-3.5">Cal In / Out</th>
                    </>
                  )}
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-sm">
                {filteredRecords.map((r, idx) => (
                  <tr
                    key={r.date || idx}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-3 px-4 font-bold text-gray-950">{r.date}</td>

                    {(activeTab === "all" || activeTab === "wearables") && (
                      <>
                        <td className="py-3 px-3.5 font-medium">
                          {r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? "-"}h
                        </td>
                        <td className="py-3 px-3.5 text-gray-600">
                          {r.wearables?.oura_ring?.sleep_score ?? "-"}/100 · {r.wearables?.whoop?.recovery_score ?? "-"}%
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-gray-900">
                          {r.wearables?.whoop?.resting_heart_rate ?? r.avg_heart_rate ?? "-"} bpm{" "}
                          <span className="text-gray-500 font-normal">({r.wearables?.whoop?.hrv_ms ?? "-"} ms)</span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-gray-900">
                          {(r.wearables?.apple_watch?.step_count ?? 0).toLocaleString()}
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "lifestyle") && (
                      <>
                        <td className="py-3 px-3.5 font-medium text-gray-950">
                          {r.lifestyle?.screen_time_hours ?? r.screen_time ?? "-"}h
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          {r.lifestyle?.doomscrolling_mins ?? "-"} mins
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          {r.lifestyle?.water_intake_liters ?? "-"} L
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "spending") && (
                      <>
                        <td className="py-3 px-3.5 font-semibold text-gray-950">
                          £{(r.spending?.deliveroo_takeaway ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          £{(r.spending?.coffee_shops ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          £{(r.spending?.groceries_and_food ?? 0).toFixed(2)}
                        </td>
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "fitness") && (
                      <>
                        <td className="py-3 px-3.5 font-medium text-gray-950">
                          {r.fitness?.gym_activity ?? r.gym_activity ?? "Rest"}
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          {r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0} mins
                        </td>
                        <td className="py-3 px-3.5 text-gray-700">
                          {r.calories_in} / {r.calories_out}
                        </td>
                      </>
                    )}

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
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

      {/* JSON Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-gray-950 text-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <span className="font-bold text-sm sm:text-base font-mono">
                Record: {selectedRecord.date}
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs sm:text-sm text-emerald-400 bg-black/60">
              <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-2 text-sm">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                  alert("Copied JSON record to clipboard.");
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-950 rounded-xl font-bold"
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
