'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Event } from '@/db/schema';

type EventTableRowProps = {
  event: Event;
  index: number;
};

type StatusInfo = {
  label: 'Upcoming' | 'Ongoing' | 'Cancelled' | 'Completed';
  colorClass: string;
  dotClass: string;
};

function getStatusInfo(event: Event): StatusInfo {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (!event.isActive) {
    return {
      label: 'Cancelled',
      colorClass: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
      dotClass: 'bg-rose-400',
    };
  }

  if (start <= now && end >= now) {
    return {
      label: 'Ongoing',
      colorClass: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
      dotClass: 'bg-sky-400',
    };
  }

  if (end < now) {
    return {
      label: 'Completed',
      colorClass: 'bg-slate-500/15 text-slate-200 border border-slate-500/30',
      dotClass: 'bg-slate-300',
    };
  }

  return {
    label: 'Upcoming',
    colorClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  };
}

export function EventTableRow({ event, index }: EventTableRowProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const status = getStatusInfo(event);
  const ticketsSold = event.maxAttendees ?? 0;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 transition-colors hover:bg-white/5 text-sm"
    >
      <td className="px-6 py-4">
        <Link href={`/events/${event.id}`} className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4b99] via-[#2d3f7c] to-[#0f1b3d] ring-1 ring-white/10 shadow-inner">
            <span className="text-sm font-semibold text-white">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
            {event.title}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
        {formatDate(event.startDate)}, {formatTime(event.startDate)}
      </td>
      <td className="px-6 py-4 text-sm text-slate-300">{event.location}</td>
      <td className="px-6 py-4 text-sm text-slate-300 text-center">
        {ticketsSold ? ticketsSold.toLocaleString() : '—'}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.colorClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <Link href={`/events/${event.id}`}>
          <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 10a2 2 0 100 4 2 2 0 000-4zm0-6a2 2 0 100 4 2 2 0 000-4zm0 12a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
        </Link>
      </td>
    </motion.tr>
  );
}