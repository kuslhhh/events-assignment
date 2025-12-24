'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEvent, useDeleteEvent } from '@/hooks/use-event';
import { LoadingSpinner } from '@/component/ui/loading-spinner';
import { ErrorMessage } from '@/component/ui/error-message';
import { Button } from '@/component/ui/button';
import { ConfirmDeleteModal } from '@/component/event/confirm-delete-modal';

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type StatusInfo = {
  label: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  colorClass: string;
  dotClass: string;
};

function getStatusInfo(event: { startDate: Date; endDate: Date; isActive: boolean }): StatusInfo {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (!event.isActive) {
    return {
      label: 'Cancelled',
      colorClass: 'bg-rose-500/10 text-rose-200 border border-rose-500/30',
      dotClass: 'bg-rose-400',
    };
  }

  if (start <= now && end >= now) {
    return {
      label: 'Ongoing',
      colorClass: 'bg-sky-500/10 text-sky-200 border border-sky-500/30',
      dotClass: 'bg-sky-400',
    };
  }

  if (end < now) {
    return {
      label: 'Completed',
      colorClass: 'bg-slate-500/10 text-slate-200 border border-slate-500/30',
      dotClass: 'bg-slate-300',
    };
  }

  return {
    label: 'Upcoming',
    colorClass: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const eventId = parseInt(id);

  const { data: event, isLoading, error, refetch } = useEvent(eventId);
  const deleteEvent = useDeleteEvent();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(eventId);
      router.push('/');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRange = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    const startStr = startDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const endStr = endDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: sameMonth ? undefined : 'short',
      year: sameYear ? undefined : 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  const statusInfo = useMemo(() => (event ? getStatusInfo(event) : null), [event]);

  const ticketsSold = useMemo(() => event?.maxAttendees ?? 0, [event]);
  const estimatedRevenue = useMemo(() => {
    if (!event) return 0;
    // simple estimate: ticketsSold * 45
    return ticketsSold * 45;
  }, [event, ticketsSold]);
  const uniqueAttendees = Math.max(0, Math.round(ticketsSold * 0.7));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1220]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1220]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <ErrorMessage message={error.message} onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0b1220]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <ErrorMessage message="Event not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400">
              <Link href="/" className="hover:text-white">
                Event Management
              </Link>
              <span>/</span>
              <Link href="/" className="hover:text-white">
                Events
              </Link>
              <span>/</span>
              <span className="text-white">Event Details</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Event Details</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
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
            <Button
              variant="secondary"
              onClick={() => router.push(`/events/${event.id}/edit`)}
              className="flex-1 sm:flex-none border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 sm:flex-none border border-rose-500/40 bg-rose-600 text-white hover:bg-rose-700 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Hero and summary */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1526]/80 via-[#0b1220]/90 to-[#0a1020]/90 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.85)]"
          >
            <div className="relative h-48 sm:h-64 w-full overflow-hidden">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
                  <svg
                    className="h-16 w-16 sm:h-20 sm:w-20 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.15),transparent_45%)]" />
            </div>

            <div className="space-y-3 sm:space-y-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4b99] to-[#0f1b3d] text-sm sm:text-base font-semibold shadow-inner">
                  {event.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-2">
                    {event.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold ${statusInfo?.colorClass ?? ''}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo?.dotClass ?? ''}`} />
                      {statusInfo?.label ?? 'Upcoming'}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-slate-200 border border-white/10">
                      Draft
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300">
                {event.description}
              </p>

              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-200">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-blue-200 border border-white/10">
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Date Range (Local)</p>
                    <p className="font-semibold text-xs sm:text-sm break-words">{formatRange(event.startDate, event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-200">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-emerald-200 border border-white/10">
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l9 4.5L12 11 3 6.5 12 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 15l9-4.5M3 14.5L12 19l9-4.5" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="font-semibold capitalize text-xs sm:text-sm">{event.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-200">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-sky-200 border border-white/10">
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="font-semibold text-xs sm:text-sm break-words">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-200">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-amber-200 border border-white/10">
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Max Attendees</p>
                    <p className="font-semibold text-xs sm:text-sm">
                      {event.maxAttendees ? event.maxAttendees.toLocaleString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Event summary side panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#111c30]/95 via-[#0f182c]/90 to-[#0b1222]/90 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.85)]"
          >
            <div className="border-b border-white/5 px-5 py-4">
              <h3 className="text-sm font-semibold text-white">Event Summary</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Total Tickets Sold</p>
                  <p className="text-xl font-semibold text-white">
                    {ticketsSold ? ticketsSold.toLocaleString() : '—'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M9 21V3m4 18V8m4 13V13" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Total Revenue (est.)</p>
                  <p className="text-xl font-semibold text-white">
                    {estimatedRevenue ? `$${estimatedRevenue.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3 1.343 3 3-1.343 3-3 3m0-12c1.657 0 3-1.343 3-3S13.657 2 12 2s-3 1.343-3 3 1.343 3 3 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Unique Attendees (est.)</p>
                  <p className="text-xl font-semibold text-white">
                    {uniqueAttendees ? uniqueAttendees.toLocaleString() : '—'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sky-200">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M12 7a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Teams and tags */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#0d1526]/80 p-5 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Teams</h4>
              <button className="text-xs text-blue-300 hover:text-blue-200">See all</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4b99] to-[#0f1b3d] text-sm font-semibold">
                  {event.title.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-200">{event.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7734a6] to-[#3a1a59] text-sm font-semibold">
                  {event.category.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-200 capitalize">{event.category}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0d1526]/80 p-5 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Tags</h4>
              <button className="text-xs text-blue-300 hover:text-blue-200">Add</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[event.category, 'VIP', 'Sports', 'Frequent Buyer', 'Promo Code']
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Ticket collections area */}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d1526]/80 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)]">
          <div className="flex flex-wrap gap-2 border-b border-white/5 px-5 py-3 text-sm font-semibold text-slate-300">
            <button className="rounded-lg bg-white/10 px-3 py-1.5 text-white shadow-inner border border-white/10">
              Ticket Collections
            </button>
            <button className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-white">Ticket Categories</button>
            <button className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-white">Attendee List</button>
            <button className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-white">Promotions / Discounts</button>
            <button className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-white">Seat chart</button>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <h4 className="text-sm font-semibold text-white">Ticket Collection</h4>
            <button className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600">
              <span className="flex h-5 w-5 items-center justify-center rounded border border-white/30 bg-white/10 text-white">+</span>
              Attach Collection
            </button>
          </div>

          <div className="px-5 pb-8">
            <div className="rounded-xl border border-dashed border-white/15 bg-[#0b1220] px-6 py-10 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-200">No Ticket Collection Attached</p>
              <p className="mt-2 text-sm text-slate-400">
                Attach a ticket collection to enable publishing and sales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteEvent.isPending}
        eventTitle={event.title}
      />
    </div>
  );
}