"use client";

import React, { useState, useMemo, useEffect } from "react";
import { HealthDataset, ResearchOutput } from "../lib/types";
import {
  executeAgentPipeline,
  WORKED_EXAMPLES
} from "../lib/agent-pipeline";

interface PipelineStageVisualizerProps {
  dataset: HealthDataset;
}

export default function PipelineStageVisualizer({ dataset }: PipelineStageVisualizerProps) {
  const [selectedExampleId, setSelectedExampleId] = useState<string>("example_1");
  const [activeStage, setActiveStage] = useState<number>(4);
  const [customConditions, setCustomConditions] = useState<string[]>([
    "Type 2 diabetes",
    "Mild asthma"
  ]);

  const handleToggleCondition = (cond: string) => {
    if (customConditions.includes(cond)) {
      setCustomConditions(customConditions.filter((c) => c !== cond));
    } else {
      setCustomConditions([...customConditions, cond]);
    }
  };

  const pipelineResult = useMemo(() => {
    return executeAgentPipeline(dataset, "2026-08-22", customConditions);
  }, [dataset, customConditions]);

  const { stage1_triggers, stage2_passA, stage3_research, stage4_passB } = pipelineResult;

  // Step 3 live mode: send the sanitized zero-PII question to the real
  // Gemini API via our server route; fall back to the simulated response.
  const [liveResearch, setLiveResearch] = useState<ResearchOutput | null>(null);
  const [researchMode, setResearchMode] = useState<"simulated" | "loading" | "live">(
    "simulated"
  );

  useEffect(() => {
    const question = stage2_passA.research_question;
    if (!question) {
      setLiveResearch(null);
      setResearchMode("simulated");
      return;
    }
    let cancelled = false;
    setResearchMode("loading");
    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: ResearchOutput) => {
        if (cancelled) return;
        setLiveResearch(data);
        setResearchMode("live");
      })
      .catch(() => {
        if (cancelled) return;
        setLiveResearch(null);
        setResearchMode("simulated");
      });
    return () => {
      cancelled = true;
    };
  }, [stage2_passA.research_question]);

  const displayResearch = liveResearch ?? stage3_research;

  const plainEnglishStages = [
    {
      step: 1,
      title: "Step 1: Check the Numbers",
      subtitle: "Medication supplies & dates",
      badge: "Exact Math"
    },
    {
      step: 2,
      title: "Step 2: Priority & Privacy",
      subtitle: "Finds #1 task & strips info",
      badge: "100% Private"
    },
    {
      step: 3,
      title: "Step 3: Health Rules",
      subtitle: "Vaccine & pharmacy rules",
      badge: "Standard Times"
    },
    {
      step: 4,
      title: "Step 4: Morning Plan",
      subtitle: "3-line action reminder",
      badge: "Actionable"
    }
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Friendly, Legible Header */}
      <div className="space-y-3.5 border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            Analysis Agent
          </h1>
          <span className="text-xs sm:text-sm text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            Runs daily at 7:00 AM
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-700 max-w-3xl leading-relaxed">
          Instead of giving you a long dashboard to scroll through, your Analysis Agent looks at your
          calendar, medications, and habits to find <strong>one practical task</strong> you can take
          care of today before it becomes an issue.
        </p>

        {/* Example Selector with Comfortable Buttons */}
        <div className="pt-2">
          <span className="text-xs sm:text-sm font-bold text-gray-700 block mb-2">
            Try a real-life example scenario:
          </span>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {[
              { id: "example_1", label: "💊 Traveling with Medication", conds: ["Type 2 diabetes", "Mild asthma"] },
              { id: "example_2", label: "🥗 Food Habits & Medical History", conds: ["Type 2 diabetes"] },
              { id: "example_3", label: "☕ Afternoon Coffee & Sleep", conds: ["Caffeine dependency"] }
            ].map((ex) => (
              <button
                key={ex.id}
                onClick={() => {
                  setSelectedExampleId(ex.id);
                  setCustomConditions(ex.conds);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedExampleId === ex.id
                    ? "bg-gray-950 text-white shadow-xs"
                    : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Result Card (Large Legible Morning Briefing) */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white text-gray-950 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 border-b border-gray-100 pb-3">
            <span className="flex items-center gap-2 font-bold text-gray-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Morning Notification · 7:00 AM
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
              {stage4_passB.word_count} words · Fast 5s Read
            </span>
          </div>

          {/* 3 Clear Lines in Large, High-Contrast Typography */}
          <div className="space-y-3 text-base sm:text-lg leading-relaxed">
            <p className="font-semibold text-gray-950">
              {stage4_passB.line_1}
            </p>
            <p className="text-gray-700 text-sm sm:text-base">
              {stage4_passB.line_2}
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <p className="font-bold text-emerald-950 text-base sm:text-lg">
                {stage4_passB.action}
              </p>
            </div>

            {stage4_passB.secondaries.map((sec, i) => (
              <p key={i} className="text-sm text-gray-600 pt-1">
                {sec}
              </p>
            ))}
          </div>

          <div className="pt-2 text-xs sm:text-sm text-gray-500 text-center border-t border-gray-100">
            One clear action you can do this week — no confusing medical jargon.
          </div>
        </div>
      </div>

      {/* How It Works (4 Clear Steps) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-950">
            How the Analysis Agent works behind the scenes
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Tap each step below to see the plain-English explanation:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {plainEnglishStages.map((st) => (
            <button
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                activeStage === st.step
                  ? "bg-white border-gray-950 shadow-xs font-bold text-gray-950"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="block font-bold text-sm sm:text-base">{st.title}</span>
              <span className="text-xs sm:text-sm text-gray-500 block mt-1">{st.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Step Explanation Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs text-sm sm:text-base space-y-4">
          {/* Step 1 */}
          {activeStage === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-bold text-gray-950 text-base sm:text-lg">
                  Step 1: Check the Numbers (Accurate Math, No Guessing)
                </span>
                <span className="text-sm text-gray-500">
                  {stage1_triggers.length} items checked
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The agent calculates the exact days of medication you have left, checks your calendar
                for upcoming trips, and looks at recent habit changes. It uses exact arithmetic so
                there is never any AI hallucination or guesswork.
              </p>
              <div className="space-y-2.5 pt-1">
                {stage1_triggers.slice(0, 3).map((trig, idx) => (
                  <div
                    key={trig.id}
                    className={`p-4 rounded-2xl border ${
                      idx === 0
                        ? "bg-emerald-50/60 border-emerald-300"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-950 text-sm sm:text-base">
                        {idx === 0 ? "⭐️ Top Priority: " : ""}
                        {trig.title}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-gray-700">
                        Score: {trig.final_score}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{trig.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {activeStage === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-bold text-gray-950 text-base sm:text-lg">
                  Step 2: Pick the #1 Priority & Strip Personal Information
                </span>
                <span className="text-emerald-800 font-bold text-sm">🔒 100% Private</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The agent picks the single most urgent finding and removes your name, date of birth,
                and email. When looking up advice, the cloud model only receives a general question
                (like &ldquo;How far in advance should someone get a travel vaccine?&rdquo;) without
                ever knowing who you are.
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-200">
                <span className="font-bold text-gray-950 text-sm block">De-Identified Question Sent:</span>
                <p className="text-gray-800 italic text-sm sm:text-base">
                  &ldquo;{stage2_passA.research_question || "No outside lookup needed for this item."}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {activeStage === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-bold text-gray-950 text-base sm:text-lg">
                  Step 3: Check Health Guidelines & Deadlines
                </span>
                <span
                  className={
                    researchMode === "live"
                      ? "text-sm text-emerald-700 font-bold"
                      : "text-sm text-gray-500"
                  }
                >
                  {researchMode === "live"
                    ? "● Live Gemini answer"
                    : researchMode === "loading"
                      ? "Asking Gemini…"
                      : "Official turnaround times"}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The system checks official rules for deadlines (for example: NHS repeat prescriptions
                usually take 5 working days, and travel vaccines take 10–14 days to take effect).
              </p>
              {displayResearch ? (
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-200 text-sm sm:text-base">
                  <p className="font-semibold text-gray-950">{displayResearch.answer}</p>
                  {displayResearch.key_facts.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                      {displayResearch.key_facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-gray-600 text-sm">
                    Required lead time: <strong>{displayResearch.lead_time_days} days</strong> ·{" "}
                    {displayResearch.source_name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">This item is based purely on your personal schedule.</p>
              )}
            </div>
          )}

          {/* Step 4 */}
          {activeStage === 4 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-bold text-gray-950 text-base sm:text-lg">
                  Step 4: Create Your 3-Line Action Plan
                </span>
                <span className="text-emerald-800 font-bold text-sm">Under 30 words</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The agent puts the verified facts together into a clear, 3-line message with one
                specific task you can do this week.
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-sm sm:text-base text-gray-900 border border-gray-200">
                <p><strong>1. What we noticed:</strong> {stage4_passB.line_1}</p>
                <p><strong>2. Why it matters today:</strong> {stage4_passB.line_2}</p>
                <p className="text-emerald-800 font-bold"><strong>3. What to do:</strong> {stage4_passB.action}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Medical Background Sandbox (Legible & Clear) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-3.5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="font-bold text-gray-950 text-base sm:text-lg">
              See How Your Medical Background Changes Advice
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-600">
              {customConditions.includes("Type 2 diabetes") ? "Alert level: Active (Type 2 Diabetes)" : "Alert level: Standard"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Eating fast food several times a week might be ordinary for a healthy person, but if someone
            has diabetes or high blood pressure, the agent prioritizes it to help keep you healthy.
            Tap below to see how advice adapts:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "Type 2 diabetes",
            "Hypertension",
            "Mild asthma",
            "Cardiovascular disease",
            "Caffeine dependency"
          ].map((cond) => {
            const isChecked = customConditions.includes(cond);
            return (
              <button
                key={cond}
                onClick={() => handleToggleCondition(cond)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isChecked
                    ? "bg-gray-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {isChecked ? "✓ " : "+ "}
                {cond}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
