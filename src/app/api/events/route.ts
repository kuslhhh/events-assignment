import { NextRequest } from 'next/server';
import { eventService } from '@/services/event.service';
import { createEventSchema } from '@/lib/validations/event.validation';
import { successResponse, handleApiError } from '@/lib/api-utils';

/**
 * GET /api/events - Get all events
 */
export async function GET() {
  try {
    const events = await eventService.getAllEvents();
    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/events - Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createEventSchema.parse(body);

    // Convert string dates to Date objects
    const eventData = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      maxAttendees: validatedData.maxAttendees ?? null,
      imageUrl: validatedData.imageUrl ?? null,
      isActive: validatedData.isActive ?? true,
    };

    // Create event
    const event = await eventService.createEvent(eventData);

    return successResponse(event, 'Event created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}