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
      "Doomscrolling (min)",
      "Resting HR (bpm)",
      "HRV (ms)",
      "Steps",
      "Stand Hours",
      "Gym Activity",
      "Gym Duration (min)",
      "Coffee Spend (£)",
      "Takeaway Spend (£)",
      "Groceries Spend (£)",
      "Water (L)"
    ];

    const rows = filteredRecords.map((r) => [
      r.date,
      r.calories_in,
      r.calories_out,
      r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? "",
      r.lifestyle?.screen_time_hours ?? r.screen_time ?? "",
      r.lifestyle?.doomscrolling_mins ?? "",
      r.wearables?.whoop?.resting_heart_rate ?? r.avg_heart_rate ?? "",
      r.wearables?.whoop?.hrv_ms ?? "",
      r.wearables?.apple_watch?.step_count ?? "",
      r.wearables?.apple_watch?.stand_hours ?? r.stand_hours ?? "",
      `"${r.fitness?.gym_activity ?? r.gym_activity ?? "Rest"}"`,
      r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0,
      r.spending?.coffee_shops ?? 0,
      r.spending?.deliveroo_takeaway ?? 0,
      r.spending?.groceries_and_food ?? 0,
      r.lifestyle?.water_intake_liters ?? ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_raw_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Stream Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Master Feed", count: records.length },
            { id: "wearables", label: "Wearables & Vitals" },
            { id: "spending", label: "Spending & Food" },
            { id: "lifestyle", label: "Lifestyle & Screen" },
            { id: "fitness", label: "Fitness & Gym" },
            { id: "profile", label: "Medical & Travel" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Filter and Export */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              placeholder="Search date, activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1"
            title="Toggle Date Sort Order"
          >
            <span>Date</span>
            <span>{sortOrder === "desc" ? "↓ (Newest)" : "↑ (Oldest)"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 6: Profile & Travel View */}
      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Medical & Demographic Profile
              </h3>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-200">
                Authoritative (Level 1)
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <dt className="text-gray-500 font-medium">User Identifier:</dt>
              <dd className="font-mono text-gray-900">{dataset.profile.id}</dd>
              <dt className="text-gray-500 font-medium">Name & Age:</dt>
              <dd className="font-semibold text-gray-900">
                {dataset.profile.name} ({dataset.profile.age} years)
              </dd>
              <dt className="text-gray-500 font-medium">Baseline BMR:</dt>
              <dd className="text-gray-900 font-semibold">{dataset.profile.baseline_bmr} kcal/day</dd>
              <dt className="text-gray-500 font-medium">Stated Conditions:</dt>
              <dd className="text-gray-900">
                {dataset.profile.medical_history?.conditions?.join(", ") || "None recorded"}
              </dd>
              <dt className="text-gray-500 font-medium">Known Allergies:</dt>
              <dd className="text-gray-900">
                {dataset.profile.medical_history?.allergies?.join(", ") || "None"}
              </dd>
              <dt className="text-gray-500 font-medium">Current Prescriptions:</dt>
              <dd className="text-gray-900">
                {dataset.profile.medical_history?.medications?.join(", ") || "None"}
              </dd>
              <dt className="text-gray-500 font-medium">Vaccination History:</dt>
              <dd className="text-gray-900">
                {dataset.profile.medical_history?.vaccinations?.join(", ") || "None"}
              </dd>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Extracted Calendar & Travel Obligations
              </h3>
              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-semibold border border-purple-200">
                Gmail Event Stream
              </span>
            </div>
            {dataset.travel_data?.upcoming_trips?.map((trip, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{trip.destination}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    {trip.status?.toUpperCase() || "CONFIRMED"}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">Dates:</span> {trip.start_date} →{" "}
                  {trip.end_date} (Flight {trip.flight})
                </p>
                {trip.vaccination_alerts && trip.vaccination_alerts.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-700 block mb-1">
                      Vaccination / Medical Advisories:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                      {trip.vaccination_alerts.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )) || <p className="text-xs text-gray-500">No travel events recorded.</p>}
          </div>
        </div>
      ) : (
        /* Tabular Records Feed */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead className="bg-gray-100/90 text-gray-800 font-bold border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  {(activeTab === "all" || activeTab === "wearables") && (
                    <>
                      <th className="py-3 px-3">Sleep (Total / Deep / REM)</th>
                      <th className="py-3 px-3">Oura / Whoop Score</th>
                      <th className="py-3 px-3">Resting HR / HRV</th>
                      <th className="py-3 px-3">Steps / Stand</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "lifestyle") && (
                    <>
                      <th className="py-3 px-3">Screen Time (h)</th>
                      <th className="py-3 px-3">Doomscrolling</th>
                      <th className="py-3 px-3">Water (L)</th>
                      <th className="py-3 px-3">Alcohol / Alarms</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "spending") && (
                    <>
                      <th className="py-3 px-3">Deliveroo (£)</th>
                      <th className="py-3 px-3">Coffee (£)</th>
                      <th className="py-3 px-3">Groceries (£)</th>
                      <th className="py-3 px-3">Transport (£)</th>
                    </>
                  )}
                  {(activeTab === "all" || activeTab === "fitness") && (
                    <>
                      <th className="py-3 px-3">Gym Activity</th>
                      <th className="py-3 px-3">Duration (mins)</th>
                      <th className="py-3 px-3">Calories In / Out</th>
                    </>
                  )}
                  <th className="py-3 px-3 text-right">Raw JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {filteredRecords.map((r, idx) => (
                  <tr
                    key={r.date || idx}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-2.5 px-3.5 font-bold text-gray-900 font-sans">
                      {r.date}
                    </td>

                    {/* Wearables */}
                    {(activeTab === "all" || activeTab === "wearables") && (
                      <>
                        <td className="py-2.5 px-3">
                          {r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? "-"}h
                          <span className="text-gray-400 font-normal ml-1">
                            ({r.wearables?.oura_ring?.deep_sleep_hours ?? "-"}d /{" "}
                            {r.wearables?.oura_ring?.rem_sleep_hours ?? "-"}r)
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 font-semibold">
                            {r.wearables?.oura_ring?.sleep_score ?? "-"}/100
                          </span>
                          <span className="ml-1 text-gray-500">
                            Rec: {r.wearables?.whoop?.recovery_score ?? "-"}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-900">
                            {r.wearables?.whoop?.resting_heart_rate ?? r.avg_heart_rate ?? "-"} bpm
                          </span>
                          <span className="ml-1 text-gray-500">
                            ({r.wearables?.whoop?.hrv_ms ?? "-"} ms)
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {(r.wearables?.apple_watch?.step_count ?? 0).toLocaleString()} st
                          <span className="text-gray-400 ml-1">
                            ({r.wearables?.apple_watch?.stand_hours ?? r.stand_hours ?? "-"}h)
                          </span>
                        </td>
                      </>
                    )}

                    {/* Lifestyle */}
                    {(activeTab === "all" || activeTab === "lifestyle") && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-indigo-900">
                          {r.lifestyle?.screen_time_hours ?? r.screen_time ?? "-"}h
                        </td>
                        <td className="py-2.5 px-3 text-rose-800">
                          {r.lifestyle?.doomscrolling_mins ?? "-"} min
                        </td>
                        <td className="py-2.5 px-3 text-cyan-800">
                          {r.lifestyle?.water_intake_liters ?? "-"} L
                        </td>
                        <td className="py-2.5 px-3">
                          {r.lifestyle?.alcohol_units ?? 0} units
                          <span className="text-gray-400 ml-1">
                            ({r.lifestyle?.snoozed_alarms_count ?? 0} snoozes)
                          </span>
                        </td>
                      </>
                    )}

                    {/* Spending */}
                    {(activeTab === "all" || activeTab === "spending") && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-amber-900">
                          £{(r.spending?.deliveroo_takeaway ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          £{(r.spending?.coffee_shops ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          £{(r.spending?.groceries_and_food ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          £{(r.spending?.transport ?? 0).toFixed(2)}
                        </td>
                      </>
                    )}

                    {/* Fitness */}
                    {(activeTab === "all" || activeTab === "fitness") && (
                      <>
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-800">
                          {r.fitness?.gym_activity ?? r.gym_activity ?? "Rest"}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0} min
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          <span className="text-emerald-700 font-semibold">{r.calories_in}</span> /{" "}
                          <span className="text-orange-700">{r.calories_out}</span>
                        </td>
                      </>
                    )}

                    {/* JSON Inspector Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="px-2 py-1 text-[11px] font-sans font-semibold rounded bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 border border-gray-200 transition-colors"
                      >
                        Inspect {"{}"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between font-sans">
            <span>Showing {filteredRecords.length} records. Direct un-biased raw stream.</span>
            <span className="italic">Click any row to inspect underlying JSON.</span>
          </div>
        </div>
      )}

      {/* Raw Record JSON Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-gray-900 text-gray-100 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Raw JSON Record — {selectedRecord.date}
                </h3>
                <p className="text-xs text-gray-400">Zero transformations or algorithmic weighting</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-gray-950/80">
              <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                  alert("Copied raw record JSON to clipboard.");
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
