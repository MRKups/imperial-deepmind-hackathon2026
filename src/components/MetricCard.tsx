import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  pill?: string;
  delta?: {
    text: string;
    isPositive?: boolean;
  };
}

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  pill,
  delta
}: MetricCardProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {pill && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 border border-gray-200">
              {pill}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            {value}
          </span>
          {unit && <span className="text-sm sm:text-base font-semibold text-gray-500">{unit}</span>}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600">
        <span className="font-medium">{subtitle}</span>
        {delta && (
          <span
            className={`font-semibold ${
              delta.isPositive ? "text-emerald-700" : "text-gray-600"
            }`}
          >
            {delta.text}
          </span>
        )}
      </div>
    </div>
  );
}
