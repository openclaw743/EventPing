import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface HttpError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  error: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.errors.map((issue) => issue.message).join(', '),
      },
    });
    return;
  }

  const statusCode = error.statusCode ?? 500;
  const code = error.code ?? 'INTERNAL_SERVER_ERROR';
  const message = statusCode >= 500 ? 'Internal server error.' : error.message;

  if (statusCode >= 500) {
    console.error('[ErrorHandler]', error);
  }

  res.status(statusCode).json({ error: { code, message } });
}
