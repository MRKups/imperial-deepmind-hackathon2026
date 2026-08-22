import { getHealthDataset } from "../../lib/data-adapter";
import TabularDataGrid from "../../components/TabularDataGrid";

export default function RawDataPage() {
  const dataset = getHealthDataset();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Raw Data View
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tabular stream across wearables, spending, and lifestyle · Zero algorithmic bias
          </p>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {dataset.records.length} records
        </span>
      </div>

      {/* Tabular Data Grid */}
      <TabularDataGrid dataset={dataset} />
    </div>
  );
}
