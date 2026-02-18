export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export class ApiResponseError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

export function successResponse<T>(data: T, statusCode: number = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  statusCode: number = 500
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

export function createApiResponse<T>(data: T | null, error?: ApiError): ApiResponse<T> {
  if (error) {
    return errorResponse(error.code, error.message, error.details);
  }
  return successResponse(data as T);
}
