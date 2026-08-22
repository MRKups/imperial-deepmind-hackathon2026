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
    <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs hover:border-gray-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">{title}</span>
          {pill && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
              {pill}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-gray-400">{unit}</span>}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{subtitle}</span>
        {delta && (
          <span
            className={`font-medium ${
              delta.isPositive ? "text-emerald-600" : "text-gray-500"
            }`}
          >
            {delta.text}
          </span>
        )}
      </div>
    </div>
  );
}
