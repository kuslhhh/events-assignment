'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type StatsCardProps = {
  title: string;
  value: number | string;
  change: number;
  icon: ReactNode;
  iconBgColor: string;
};

export function StatsCard({ title, value, change, icon, iconBgColor }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0f172a]/90 via-[#0b1220]/90 to-[#0a0f1c]/90 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.75)] backdrop-blur"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_35%)]" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white shadow-inner ${iconBgColor}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white leading-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                <span className="text-base">{isPositive ? '↑' : '↓'}</span>
                {Math.abs(change)}%
              </span>
              <span className="text-slate-400">From last week</span>
            </div>
          </div>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          Live
        </div>
      </div>
    </motion.div>
  );
}