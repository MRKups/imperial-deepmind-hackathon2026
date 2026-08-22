import healthData from "../../data/health-data.json";

export default function Home() {
  const records = healthData.records;
  
  // Calculate some initial stats over the recorded period
  const totalDays = records.length;
  
  const avgSleepHours = (records.reduce((acc, curr) => acc + curr.sleep_hours, 0) / totalDays).toFixed(1);
  const avgScreenTime = (records.reduce((acc, curr) => acc + curr.screen_time, 0) / totalDays).toFixed(1);
  const avgStandHours = (records.reduce((acc, curr) => acc + curr.stand_hours, 0) / totalDays).toFixed(1);
  const avgCaloriesIn = Math.round(records.reduce((acc, curr) => acc + curr.calories_in, 0) / totalDays);
  const avgCaloriesOut = Math.round(records.reduce((acc, curr) => acc + curr.calories_out, 0) / totalDays);
  
  const totalGymMins = records.reduce((acc, curr) => acc + curr.gym_duration_mins, 0);

  // Latest record
  const latestRecord = records[records.length - 1];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-blue-900">
            {healthData.profile.name}'s Health Dashboard
          </h1>
          <p className="text-lg text-gray-600">Initial stats & lifestyle overview based on recent data.</p>
        </header>

        {/* 7-Day Averages Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">7-Day Averages</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Sleep</p>
              <p className="text-2xl font-bold text-purple-900">{avgSleepHours} h</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Screen Time</p>
              <p className="text-2xl font-bold text-indigo-900">{avgScreenTime} h</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Calories In</p>
              <p className="text-2xl font-bold text-green-900">{avgCaloriesIn}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">Calories Out</p>
              <p className="text-2xl font-bold text-orange-900">{avgCaloriesOut}</p>
            </div>
          </div>
        </section>

        {/* Activity & Wearables */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Activity Overview</h2>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Total Gym Time</span>
              <span className="font-bold text-gray-900">{totalGymMins} mins</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Avg Stand Hours</span>
              <span className="font-bold text-gray-900">{avgStandHours} hrs/day</span>
            </div>
          </div>

          {/* Latest Day Snapshot */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Latest Day ({latestRecord.date})</h2>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Gym Activity</span>
              <span className="font-bold text-gray-900">{latestRecord.gym_activity}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Avg Heart Rate</span>
              <span className="font-bold text-gray-900">{latestRecord.avg_heart_rate} bpm</span>
            </div>
          </div>
        </section>


      </div>
    </main>
  );
}
