'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/use-event';
import { StatsCard } from '@/component/dashboard/stats-card';
import { EventTableRow } from '@/component/dashboard/event-table-row';
import { LoadingSpinner } from '@/component/ui/loading-spinner';
import { ErrorMessage } from '@/component/ui/error-message';
import { Button } from '@/component/ui/button';
import { EmptyState } from '@/component/ui/empty-state';

const TIMEFRAMES = ['1D', '7D', '1M', '3M', 'Custom'] as const;
const PAGE_SIZE = 8;

export default function HomePage() {
  const { data: events = [], isLoading, error, refetch } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, events.length]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(
      (event) => event.isActive && new Date(event.startDate) > now
    ).length;
    const ongoing = events.filter((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return event.isActive && start <= now && end >= now;
    }).length;
    const cancelled = events.filter((event) => !event.isActive).length;
    const total = events.length;

    return {
      total,
      upcoming,
      ongoing,
      cancelled,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    const term = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="py-10">
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="py-10">
            <ErrorMessage message={error.message} onRetry={() => refetch()} />
          </td>
        </tr>
      );
    }

    if (paginatedEvents.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-10">
            <EmptyState
              title="No events found"
              description="Try adjusting your search or filters"
              actionLabel="Create Event"
              actionHref="/events/create"
            />
          </td>
        </tr>
      );
    }

    return paginatedEvents.map((event, index) => (
      <EventTableRow
        key={event.id}
        event={event}
        index={index}
      />
    ));
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0b1220] text-white">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-400">Event Management</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Events</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative hidden lg:block">
              <input
                type="search"
                placeholder="Search for anything"
                className="h-11 w-72 rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.64 5.64a7.5 7.5 0 0010.61 10.61z"
                />
              </svg>
            </div>
            <button className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-4.98"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a3 3 0 006 0"
                />
              </svg>
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                4
              </span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 sm:px-3 sm:py-2 shadow-inner">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4b99] to-[#0f1b3d] text-xs sm:text-sm font-semibold">
                HC
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold leading-5 text-white">Hailey Carter</p>
                <p className="text-xs text-slate-400">Master Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-white">Event Overview</h2>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {TIMEFRAMES.map((frame) => (
              <button
                key={frame}
                className={`rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold transition ${
                  frame === '7D'
                    ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {frame}
              </button>
            ))}
            <button className="rounded-full border border-white/10 bg-white/5 p-1.5 sm:p-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10">
              <svg
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <StatsCard
            title="Total events"
            value={stats.total}
            change={10}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1021 12a9 9 0 00-10-8.945z"
                />
              </svg>
            }
            iconBgColor="bg-gradient-to-br from-amber-400/30 to-amber-500/40"
          />
          <StatsCard
            title="Upcoming events"
            value={stats.upcoming}
            change={12}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3"
                />
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
            }
            iconBgColor="bg-gradient-to-br from-sky-400/30 to-sky-500/40"
          />
          <StatsCard
            title="Ongoing events"
            value={stats.ongoing}
            change={-12}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
            iconBgColor="bg-gradient-to-br from-emerald-400/25 to-emerald-500/30"
          />
          <StatsCard
            title="Cancelled events"
            value={stats.cancelled}
            change={5}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
            iconBgColor="bg-gradient-to-br from-rose-400/25 to-rose-500/30"
          />
        </div>

        {/* Table */}
        <section className="flex min-h-0 flex-1 flex-col rounded-xl sm:rounded-2xl border border-white/5 bg-[#0d1526]/80 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col gap-3 border-b border-white/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">Events ({filteredEvents.length})</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by event, location"
                  className="h-9 w-full sm:w-60 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <svg
                  className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.64 5.64a7.5 7.5 0 0010.61 10.61z"
                  />
                </svg>
              </div>
              <button className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v1H3V4zM4 7h16l-1.5 12h-13L4 7z"
                  />
                </svg>
                Filter
              </button>
              <button className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
                </svg>
                Sort
              </button>
              <Button
                onClick={() => router.push('/events/create')}
                className="w-full sm:w-auto bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Create Event
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3 font-semibold">Event Name</th>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3 font-semibold">Date &amp; Time</th>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3 font-semibold">Location</th>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3 text-center font-semibold">Tickets Sold</th>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3 font-semibold">Status</th>
                    <th className="px-4 py-2.5 sm:px-6 sm:py-3" />
                  </tr>
                </thead>
              </table>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="sm:hidden space-y-2 p-3">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message={error.message} onRetry={() => refetch()} />}
                {!isLoading && !error && paginatedEvents.length === 0 && (
                  <EmptyState
                    title="No events found"
                    description="Try adjusting your search or filters"
                    actionLabel="Create Event"
                    actionHref="/events/create"
                  />
                )}
                {!isLoading && !error && paginatedEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4b99] to-[#0f1b3d] text-xs font-semibold">
                          {event.title.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="font-medium text-sm text-white flex-1 line-clamp-1">{event.title}</h4>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          event.isActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}>
                          {event.isActive ? 'Active' : 'Cancelled'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p>{event.location}</p>
                        {event.maxAttendees && <p>Tickets: {event.maxAttendees.toLocaleString()}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <table className="hidden sm:table min-w-full text-left">
                <tbody className="divide-y divide-white/5">{renderTableBody()}</tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 px-3 py-2 sm:px-5 sm:py-3 text-sm text-slate-300">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-white/10 bg-white/5 text-center font-semibold transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNumber = idx + 1;
                const isActive = pageNumber === page;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg border text-center text-xs sm:text-sm font-semibold transition ${
                      isActive
                        ? 'border-blue-500/70 bg-blue-600/40 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-2 text-xs text-slate-400">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-white/10 bg-white/5 text-center font-semibold transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
              >
                ›
              </button>
            </div>
            <p className="text-center sm:text-right text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredEvents.length)} of {filteredEvents.length}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}