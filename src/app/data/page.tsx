import type { Metadata } from "next";
import healthData from "../../../data/health-data.json";
import calendar from "../../../data/calendar.json";
import emails from "../../../data/emails.json";
import spending from "../../../data/spending.json";

export const metadata: Metadata = {
  title: "Raw data",
};

type Row = Record<string, unknown>;

function RawTable({ title, rows, note }: { title: string; rows: Row[]; note?: string }) {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-gray-500">
          {rows.length} records{note ? ` · ${note}` : ""}
        </span>
      </div>
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
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0 align-top">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 whitespace-nowrap max-w-md overflow-hidden text-ellipsis">
                    {col in row ? String(row[col]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function RawData() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Raw data</h1>
          <p className="text-sm text-gray-600">
            Every source, every field, exactly as stored. No insights, no interpretation.
          </p>
        </header>

        <RawTable title="Health" rows={healthData.records} />
        <RawTable title="Calendar" rows={calendar.events} />
        <RawTable title="Email" rows={emails.emails} />
        <RawTable title="Spending" rows={spending.transactions} note={spending.currency} />

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
