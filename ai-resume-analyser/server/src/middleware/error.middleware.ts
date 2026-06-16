import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('[Error]', {
    message: err.message,
    stack: isDev ? err.stack : undefined,
    code: err.code,
  });

  res.status(err.status ?? 500).json({
    error: isDev ? err.message : 'Something went wrong',
    code: err.code ?? 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
}
