import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  percent?: string;
  trend?: string;
  progress?: number;
}

export default function StatCard({ title, value, icon, color = 'blue', percent, trend, progress }: StatCardProps) {
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg`}>
      <h3 className={`text-lg font-medium text-${color}-900`}>{title}</h3>
      <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
      {percent && <p className={`text-sm text-${color}-600`}>{percent}</p>}
      {trend && <p className={`text-sm text-${color}-600`}>{trend}</p>}
      {progress && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 bg-${color}-600 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {icon && <div className="mt-2">{icon}</div>}
    </div>
  );
} 