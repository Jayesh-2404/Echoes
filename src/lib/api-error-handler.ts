import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponseError } from './api-response';

export type ApiErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'VALIDATION_ERROR';

export interface RequestContext {
  request: NextRequest;
  params?: Record<string, string>;
}

export function withErrorHandling(
  handler: (context: RequestContext) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean;
    allowedMethods?: string[];
  }
) {
  return async (request: NextRequest, params?: Record<string, string>) => {
    try {
      if (options?.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { success: false, error: { code: 'BAD_REQUEST', message: 'Method not allowed' } },
          { status: 405 }
        );
      }

      return await handler({ request, params });
    } catch (error) {
      return handleError(error, request);
    }
  };
}

function handleError(error: unknown, request: NextRequest): NextResponse {
  console.error(`[API Error] ${request.method} ${request.nextUrl.pathname}:`, error);

  if (error instanceof ApiResponseError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized' || error.message === 'Access Denied') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 401 }
      );
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 403 }
      );
    }

    if (error.message === 'Not Found' || error.message === 'Message not Found') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      meta: { timestamp: new Date().toISOString() },
    },
    { status: 500 }
  );
}
