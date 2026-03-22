import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';
import { findById, upsertUser } from '../services/userService';

const COOKIE_NAME = 'eventping_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth environment variables are required');
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

function signSessionToken(payload: {
  sub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export const authRouter = Router();

authRouter.post('/google', (_req, res) => {
  const client = createOAuthClient();
  const url = client.generateAuthUrl({
    scope: ['email', 'profile'],
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(url);
});

authRouter.get('/callback', async (req, res, next) => {
  try {
    const code = req.query.code;

    if (typeof code !== 'string' || code.length === 0) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Authorization code is required.' } });
      return;
    }

    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Google authentication failed.' } });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.name) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Google authentication failed: missing user info.' } });
      return;
    }

    const user = await upsertUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture ?? null,
    });

    const token = signSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_MS,
    });

    res.redirect(process.env.FRONTEND_URL ?? '/');
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await findById(req.user!.id);

    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found.' } });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ success: true });
});
