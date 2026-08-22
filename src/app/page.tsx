import Link from "next/link";
import { getHealthDataset, computeOverviewMetrics } from "../lib/data-adapter";
import MetricCard from "../components/MetricCard";

export default function Home() {
  const dataset = getHealthDataset();
  const m = computeOverviewMetrics(dataset);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Friendly, Clear Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            Good morning, {dataset.profile.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Your daily health overview for <strong>{m.latestDate}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/raw-data"
            className="text-sm text-gray-700 hover:text-gray-950 font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Raw Data View →
          </Link>
          <Link
            href="/agent"
            className="px-4 py-2 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            Analysis Agent →
          </Link>
        </div>
      </div>

      {/* Hero Morning Action (Large, High Contrast, Ultra-Legible) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
          <span className="font-bold flex items-center gap-2 text-sm sm:text-base text-gray-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Today&apos;s 7:00 AM Priority Action
          </span>
          <span className="text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full font-bold text-xs sm:text-sm self-start sm:self-auto">
            Actionable Today
          </span>
        </div>

        <div className="space-y-2.5 text-base sm:text-lg leading-relaxed text-gray-900">
          <p className="font-semibold text-gray-950">
            You have 10 days of metformin left, and your trip to Bogotá is 14 days long.
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            Prescription repeats take about 5 business days to process.
          </p>
          <div className="p-3.5 sm:p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold text-base sm:text-lg">
            → Order your prescription repeat on the NHS App today.
          </div>
          <p className="text-sm text-gray-600 pt-1">
            · Yellow fever vaccine takes 10 days to become effective before you travel.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <span>Based on your upcoming flight dates & medication schedule</span>
          <Link
            href="/agent"
            className="text-blue-700 font-bold hover:underline"
          >
            See step-by-step analysis →
          </Link>
        </div>
      </div>

      {/* Core Digestible Metrics Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3.5">
          Key Numbers at a Glance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Sleep Last Night"
            value={m.latestSleep}
            unit="hours"
            subtitle={`7-day avg: ${m.avgSleep7d}h`}
            pill={`Score ${m.ouraSleepScore}/100`}
            delta={{
              text: m.latestSleep >= m.avgSleep7d ? "+0.3h vs avg" : "-0.4h vs avg",
              isPositive: m.latestSleep >= m.avgSleep7d
            }}
          />

          <MetricCard
            title="Screen Time"
            value={m.latestScreenTime}
            unit="hours"
            subtitle={`${m.doomscrollingMins}m late scrolling`}
            pill={`${m.alarmsSnoozed} alarms snoozed`}
            delta={{
              text: m.latestScreenTime <= m.avgScreenTime7d ? "Optimal" : "A bit high",
              isPositive: m.latestScreenTime <= m.avgScreenTime7d
            }}
          />

          <MetricCard
            title="Resting Heart Rate"
            value={m.restingHr}
            unit="bpm"
            subtitle={`HRV recovery: ${m.hrvMs} ms`}
            pill={`Recovery ${m.whoopRecovery}%`}
            delta={{
              text: "Healthy baseline",
              isPositive: true
            }}
          />

          <MetricCard
            title="Daily Steps"
            value={m.stepsCount.toLocaleString()}
            unit="steps"
            subtitle={`${m.standHours} stand hours`}
            pill={`Fitness score: ${m.vo2Max}`}
            delta={{
              text: m.stepsCount >= 8000 ? "Goal reached" : "Keep moving",
              isPositive: m.stepsCount >= 8000
            }}
          />
        </div>
      </div>

      {/* Secondary Clean Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sleep Quality */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
          <span className="font-bold text-sm sm:text-base text-gray-900 block">
            Sleep Quality Breakdown
          </span>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-1">
                <span>Deep Sleep (Physical recovery)</span>
                <span className="font-bold text-gray-900">{m.deepSleepHours} hours</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (m.deepSleepHours / 2) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-1">
                <span>REM Sleep (Mental refresh)</span>
                <span className="font-bold text-gray-900">{m.remSleepHours} hours</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (m.remSleepHours / 2) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Balance */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
          <span className="font-bold text-sm sm:text-base text-gray-900 block">
            Food & Activity Energy
          </span>
          <div className="flex justify-between items-baseline py-1">
            <div>
              <span className="text-gray-500 block text-xs sm:text-sm">Calories Eaten</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-950">{m.caloriesIn}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block text-xs sm:text-sm">Calories Burned</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-950">{m.caloriesOut}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 pt-2 border-t border-gray-100">
            Water: <span className="font-bold text-gray-950">{m.waterIntakeL} Litres</span> · Protein:{" "}
            <span className="font-bold text-gray-950">{m.proteinG}g</span>
          </p>
        </div>

        {/* Weekly Behavior */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
          <span className="font-bold text-sm sm:text-base text-gray-900 block">
            Weekly Habits (Past 7 Days)
          </span>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Coffee spending</span>
              <span className="font-bold text-gray-950">£{m.coffeeSpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Takeaways / deliveries</span>
              <span className="font-bold text-gray-950">£{m.takeawaySpend7d.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gym / workout time</span>
              <span className="font-bold text-gray-950">{m.gymMins7d} mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
