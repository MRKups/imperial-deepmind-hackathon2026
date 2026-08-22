import type { Metadata } from "next";
import healthData from "../../../data/health-data.json";

export const metadata: Metadata = {
  title: "Raw data",
};

export default function RawData() {
  const records = healthData.records;
  const columns = Object.keys(records[0]) as (keyof (typeof records)[number])[];

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Raw data</h1>
          <p className="text-sm text-gray-600">
            Every recorded field, exactly as stored. {records.length} records.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[font-variant-numeric:tabular-nums]">
              {records.map((record) => (
                <tr
                  key={record.date}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 whitespace-nowrap">
                      {String(record[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-medium text-gray-600 mb-2">Profile</h2>
          <table className="text-sm [font-variant-numeric:tabular-nums]">
            <tbody>
              {Object.entries(healthData.profile).map(([key, value]) => (
                <tr key={key}>
                  <td className="pr-6 py-1 text-gray-600">{key}</td>
                  <td className="py-1">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
