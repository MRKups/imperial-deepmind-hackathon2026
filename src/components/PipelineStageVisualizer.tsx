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

  const stages = [
    { step: 1, title: "1. Trigger Engine", subtitle: "Arithmetic" },
    { step: 2, title: "2. Pass A", subtitle: "Hero & PII Gate" },
    { step: 3, title: "3. Research", subtitle: "Cloud Guideline" },
    { step: 4, title: "4. Pass B", subtitle: "Lock Screen (<30w)" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Scenario Switcher */}
      <div className="space-y-3 border-b border-gray-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Anticipatory Health Agent
          </h1>
          <span className="text-xs text-gray-400 font-mono">AGENT.md v1.0</span>
        </div>
        <p className="text-xs text-gray-500 max-w-xl">
          Deterministic code computes arithmetic. Gemma phrases. Cloud receives zero PII. Exactly one
          hero action in under 30 words.
        </p>

        {/* Minimal Scenario Switcher */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto">
          {WORKED_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedExampleId(ex.id);
                setCustomConditions(ex.conditions);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedExampleId === ex.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {ex.name.split("—")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Hero Card: 07:00 AM Lock Screen Notification */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-sm border border-gray-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Lock Screen · 07:00 AM
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              {stage4_passB.word_count} / 30 words
            </span>
          </div>

          <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-gray-100">
            <p>{stage4_passB.line_1}</p>
            <p className="text-gray-300">{stage4_passB.line_2}</p>
            <p className="font-semibold text-emerald-400">{stage4_passB.action}</p>

            {stage4_passB.secondaries.map((sec, i) => (
              <p key={i} className="text-xs text-gray-400 pt-1">
                {sec}
              </p>
            ))}
          </div>

          {stage4_passB.source_name && (
            <div className="pt-3 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
              <span className="truncate">{stage4_passB.source_name}</span>
              <a
                href={stage4_passB.source_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline shrink-0 ml-2"
              >
                Source ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Segmented Pipeline Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pipeline Stages
          </h2>
          <span className="text-xs text-gray-400">Click stage to inspect</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stages.map((st) => (
            <button
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-3 rounded-xl text-left border text-xs transition-all ${
                activeStage === st.step
                  ? "bg-white border-gray-900 shadow-xs font-semibold text-gray-900"
                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
              }`}
            >
              <span className="block font-medium">{st.title}</span>
              <span className="text-[11px] text-gray-400">{st.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Stage Content Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs text-xs space-y-4">
          {/* Stage 1: Trigger Engine */}
          {activeStage === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-900">
                  Stage 1: Deterministic Trigger Engine (JavaScript)
                </span>
                <span className="text-gray-400 font-mono">
                  {stage1_triggers.length} triggers evaluated
                </span>
              </div>
              <div className="space-y-2">
                {stage1_triggers.map((trig, idx) => (
                  <div
                    key={trig.id}
                    className={`p-3 rounded-xl border ${
                      idx === 0
                        ? "bg-gray-50/80 border-gray-200"
                        : "bg-white border-gray-100 text-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{trig.title}</span>
                      <span className="font-mono font-medium text-gray-700">
                        Score: {trig.final_score}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{trig.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 2: Pass A */}
          {activeStage === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-900">
                  Stage 2: Pass A — Gemma (Local On-Device)
                </span>
                <span className="text-emerald-600 font-medium">PII Gate: Passed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 block text-[11px]">Selected Hero Trigger</span>
                  <span className="font-mono text-gray-900 font-medium">
                    {stage2_passA.hero_trigger_id}
                  </span>
                  <p className="text-gray-500 pt-1 text-[11px]">{stage2_passA.hero_reason}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 block text-[11px]">De-Identified Cloud Query</span>
                  <p className="text-gray-900 italic">
                    &ldquo;{stage2_passA.research_question || "None (Internal data only)"}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Research */}
          {activeStage === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-900">
                  Stage 3: Cloud Research — Gemini (Zero Personal Context)
                </span>
                <span className="text-gray-400">Authoritative retrieval</span>
              </div>
              {stage3_research ? (
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-gray-700">
                  <p className="font-medium text-gray-900">{stage3_research.answer}</p>
                  <p className="text-gray-500 text-[11px]">
                    Lead time: {stage3_research.lead_time_days} days · Source:{" "}
                    {stage3_research.source_name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 italic">No external research required.</p>
              )}
            </div>
          )}

          {/* Stage 4: Pass B */}
          {activeStage === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-900">
                  Stage 4: Pass B — Gemma Local Synthesis
                </span>
                <span className="text-emerald-600 font-medium">
                  {stage4_passB.word_count} words (≤30 hard cap)
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-gray-700 font-mono text-[11px]">
                <p>Line 1: {stage4_passB.line_1}</p>
                <p>Line 2: {stage4_passB.line_2}</p>
                <p>Action: {stage4_passB.action}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimal Condition Multiplier Sandbox */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">
            §6 Medical Risk Multiplier Sandbox
          </span>
          <span className="text-gray-400">
            {customConditions.includes("Type 2 diabetes") ? "×3.0 (T2D)" : "×1.0 (Baseline)"}
          </span>
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
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isChecked
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
