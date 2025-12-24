import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api.types';

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return errorResponse(
      'Validation failed',
      400,
      error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse('An unexpected error occurred', 500);
}