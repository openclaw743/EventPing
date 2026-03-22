import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const store = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export function clearRateLimitStore(): void {
  store.clear();
}

export function rsvpRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const existing = store.get(ip);

  const entry: RateLimitEntry =
    !existing || now >= existing.resetAt
      ? { count: 0, resetAt: now + WINDOW_MS }
      : existing;

  entry.count += 1;
  store.set(ip, entry);

  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const resetSeconds = Math.ceil(entry.resetAt / 1000);

  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(resetSeconds));

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait before submitting again.' },
    });
    return;
  }

  next();
}
