"use client";

import React, { useState, useMemo } from "react";
import { HealthDataset } from "../lib/types";
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

  const plainEnglishStages = [
    {
      step: 1,
      title: "Step 1: Check the Numbers",
      subtitle: "Calculates medication & dates",
      badge: "Accurate Math"
    },
    {
      step: 2,
      title: "Step 2: Pick Priority & Protect Privacy",
      subtitle: "Finds #1 task & hides personal info",
      badge: "100% Private"
    },
    {
      step: 3,
      title: "Step 3: Check Health Guidelines",
      subtitle: "Looks up vaccine & pharmacy rules",
      badge: "Standard Rules"
    },
    {
      step: 4,
      title: "Step 4: Your Morning Action Plan",
      subtitle: "3 lines you can act on today",
      badge: "Done in 10s"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Friendly Header */}
      <div className="space-y-3 border-b border-gray-200/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Analysis Agent
          </h1>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
            Active · Checks every morning at 7:00 AM
          </span>
        </div>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Instead of giving you a long dashboard to scroll through, your Analysis Agent looks at your
          calendar, medications, and habits to find <strong>one practical task</strong> you can take
          care of today before it becomes an issue.
        </p>

        {/* Friendly Example Selector */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-gray-500 block mb-1.5">
            Try a real-life example scenario:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedExampleId === ex.id
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Result: What You Read on Your Phone at 7:00 AM */}
      <div className="max-w-md mx-auto">
        <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-xs border border-gray-200/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Morning Notification · 7:00 AM
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Takes 5 seconds to read
            </span>
          </div>

          {/* 3 Clear Lines */}
          <div className="space-y-2 text-sm sm:text-base leading-relaxed">
            <p className="font-medium text-gray-900">
              {stage4_passB.line_1}
            </p>
            <p className="text-gray-600 text-sm">
              {stage4_passB.line_2}
            </p>
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
              <p className="font-bold text-emerald-900 text-sm">
                {stage4_passB.action}
              </p>
            </div>

            {stage4_passB.secondaries.map((sec, i) => (
              <p key={i} className="text-xs text-gray-500 pt-1">
                {sec}
              </p>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-gray-400 text-center">
            One clear action you can do this week — no confusing medical jargon.
          </div>
        </div>
      </div>

      {/* How the Agent Figured This Out (4 Steps in Plain English) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            How the Analysis Agent works behind the scenes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tap each step below to see the plain-English breakdown:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {plainEnglishStages.map((st) => (
            <button
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-3 rounded-xl text-left border text-xs transition-all ${
                activeStage === st.step
                  ? "bg-white border-gray-900 shadow-xs font-semibold text-gray-900"
                  : "bg-white border-gray-200/80 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="block font-medium">{st.title}</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">{st.badge}</span>
            </button>
          ))}
        </div>

        {/* Step Explanation Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-xs space-y-3">
          {/* Step 1 */}
          {activeStage === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Step 1: Check the Numbers (Accurate Math, No Guessing)
                </span>
                <span className="text-gray-500">
                  {stage1_triggers.length} potential items checked
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The agent calculates the exact days of medication you have left, checks your calendar
                for upcoming trips, and looks at recent habit changes. It uses exact arithmetic so
                there is never any hallucination or guesswork.
              </p>
              <div className="space-y-2 pt-1">
                {stage1_triggers.slice(0, 3).map((trig, idx) => (
                  <div
                    key={trig.id}
                    className={`p-3 rounded-xl border ${
                      idx === 0
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-gray-50 border-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-medium text-gray-900">
                        {idx === 0 ? "⭐️ Top Priority: " : ""}
                        {trig.title}
                      </span>
                      <span className="font-semibold text-gray-700">
                        Priority score: {trig.final_score}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{trig.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {activeStage === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Step 2: Pick the #1 Priority & Strip Personal Information
                </span>
                <span className="text-emerald-700 font-semibold">🔒 Privacy Protected</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The agent picks the single most urgent finding and removes your name, date of birth,
                and email. When looking up advice, the cloud model only receives a general question
                (like &ldquo;How far in advance should someone get a travel vaccine?&rdquo;) without
                ever knowing who you are.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                <span className="font-semibold text-gray-900 block">De-Identified Question:</span>
                <p className="text-gray-700 italic">
                  &ldquo;{stage2_passA.research_question || "No outside lookup needed for this item."}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {activeStage === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Step 3: Check Health Guidelines & Deadlines
                </span>
                <span className="text-gray-500">Official turnaround times</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The system checks official rules for deadlines (for example: NHS repeat prescriptions
                usually take 5 working days, and travel vaccines take 10–14 days to take effect).
              </p>
              {stage3_research ? (
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                  <p className="font-medium text-gray-900">{stage3_research.answer}</p>
                  <p className="text-gray-500 text-[11px]">
                    Required lead time: <strong>{stage3_research.lead_time_days} days before departure</strong>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">This item is based purely on your personal schedule.</p>
              )}
            </div>
          )}

          {/* Step 4 */}
          {activeStage === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Step 4: Create Your 3-Line Action Plan
                </span>
                <span className="text-emerald-700 font-semibold">Under 30 words</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The agent puts the verified facts together into a clear, 3-line message with one
                specific task you can do this week.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-gray-800">
                <p><strong>1. What we noticed:</strong> {stage4_passB.line_1}</p>
                <p><strong>2. Why it matters today:</strong> {stage4_passB.line_2}</p>
                <p className="text-emerald-700 font-semibold"><strong>3. What to do:</strong> {stage4_passB.action}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Medical Background Sandbox (Explained Simply) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 text-xs">
        <div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-sm">
              See How Your Medical Background Changes Advice
            </span>
            <span className="text-gray-500">
              {customConditions.includes("Type 2 diabetes") ? "Alert level: Active (Type 2 Diabetes)" : "Alert level: Standard"}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Eating fast food several times a week might be ordinary for a healthy person, but if someone
            has diabetes or high blood pressure, the agent prioritizes it to help keep you healthy.
            Tap below to see how advice adapts:
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isChecked
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
