import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = (err as any)?.status || 500;
  res.status(status).json({ error: 'error', message: (err as any)?.message || 'Something went wrong' });
};
