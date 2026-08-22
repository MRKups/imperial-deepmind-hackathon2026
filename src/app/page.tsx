import Link from "next/link";
import { getHealthDataset, computeOverviewMetrics } from "../lib/data-adapter";
import MetricCard from "../components/MetricCard";

export default function Home() {
  const dataset = getHealthDataset();
  const m = computeOverviewMetrics(dataset);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Summary Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live Health Stream · Trailing 30 Days</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Good morning, {dataset.profile.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Here is your daily vital summary at a glance. Key physiological vitals, sleep quality,
            and screen time trends.
          </p>
        </div>

        {/* Quick Jump to Agent Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/raw-data"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors text-center"
          >
            📋 Raw Data View
          </Link>
          <Link
            href="/agent"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>🧠</span>
            <span>Anticipatory Agent (1 Action)</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: PRIMARY DIGESTIBLE GLANCE CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>⚡</span>
            <span>Digestible Metrics at a Glance</span>
          </h2>
          <span className="text-xs font-medium text-gray-500">
            Latest recorded day: {m.latestDate}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Sleep */}
          <MetricCard
            title="Total Sleep"
            value={m.latestSleep}
            unit="hours"
            icon="🛌"
            subtitle={`7-day avg: ${m.avgSleep7d}h · 30d baseline: ${m.avgSleep30d}h`}
            badge={{
              text: `Oura Score: ${m.ouraSleepScore}/100`,
              type: m.ouraSleepScore >= 75 ? "positive" : "warning"
            }}
            trend={{
              direction: m.latestSleep >= m.avgSleep7d ? "up" : "down",
              label: m.latestSleep >= m.avgSleep7d ? "+0.3h vs avg" : "-0.5h vs avg"
            }}
            highlightColor="purple"
          />

          {/* 2. Screen Time */}
          <MetricCard
            title="Screen Time"
            value={m.latestScreenTime}
            unit="hours"
            icon="📱"
            subtitle={`7-day avg: ${m.avgScreenTime7d}h (${m.doomscrollingMins}m doomscroll)`}
            badge={{
              text: `${m.alarmsSnoozed} Alarms Snoozed`,
              type: m.alarmsSnoozed > 2 ? "warning" : "neutral"
            }}
            trend={{
              direction: m.latestScreenTime <= m.avgScreenTime7d ? "up" : "down",
              label: m.latestScreenTime <= m.avgScreenTime7d ? "Well managed" : "+1.2h high"
            }}
            highlightColor="indigo"
          />

          {/* 3. Physiological Vitals (Resting HR / HRV) */}
          <MetricCard
            title="Resting HR & HRV"
            value={m.restingHr}
            unit="bpm"
            icon="❤️"
            subtitle={`HRV: ${m.hrvMs} ms · Whoop Recovery: ${m.whoopRecovery}%`}
            badge={{
              text: `Recovery ${m.whoopRecovery}%`,
              type: m.whoopRecovery >= 66 ? "positive" : "warning"
            }}
            trend={{
              direction: m.restingHr <= 65 ? "up" : "down",
              label: "Optimal baseline"
            }}
            highlightColor="rose"
          />

          {/* 4. Activity & Steps */}
          <MetricCard
            title="Daily Movement"
            value={m.stepsCount.toLocaleString()}
            unit="steps"
            icon="👟"
            subtitle={`${m.standHours} stand hrs · ${m.latestGymActivity} (${m.gymMins7d}m 7d)`}
            badge={{
              text: `VO2 Max: ${m.vo2Max}`,
              type: "info"
            }}
            trend={{
              direction: m.stepsCount >= 8000 ? "up" : "down",
              label: m.stepsCount >= 8000 ? "Goal met" : "Below target"
            }}
            highlightColor="emerald"
          />
        </div>
      </div>

      {/* SECTION 2: DIGESTIBLE HEALTH & LIFESTYLE SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sleep Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span>🌙</span>
              <span>Sleep Quality Breakdown</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Oura Ring
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-medium">Deep Sleep</span>
              <span className="font-bold text-gray-900">{m.deepSleepHours} hours (Restorative)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (m.deepSleepHours / 2) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-600 font-medium">REM Sleep</span>
              <span className="font-bold text-gray-900">{m.remSleepHours} hours (Cognitive)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, (m.remSleepHours / 2) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-600 font-medium">7-Day Consistency</span>
              <span className="font-bold text-emerald-700">84% On-Time</span>
            </div>
          </div>
        </div>

        {/* Energy & Nutrition Balance Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span>🥗</span>
              <span>Daily Caloric & Hydration</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
              Net Balance
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                Calories In
              </span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {m.caloriesIn}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                P: {m.proteinG}g · C: {m.carbsG}g
              </span>
            </div>

            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
              <span className="text-[11px] font-bold text-orange-800 uppercase block">
                Calories Out
              </span>
              <span className="text-2xl font-black text-orange-950 mt-1 block">
                {m.caloriesOut}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                BMR: {dataset.profile.baseline_bmr || 1750} kcal
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-gray-600">
            <span>Water Intake:</span>
            <span className="font-bold text-blue-700">{m.waterIntakeL} Liters</span>
          </div>
        </div>

        {/* Spending & Environmental Corroboration */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span>💳</span>
              <span>7-Day Behavioral Spend</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full">
              Monzo / Bank Feed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-600">☕ Coffee Shops (7d)</span>
              <span className="font-bold text-gray-900">£{m.coffeeSpend7d.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-600">🥡 Deliveroo / Takeaways (7d)</span>
              <span className="font-bold text-amber-900">£{m.takeawaySpend7d.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-600">🏋️ Gym Sessions (7d)</span>
              <span className="font-bold text-gray-900">{m.gymMins7d} active mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
