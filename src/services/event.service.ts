import { db } from '@/db';
import { events, type Event, type NewEvent } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type CreateEventData = Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventData = Partial<CreateEventData>;

export const eventService = {
  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return event;
  },

  /**
   * Get all events
   */
  async getAllEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
  },

  /**
   * Get event by ID
   */
  async getEventById(id: number): Promise<Event | null> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    return event || null;
  },

  /**
   * Update event by ID
   */
  async updateEvent(id: number, data: UpdateEventData): Promise<Event | null> {
    const [updated] = await db
      .update(events)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return updated || null;
  },

  /**
   * Delete event by ID
   */
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    return result.length > 0;
  },
};