import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { passport } from '../lib/passport';
import { prisma } from '../lib/prisma';
import * as AuthService from '../services/auth.service';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().min(1).max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body.email, req.body.password, req.body.name);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN')
      return res.status(409).json({ error: 'Email already registered' });
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS')
      return res.status(401).json({ error: 'Invalid email or password' });
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const tokens = await AuthService.refresh(refreshToken);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (_req, res) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me — return current user from access token
router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  const authReq = req as AuthRequest;
  try {
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: { id: true, email: true, name: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/google — redirect to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback — handle Google OAuth callback
router.get('/google/callback', (req: Request, res: Response, next) => {
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

  passport.authenticate('google', { session: false }, (err: Error | null, user: any) => {
    if (err || !user) {
      return res.redirect(`${clientUrl}/auth/callback?error=google_auth_failed`);
    }
    const { accessToken, refreshToken } = user;
    return res.redirect(
      `${clientUrl}/auth/callback` +
        `?accessToken=${encodeURIComponent(accessToken)}` +
        `&refreshToken=${encodeURIComponent(refreshToken)}`
    );
  })(req, res, next);
});

export default router;
