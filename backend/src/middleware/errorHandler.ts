import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  error: string;
  timestamp: string;
  path?: string;
  method?: string;
  stack?: string;
}

/**
 * Global error handler middleware for Express
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  const errorResponse: ErrorResponse = {
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Determine status code
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json(errorResponse);
} 
