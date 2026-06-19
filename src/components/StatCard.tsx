import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
};

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change ? (
        <div className={`stat-change ${changeType}`}>{change}</div>
      ) : null}
    </div>
  );
}
