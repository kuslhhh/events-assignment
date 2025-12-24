import type { Event } from '@/db/schema';
import type { ApiResponse } from '@/types/api.types';
import type { CreateEventInput, UpdateEventInput } from '@/lib/validations/event.validation';

const API_BASE = '/api';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data.data;
}

export const eventsApi = {
  /**
   * Get all events
   */
  getAll: async (): Promise<Event[]> => {
    return fetchApi<Event[]>('/events');
  },

  /**
   * Get single event by ID
   */
  getById: async (id: number): Promise<Event> => {
    return fetchApi<Event>(`/events/${id}`);
  },

  /**
   * Create new event
   */
  create: async (data: CreateEventInput): Promise<Event> => {
    return fetchApi<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update event
   */
  update: async (id: number, data: UpdateEventInput): Promise<Event> => {
    return fetchApi<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete event
   */
  delete: async (id: number): Promise<{ id: number }> => {
    return fetchApi<{ id: number }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};