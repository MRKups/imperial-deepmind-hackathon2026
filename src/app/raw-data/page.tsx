import { getHealthDataset } from "../../lib/data-adapter";
import TabularDataGrid from "../../components/TabularDataGrid";

export default function RawDataPage() {
  const dataset = getHealthDataset();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 mb-2">
            <span>📋</span>
            <span>Raw Data Feed · No Algorithmic Bias</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Raw Health & Behavioral Stream
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Tabular format of all connected wearable, financial, lifestyle, and medical streams.
            Zero insights, interpretations, or algorithmic weightings applied.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-semibold">
            {dataset.records.length} Total Daily Records Loaded
          </span>
        </div>
      </div>

      {/* Tabular Data Grid Component */}
      <TabularDataGrid dataset={dataset} />
    </div>
  );
}
