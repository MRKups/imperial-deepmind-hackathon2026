import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  subtitle?: string;
  badge?: {
    text: string;
    type: "positive" | "warning" | "neutral" | "info";
  };
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  highlightColor?: "blue" | "purple" | "emerald" | "amber" | "rose" | "indigo";
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  subtitle,
  badge,
  trend,
  highlightColor = "blue"
}: MetricCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/60",
      border: "border-blue-100",
      iconBg: "bg-blue-100 text-blue-700",
      valColor: "text-blue-950"
    },
    purple: {
      bg: "bg-purple-50/60",
      border: "border-purple-100",
      iconBg: "bg-purple-100 text-purple-700",
      valColor: "text-purple-950"
    },
    emerald: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100 text-emerald-700",
      valColor: "text-emerald-950"
    },
    amber: {
      bg: "bg-amber-50/60",
      border: "border-amber-100",
      iconBg: "bg-amber-100 text-amber-700",
      valColor: "text-amber-950"
    },
    rose: {
      bg: "bg-rose-50/60",
      border: "border-rose-100",
      iconBg: "bg-rose-100 text-rose-700",
      valColor: "text-rose-950"
    },
    indigo: {
      bg: "bg-indigo-50/60",
      border: "border-indigo-100",
      iconBg: "bg-indigo-100 text-indigo-700",
      valColor: "text-indigo-950"
    }
  };

  const badgeStyle = {
    positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
    info: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const theme = colorMap[highlightColor];

  return (
    <div
      className={`relative p-5 rounded-2xl border ${theme.border} ${theme.bg} bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${theme.iconBg}`}
            >
              {icon}
            </div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {title}
            </span>
          </div>

          {badge && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                badgeStyle[badge.type]
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-3xl font-extrabold tracking-tight ${theme.valColor}`}>
            {value}
          </span>
          {unit && <span className="text-sm font-semibold text-gray-500">{unit}</span>}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-xs">
        {subtitle && <span className="text-gray-500 font-medium">{subtitle}</span>}

        {trend && (
          <span
            className={`font-semibold flex items-center gap-1 ${
              trend.direction === "up"
                ? "text-emerald-700"
                : trend.direction === "down"
                ? "text-amber-700"
                : "text-gray-600"
            }`}
          >
            {trend.direction === "up" && "▲"}
            {trend.direction === "down" && "▼"}
            {trend.direction === "neutral" && "•"}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
