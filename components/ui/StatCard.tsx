import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="erp-card erp-card-hover p-5">
      {/* Top row: Label + Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="erp-label">{title}</span>
        <span className="text-[var(--text-muted)]">
          {icon}
        </span>
      </div>

      {/* Bottom row: Value + Trend */}
      <div className="flex items-baseline justify-between">
        <p className="erp-data">
          {value}
        </p>
        
        {trend && (
          <span
            className={`text-[12px] font-medium ${
              trendUp ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
    </div>
  );
}