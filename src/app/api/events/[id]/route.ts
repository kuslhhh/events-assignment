import { NextRequest } from 'next/server';
import { eventService } from '@/services/event.service';
import { updateEventSchema, eventIdSchema } from '@/lib/validations/event.validation';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/events/:id - Get single event
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { id } = eventIdSchema.parse(params);

    const event = await eventService.getEventById(id);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return successResponse(event);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/events/:id - Update event
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { id } = eventIdSchema.parse(params);
    const body = await request.json();

    // Validate input
    const validatedData = updateEventSchema.parse(body);

    // Convert string dates to Date objects if present
    const eventData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    };

    // Update event
    const event = await eventService.updateEvent(id, eventData);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return successResponse(event, 'Event updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/events/:id - Delete event
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { id } = eventIdSchema.parse(params);

    const deleted = await eventService.deleteEvent(id);

    if (!deleted) {
      return errorResponse('Event not found', 404);
    }

    return successResponse({ id }, 'Event deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}