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
    <div className={`app-panel group relative overflow-hidden rounded-2xl border border-surface/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:p-6 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-primary/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[2.1rem]">{value}</p>
          {trend && (
            <p className={`mt-2 text-xs font-semibold ${trendUp ? 'text-success' : 'text-accent-red'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-surface bg-bg-card text-lg shadow-sm transition-transform group-hover:scale-105 dark:bg-surface/45">{icon}</span>
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
