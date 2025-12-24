'use client';

import { use } from 'react';
import Link from 'next/link';
import { useEvent } from '@/hooks/use-event';
import { EventForm } from '@/component/event/event-form';
import { LoadingSpinner } from '@/component/ui/loading-spinner';
import { ErrorMessage } from '@/component/ui/error-message';

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditEventPage({ params }: EditEventPageProps) {
  const { id } = use(params);
  const eventId = parseInt(id);
  const { data: event, isLoading, error, refetch } = useEvent(eventId);

  return (
    <div className="h-screen overflow-hidden bg-[#0b1220] text-white">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-4 px-5 py-5">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <p className="text-xs text-slate-400">Event Management</p>
              <h1 className="text-xl font-semibold text-white">Edit Event</h1>
              <p className="text-sm text-slate-400">
                Update the details of your event
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Auto-save enabled
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0d1526]/80 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]">
          <div className="flex-shrink-0 border-b border-white/5 px-5 py-3">
            <h2 className="text-base font-semibold text-white">Event Details</h2>
            <p className="text-xs text-slate-400">
              Make changes and save your event information.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {isLoading && <LoadingSpinner />}

            {error && (
              <ErrorMessage
                message={error.message}
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !error && event && (
              <EventForm event={event} mode="edit" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}