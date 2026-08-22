import { getHealthDataset } from "../../lib/data-adapter";
import TabularDataGrid from "../../components/TabularDataGrid";

export default function RawDataPage() {
  const dataset = getHealthDataset();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Clear Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            Raw Data View
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Complete daily records across wearables, food, lifestyle, and fitness · Zero algorithmic bias
          </p>
        </div>
        <span className="text-xs sm:text-sm font-semibold px-3 py-1 bg-gray-100 text-gray-800 rounded-full border border-gray-200 self-start sm:self-auto">
          {dataset.records.length} Daily Records
        </span>
      </div>

      {/* Tabular Data Grid */}
      <TabularDataGrid dataset={dataset} />
    </div>
  );
}
