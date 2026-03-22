import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.eventping_session as string | undefined;

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new Error('JWT_SECRET environment variable is required'));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as SessionPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.avatarUrl ?? null,
    };
    next();
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session.' } });
  }
}
