import Link from "next/link";
import { getHealthDataset, computeOverviewMetrics } from "../lib/data-adapter";
import MetricCard from "../components/MetricCard";

export default function Home() {
  const dataset = getHealthDataset();
  const m = computeOverviewMetrics(dataset);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Calm Light Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Good morning, {dataset.profile.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daily health summary · {m.latestDate}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/raw-data"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Raw Data View →
          </Link>
          <Link
            href="/agent"
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors shadow-xs"
          >
            Agent Engine →
          </Link>
        </div>
      </div>

      {/* Hero Morning Action Brief (Clean Light Card) */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="font-medium flex items-center gap-1.5 text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            07:00 AM Anticipatory Brief
          </span>
          <span className="text-gray-400 font-mono text-[11px]">27 words</span>
        </div>

        <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-gray-900">
          <p className="font-medium">10 days of metformin left. Bogotá trip is 14 days.</p>
          <p className="text-gray-600">NHS repeats take 5 working days.</p>
          <p className="font-semibold text-emerald-700">
            → Order the repeat on the NHS App today.
          </p>
          <p className="text-xs text-gray-500 pt-1">· Yellow fever needs 10 days.</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>TravelHealthPro · fitfortravel.nhs.uk</span>
          <Link
            href="/agent"
            className="text-blue-600 hover:underline font-medium"
          >
            Inspect 4-stage pipeline ↗
          </Link>
        </div>
      </div>

      {/* Core Digestible Metrics Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            title="Sleep"
            value={m.latestSleep}
            unit="hours"
            subtitle={`7d avg: ${m.avgSleep7d}h`}
            pill={`Score ${m.ouraSleepScore}`}
            delta={{
              text: m.latestSleep >= m.avgSleep7d ? "+0.3h" : "-0.4h",
              isPositive: m.latestSleep >= m.avgSleep7d
            }}
          />

          <MetricCard
            title="Screen Time"
            value={m.latestScreenTime}
            unit="hours"
            subtitle={`${m.doomscrollingMins}m doomscroll`}
            pill={`${m.alarmsSnoozed} snoozes`}
            delta={{
              text: m.latestScreenTime <= m.avgScreenTime7d ? "Optimal" : "Elevated",
              isPositive: m.latestScreenTime <= m.avgScreenTime7d
            }}
          />

          <MetricCard
            title="Resting HR"
            value={m.restingHr}
            unit="bpm"
            subtitle={`HRV: ${m.hrvMs} ms`}
            pill={`Recovery ${m.whoopRecovery}%`}
            delta={{
              text: "Normal baseline",
              isPositive: true
            }}
          />

          <MetricCard
            title="Movement"
            value={m.stepsCount.toLocaleString()}
            unit="steps"
            subtitle={`${m.standHours} stand hrs`}
            pill={`VO2 ${m.vo2Max}`}
            delta={{
              text: m.stepsCount >= 8000 ? "Goal met" : "Below target",
              isPositive: m.stepsCount >= 8000
            }}
          />
        </div>
      </div>

      {/* Secondary Clean Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Sleep Quality */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <span className="font-semibold text-gray-900 block">Sleep Architecture</span>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Deep Sleep</span>
              <span className="font-medium text-gray-900">{m.deepSleepHours}h</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gray-800 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (m.deepSleepHours / 2) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-gray-600 pt-1">
              <span>REM Sleep</span>
              <span className="font-medium text-gray-900">{m.remSleepHours}h</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gray-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (m.remSleepHours / 2) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Energy Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <span className="font-semibold text-gray-900 block">Daily Energy & Nutrition</span>
          <div className="flex justify-between items-baseline py-1">
            <div>
              <span className="text-gray-500 block text-[11px]">Calories In</span>
              <span className="text-base font-semibold text-gray-900">{m.caloriesIn}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block text-[11px]">Calories Out</span>
              <span className="text-base font-semibold text-gray-900">{m.caloriesOut}</span>
            </div>
          </div>
          <p className="text-gray-600 pt-1 border-t border-gray-100">
            Water: <span className="font-medium text-gray-900">{m.waterIntakeL} L</span> · Protein:{" "}
            <span className="font-medium text-gray-900">{m.proteinG}g</span>
          </p>
        </div>

        {/* Weekly Behavior */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <span className="font-semibold text-gray-900 block">7-Day Spending & Gym</span>
          <div className="space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span>Coffee shops</span>
              <span className="font-medium text-gray-900">£{m.coffeeSpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Takeaways / Deliveroo</span>
              <span className="font-medium text-gray-900">£{m.takeawaySpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Active gym time</span>
              <span className="font-medium text-gray-900">{m.gymMins7d} mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
