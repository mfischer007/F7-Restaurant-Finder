import express from 'express';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { docsRouter } from './openapi.js';
import { makeLimiter } from './middleware/rateLimit.js';

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json());
  app.use(pinoHttp());

  // Serve minimal UI (static)
  app.use('/ui', express.static('public'));

  // Global rate limiter
  app.use(makeLimiter());

  // API routes
  app.use('/api', routes);

  // OpenAPI docs
  app.use('/api/docs', docsRouter);

  app.use(errorHandler);
  return app;
}
