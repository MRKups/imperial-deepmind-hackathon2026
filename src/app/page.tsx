import Link from "next/link";
import caloriesData from "../../data/calories.json";
import lifestyleData from "../../data/lifestyle.json";
import habitsData from "../../data/habits.json";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-blue-900">Health & Lifestyle Anticipatory AI</h1>
          <p className="text-lg text-gray-600">Your personalized diagnosis and daily recommendations based on habits, wearables, and schedule.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calories & Nutrition */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Nutrition & Calories</h2>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-600">Latest Log: {caloriesData[0].date}</p>
              <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-green-800">Consumed</span>
                <span className="font-bold text-green-900">{caloriesData[0].total_calories_consumed} kcal</span>
              </div>
              <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-orange-800">Burned</span>
                <span className="font-bold text-orange-900">{caloriesData[0].total_calories_burned} kcal</span>
              </div>
            </div>
            <button className="w-full mt-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
              View Insights
            </button>
          </div>

          {/* Lifestyle & Travel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Lifestyle & Schedule</h2>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Upcoming Travel (Gmail MCP)</p>
                {lifestyleData[0].travel.upcoming_trips.map((trip, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="font-bold text-blue-900">{trip.destination}</p>
                    <p className="text-blue-700 text-xs mt-1">{trip.departure_date} to {trip.return_date}</p>
                    <p className="text-red-600 text-xs font-semibold mt-2">💡 Alert: {trip.notes}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Spending Trend</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="flex justify-between"><span>Coffee Shops:</span> <span className="font-medium">${lifestyleData[0].spending.coffee_shops.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
            <button className="w-full mt-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
              View Insights
            </button>
          </div>

          {/* Habits & Wearables */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Habits & Wearables</h2>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Sleep</p>
                <p className="text-lg font-bold text-purple-900">{habitsData[0].sleep.hours_slept}h</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Avg Heartrate</p>
                <p className="text-lg font-bold text-red-900">{habitsData[0].wearables_data.average_heart_rate_bpm} bpm</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-indigo-600 font-medium">Screen Time</p>
                <p className="text-lg font-bold text-indigo-900">{habitsData[0].screen_time.total_hours}h</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-xs text-teal-600 font-medium">Gym</p>
                <p className="text-lg font-bold text-teal-900">{habitsData[0].activity.gym_time_mins} min</p>
              </div>
            </div>
            <button className="w-full mt-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
              View Insights
            </button>
          </div>
        </section>

        {/* AI Recommendations Section */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg mt-8">
          <h2 className="text-2xl font-bold mb-4">Daily AI Diagnosis</h2>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold text-blue-100 mb-1">⚕️ Health Alert</h3>
              <p className="text-sm">Based on your upcoming trip to Colombia in September, it's recommended to schedule a Yellow Fever vaccination consultation soon.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold text-blue-100 mb-1">🏃‍♂️ Recovery Suggestion</h3>
              <p className="text-sm">You had 60 mins of strength training yesterday and slept 7.5 hours. Heart rate recovery is excellent. Consider active recovery today (e.g., walking or light yoga).</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold text-blue-100 mb-1">💰 Spending Insight</h3>
              <p className="text-sm">You spent $8.00 on coffee yesterday. This is on par with your weekly average. Making coffee at home twice a week could save you roughly $64 a month.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
