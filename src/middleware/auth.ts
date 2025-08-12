import { RequestHandler } from 'express';
import { cfg } from '../config.js';

/**
 * API key auth via X-API-Key header.
 * If allowPublic=true, requests with the public key are allowed for GET-only endpoints.
 */
export function requireApiKey(opts: { allowPublic: boolean }): RequestHandler {
  return (req, res, next) => {
    const key = (req.header('x-api-key') || '').trim();
    const isPrivate = cfg.apiKeys.includes(key);
    const isPublic = !!cfg.publicKey && key === cfg.publicKey;

    if (isPrivate) return next();
    if (opts.allowPublic && isPublic && req.method === 'GET') return next();

    return res.status(401).json({ error: 'unauthorized', message: 'Missing or invalid API key' });
  };
}
