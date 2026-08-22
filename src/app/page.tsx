import Link from "next/link";
import { getHealthDataset, computeOverviewMetrics } from "../lib/data-adapter";
import MetricCard from "../components/MetricCard";

export default function Home() {
  const dataset = getHealthDataset();
  const m = computeOverviewMetrics(dataset);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Friendly Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Good morning, {dataset.profile.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Your daily health overview for {m.latestDate}
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
            className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors shadow-xs"
          >
            Analysis Agent →
          </Link>
        </div>
      </div>

      {/* Hero Morning Action (Plain English & Actionable) */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="font-medium flex items-center gap-1.5 text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Today&apos;s 7:00 AM Health Priority
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
            Actionable Today
          </span>
        </div>

        <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-gray-900">
          <p className="font-medium">
            You have 10 days of metformin left, and your trip to Bogotá is 14 days.
          </p>
          <p className="text-gray-600">
            Prescription repeats take about 5 working days to process.
          </p>
          <p className="font-semibold text-emerald-700">
            → Order your prescription repeat on the NHS App today.
          </p>
          <p className="text-xs text-gray-500 pt-1">
            · Yellow fever vaccine takes 10 days to become effective before you fly.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>How did we find this? Based on your flight dates & medication schedule</span>
          <Link
            href="/agent"
            className="text-gray-900 font-medium hover:underline"
          >
            See step-by-step analysis →
          </Link>
        </div>
      </div>

      {/* Core Digestible Metrics Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Key Numbers at a Glance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            title="Sleep Last Night"
            value={m.latestSleep}
            unit="hours"
            subtitle={`Your 7-day average is ${m.avgSleep7d}h`}
            pill={`Quality: ${m.ouraSleepScore}/100`}
            delta={{
              text: m.latestSleep >= m.avgSleep7d ? "+0.3h vs avg" : "-0.4h vs avg",
              isPositive: m.latestSleep >= m.avgSleep7d
            }}
          />

          <MetricCard
            title="Screen Time"
            value={m.latestScreenTime}
            unit="hours"
            subtitle={`${m.doomscrollingMins} mins late scrolling`}
            pill={`${m.alarmsSnoozed} alarms snoozed`}
            delta={{
              text: m.latestScreenTime <= m.avgScreenTime7d ? "Well balanced" : "A bit high",
              isPositive: m.latestScreenTime <= m.avgScreenTime7d
            }}
          />

          <MetricCard
            title="Resting Heart Rate"
            value={m.restingHr}
            unit="bpm"
            subtitle={`HRV recovery: ${m.hrvMs} ms`}
            pill={`Recovery: ${m.whoopRecovery}%`}
            delta={{
              text: "Healthy baseline",
              isPositive: true
            }}
          />

          <MetricCard
            title="Daily Steps"
            value={m.stepsCount.toLocaleString()}
            unit="steps"
            subtitle={`${m.standHours} active hours on feet`}
            pill={`Fitness score: ${m.vo2Max}`}
            delta={{
              text: m.stepsCount >= 8000 ? "Goal reached" : "Keep moving",
              isPositive: m.stepsCount >= 8000
            }}
          />
        </div>
      </div>

      {/* Secondary Clean Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Sleep Quality */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <span className="font-semibold text-gray-900 block">Sleep Quality Breakdown</span>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Deep Sleep (Physical recovery)</span>
              <span className="font-medium text-gray-900">{m.deepSleepHours} hours</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gray-800 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (m.deepSleepHours / 2) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-gray-600 pt-1">
              <span>REM Sleep (Mental refresh)</span>
              <span className="font-medium text-gray-900">{m.remSleepHours} hours</span>
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
          <span className="font-semibold text-gray-900 block">Food & Activity Energy</span>
          <div className="flex justify-between items-baseline py-1">
            <div>
              <span className="text-gray-500 block text-[11px]">Calories Eaten</span>
              <span className="text-base font-semibold text-gray-900">{m.caloriesIn}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block text-[11px]">Calories Burned</span>
              <span className="text-base font-semibold text-gray-900">{m.caloriesOut}</span>
            </div>
          </div>
          <p className="text-gray-600 pt-1 border-t border-gray-100">
            Water: <span className="font-medium text-gray-900">{m.waterIntakeL} Litres</span> · Protein:{" "}
            <span className="font-medium text-gray-900">{m.proteinG}g</span>
          </p>
        </div>

        {/* Weekly Behavior */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <span className="font-semibold text-gray-900 block">Weekly Habits (Past 7 Days)</span>
          <div className="space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span>Coffee spending</span>
              <span className="font-medium text-gray-900">£{m.coffeeSpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Takeaways / deliveries</span>
              <span className="font-medium text-gray-900">£{m.takeawaySpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gym / workout time</span>
              <span className="font-medium text-gray-900">{m.gymMins7d} mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
