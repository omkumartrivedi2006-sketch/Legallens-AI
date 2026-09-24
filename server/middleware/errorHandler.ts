import { Request, Response, NextFunction } from 'express';

/**
 * Generates a safe, human-readable error reference ID in format ERR-XXXXXX
 */
export function generateErrorId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ERR-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Production-ready Express error handler that prevents stack trace or sensitive
 * data leakage to clients while logging detailed diagnostic information server-side.
 */
export function productionErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorId = generateErrorId();
  const statusCode = err?.statusCode || (typeof err?.status === 'number' ? err.status : 500);

  // Safe internal server-side logging tagged with reference ID
  console.error(`[${errorId}] Handled Exception:`, {
    path: req.path,
    method: req.method,
    statusCode,
    message: err?.message || 'Unknown internal error',
    name: err?.name,
    stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
  });

  // Client-safe response: Never expose internal database strings, paths, or secrets
  const clientMessage =
    statusCode < 500 && err?.message
      ? err.message
      : `An unexpected system error occurred. Please quote reference ID ${errorId} if this issue persists.`;

  res.status(statusCode).json({
    error: clientMessage,
    referenceId: errorId,
    timestamp: new Date().toISOString(),
  });
}
