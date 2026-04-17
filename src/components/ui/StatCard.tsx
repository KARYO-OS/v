import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatCard({ icon, label, value, trend, trendUp, className = '' }: StatCardProps) {
  return (
    <div className={`app-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-primary/8 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
          {trend && (
            <p className={`mt-2 text-xs font-semibold ${trendUp ? 'text-success' : 'text-accent-red'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-surface bg-slate-50 text-lg dark:bg-surface/45">{icon}</span>
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {children}
    </div>
  );
}
