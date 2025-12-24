import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api-client';
import type { CreateEventInput, UpdateEventInput } from '@/lib/validations/event.validation';

const QUERY_KEYS = {
  events: ['events'] as const,
  event: (id: number) => ['events', id] as const,
};

/**
 * Hook to fetch all events
 */
export function useEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.events,
    queryFn: eventsApi.getAll,
  });
}

/**
 * Hook to fetch single event
 */
export function useEvent(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.event(id),
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => eventsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
    },
  });
}

/**
 * Hook to update event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventInput }) =>
      eventsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and specific event
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.event(variables.id) });
    },
  });
}

/**
 * Hook to delete event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventsApi.delete(id),
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
    },
  });
}