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
  const [activeStage, setActiveStage] = useState<number>(1);
  const [customConditions, setCustomConditions] = useState<string[]>([
    "Type 2 diabetes",
    "Mild asthma"
  ]);

  // Handle condition toggle in the sandbox
  const handleToggleCondition = (cond: string) => {
    if (customConditions.includes(cond)) {
      setCustomConditions(customConditions.filter((c) => c !== cond));
    } else {
      setCustomConditions([...customConditions, cond]);
    }
  };

  // Run the 4-stage pipeline based on current state
  const pipelineResult = useMemo(() => {
    return executeAgentPipeline(dataset, "2026-08-22", customConditions);
  }, [dataset, customConditions]);

  const { stage1_triggers, stage2_passA, stage3_research, stage4_passB } = pipelineResult;
  const heroTrigger = stage1_triggers.find((t) => t.id === stage2_passA.hero_trigger_id);

  const stages = [
    {
      step: 1,
      title: "Trigger Engine",
      subtitle: "Deterministic JS (No LLM)",
      badge: "Arithmetic & Scoring",
      icon: "⚙️"
    },
    {
      step: 2,
      title: "Pass A",
      subtitle: "Gemma (Local / On-Device)",
      badge: "Hero Pick & PII Sanitizer",
      icon: "🛡️"
    },
    {
      step: 3,
      title: "Research",
      subtitle: "Gemini (Cloud / Zero PII)",
      badge: "NHS / WHO Guidelines",
      icon: "☁️"
    },
    {
      step: 4,
      title: "Pass B",
      subtitle: "Gemma (Local / On-Device)",
      badge: "<30 Word Action Briefing",
      icon: "📱"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Mission Statement from AGENT.md */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <span>⚡</span>
            <span>AGENT.md Spec Implementation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Anticipatory Health Intelligence Engine
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            &ldquo;Code computes, models phrase. The cloud model never sees who you are. Medical
            history amplifies behaviour. Exactly one hero insight in under 30 words.&rdquo;
          </p>
        </div>

        {/* Demo Scenario Selector */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKED_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedExampleId(ex.id);
                setCustomConditions(ex.conditions);
              }}
              className={`p-3.5 rounded-xl text-left transition-all border ${
                selectedExampleId === ex.id
                  ? "bg-white/15 border-blue-400 text-white shadow-md ring-1 ring-blue-400"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  {ex.name.split("—")[0]}
                </span>
                {selectedExampleId === ex.id && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                )}
              </div>
              <p className="text-xs font-semibold text-white truncate">{ex.tagline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Condition Amplifier Sandbox */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🩺</span>
              <span>§6 Risk Amplification Sandbox</span>
            </h3>
            <p className="text-xs text-gray-500">
              Toggle medical conditions in real time to see how the trigger engine amplifies
              behavioural signals (e.g. takeaway ×3 for diabetes).
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-semibold border border-amber-200">
            Active Multiplier:{" "}
            {customConditions.includes("Type 2 diabetes") ? "×3.0 (T2D)" : "×1.0 (Baseline)"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {[
            "Type 2 diabetes",
            "Hypertension",
            "Mild asthma",
            "Cardiovascular disease",
            "Caffeine dependency",
            "Anxiety / depression"
          ].map((cond) => {
            const isChecked = customConditions.includes(cond);
            return (
              <button
                key={cond}
                onClick={() => handleToggleCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isChecked
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {isChecked ? "✓ " : "+ "}
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Stage Stepper Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((st) => {
          const isSelected = activeStage === st.step;
          return (
            <button
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {st.step}
                </span>
                <span className="text-lg">{st.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{st.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{st.subtitle}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-semibold text-blue-700">
                {st.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Viewer */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {/* STAGE 1: TRIGGER ENGINE */}
        {activeStage === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-gray-900 text-white font-bold text-xs">
                    Stage 1
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    Deterministic Trigger Engine (JavaScript)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formula:{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-800">
                    score = urgency × actionability × confidence × amplifier
                  </code>
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {stage1_triggers.length} Candidates Evaluated
              </span>
            </div>

            <div className="space-y-4">
              {stage1_triggers.map((trig, idx) => (
                <div
                  key={trig.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    idx === 0
                      ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-300 shadow-xs"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                          HERO CANDIDATE
                        </span>
                      )}
                      <span className="font-bold text-sm text-gray-900">{trig.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-200 text-gray-900 rounded">
                        Score: {trig.final_score}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                          trig.severity === "urgent"
                            ? "bg-rose-100 text-rose-800"
                            : trig.severity === "warn"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {trig.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mb-3">{trig.summary}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-200 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <span className="text-gray-500 block">Urgency</span>
                      <span className="font-bold text-gray-900">{trig.urgency}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <span className="text-gray-500 block">Actionability</span>
                      <span className="font-bold text-gray-900">{trig.actionability}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <span className="text-gray-500 block">Amplifier (§6)</span>
                      <span className="font-bold text-indigo-700">×{trig.amplifier}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <span className="text-gray-500 block">Confidence</span>
                      <span className="font-bold text-gray-900">{trig.confidence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: PASS A (GEMMA LOCAL) */}
        {activeStage === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-900 text-white font-bold text-xs">
                    Stage 2
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pass A — Gemma (Local On-Device)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sees identity locally. Picks 1 hero trigger and constructs zero-PII cloud question.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                PII Privacy Gate: Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Decision Card */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Local Decision Output
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Selected Hero:</span>
                    <p className="font-bold text-gray-900 mt-0.5 font-mono">
                      {stage2_passA.hero_trigger_id}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Hero Selection Reason:</span>
                    <p className="text-gray-800 mt-0.5">{stage2_passA.hero_reason}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Secondaries:</span>
                    <p className="text-gray-800 mt-0.5 font-mono">
                      {stage2_passA.secondary_trigger_ids.join(", ") || "None"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">External Research Required:</span>
                    <p className="font-semibold text-blue-700 mt-0.5">
                      {stage2_passA.needs_research ? "YES (Cloud lookup required)" : "NO (Internal data only)"}
                    </p>
                  </div>
                </div>

                {stage2_passA.research_question && (
                  <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs">
                    <span className="font-bold text-blue-900 block mb-1">
                      De-Identified Question Generated:
                    </span>
                    <p className="italic text-gray-800">&ldquo;{stage2_passA.research_question}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Privacy & Sanitization Gate */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Zero-PII Verification Gate</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    PASSED
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {stage2_passA.sanitization_log.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100"
                    >
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <p className="font-semibold text-gray-900">{log.rule}</p>
                        <p className="text-gray-500 text-[11px]">{log.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: RESEARCH (GEMINI CLOUD) */}
        {activeStage === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-bold text-xs">
                    Stage 3
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    Cloud Research — Gemini (Zero Personal Context)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Answers de-identified question exclusively from NHS, WHO, and TravelHealthPro sources.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-800 rounded-full border border-sky-200">
                Authoritative Retrieval
              </span>
            </div>

            {stage3_research ? (
              <div className="space-y-4">
                <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                      Authoritative Guidance
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-sky-100 text-sky-800 rounded">
                      Required Lead Time: {stage3_research.lead_time_days} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">
                    {stage3_research.answer}
                  </p>
                  <div className="pt-2 border-t border-sky-200/60">
                    <span className="text-xs font-bold text-gray-700 block mb-1">
                      Verified Clinical & Logistic Facts:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                      {stage3_research.key_facts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>
                      <span className="font-semibold text-gray-700">Source:</span>{" "}
                      {stage3_research.source_name}
                    </span>
                    <a
                      href={stage3_research.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Visit source ↗
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700">
                  No External Cloud Research Triggered
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  The selected hero trigger is pure internal arithmetic or coupling, solved locally
                  without external queries.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: PASS B (FINAL USER BRIEFING) */}
        {activeStage === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold text-xs">
                    Stage 4
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pass B — Gemma Local Synthesis
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Merges external facts with personal numbers into the final 07:00 AM action message.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  {stage4_passB.word_count} / 60 Words
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">
                  PASS
                </span>
              </div>
            </div>

            {/* Simulated Phone Card / Morning Message */}
            <div className="max-w-xl mx-auto">
              <div className="bg-gradient-to-b from-gray-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-700 relative">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4 text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">07:00 AM Notification</span>
                  <span className="text-emerald-400 font-semibold">1 Actionable Insight</span>
                </div>

                <div className="space-y-3.5 text-sm leading-relaxed">
                  <div>
                    <span className="text-blue-400 font-bold uppercase tracking-wider text-xs block">
                      [Noticed]
                    </span>
                    <p className="text-gray-100 mt-0.5">{stage4_passB.noticed}</p>
                  </div>

                  <div>
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-xs block">
                      [Why now]
                    </span>
                    <p className="text-gray-100 mt-0.5">{stage4_passB.why_now}</p>
                  </div>

                  <div>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs block">
                      [Do]
                    </span>
                    <p className="text-white font-semibold mt-0.5">{stage4_passB.action}</p>
                  </div>

                  {stage4_passB.source_name && (
                    <div className="pt-2 border-t border-gray-800 text-xs text-gray-400">
                      <span className="text-gray-500 font-bold block">[Source]</span>
                      <p className="text-gray-300 mt-0.5">
                        {stage4_passB.source_name} ·{" "}
                        <span className="text-blue-400">{stage4_passB.source_url}</span>
                      </p>
                    </div>
                  )}

                  {stage4_passB.secondaries.length > 0 && (
                    <div className="pt-3 border-t border-gray-800 text-xs text-gray-400 space-y-1">
                      {stage4_passB.secondaries.map((sec, i) => (
                        <p key={i} className="text-gray-300 italic">
                          {sec}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
