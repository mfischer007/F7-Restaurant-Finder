import rateLimit from 'express-rate-limit';
import { cfg } from '../config.js';

export function makeLimiter() {
  return rateLimit({
    windowMs: cfg.rlWindowMin * 60 * 1000,
    max: cfg.rlMax,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.header('x-api-key') || req.ip),
    message: { error: 'rate_limited', message: 'Too many requests, slow down.' }
  });
}
